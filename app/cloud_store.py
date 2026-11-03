"""User-scoped Supabase REST access. Always use the verified user's JWT, never service_role."""
import contextvars
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import quote

import httpx
from fastapi import HTTPException

identity=contextvars.ContextVar('reader_identity')
BASE=os.getenv('SUPABASE_URL','').rstrip('/')
KEY=os.getenv('SUPABASE_PUBLISHABLE_KEY','')
BUCKET='reader-originals'
ALLOWED={'.txt','.pdf','.md'}


def call(method,path,**kwargs):
    user,token=identity.get()
    headers={'apikey':KEY,'Authorization':'Bearer '+token}
    headers.update(kwargs.pop('headers',{}))
    try:
        r=httpx.request(method,BASE+path,headers=headers,timeout=60,follow_redirects=False,**kwargs)
    except httpx.HTTPError:raise HTTPException(503,'云端存储连接失败，请稍后重试') from None
    if not r.is_success:
        if path.startswith('/storage/') and method=='GET' and r.status_code==400:
            try:
                if str(r.json().get('statusCode'))=='404':raise HTTPException(404,'文件不存在或无权访问')
            except (ValueError,AttributeError):pass
        if r.status_code==404:raise HTTPException(404,'文件不存在或无权访问')
        if r.status_code==409:raise HTTPException(409,'记录已存在，请刷新书架后重试')
        raise HTTPException(503,'云端数据尚未就绪，请确认已执行建表与权限脚本')
    return r


def table(name,method='GET',params=None,data=None):
    user,_=identity.get()
    params={**(params or {}),'owner_id':'eq.'+user}
    if data is not None:data={**data,'owner_id':user}
    r=call(method,'/rest/v1/reader_'+name,params=params,json=data,headers={'Prefer':'return=representation,resolution=merge-duplicates'})
    return r.json() if r.content else []


def get(book_id):
    rows=table('books',params={'id':'eq.'+book_id})
    if not rows:return None
    b=rows[0]
    b.update(warnings=json.dumps(b.get('warnings',[]),ensure_ascii=False),sections=json.dumps(b.get('sections',[]),ensure_ascii=False),error=None)
    return b


def object_path(book_id,kind):
    return identity.get()[0]+'/'+book_id+'/'+kind


def object_call(method,path,data=None,content_type='application/octet-stream'):
    if not path.startswith(identity.get()[0]+'/'):raise HTTPException(403,'无权访问此文件')
    return call(method,'/storage/v1/object/'+BUCKET+'/'+quote(path,safe='/'),content=data,
                headers={'Content-Type':content_type,'x-upsert':'true'})


def ingest(source,filename,converted=None,legacy_id=None):
    data=Path(source).read_bytes();suffix=Path(filename).suffix.lower()
    if not 0<len(data)<=50*1024*1024:raise ValueError('云端单份原著上限50MB')
    digest=hashlib.sha256(data).hexdigest();identifier=digest[:24]
    old=get(identifier)
    if old:return {'id':identifier,'title':old['title'],'status':old['status'],'existing':True}
    if suffix not in ALLOWED:raise ValueError('云端支持 TXT、Markdown 和浏览器提取后的 PDF')
    if not converted or not converted.get('complete'):
        if suffix not in {'.txt','.md'}:raise ValueError('请用网页导入文字型 PDF；扫描件请先在本地完成 OCR 后上传文本')
        text=None
        for encoding in (['utf-16'] if data[:2] in (b'\xff\xfe',b'\xfe\xff') else ['utf-8-sig','gb18030']):
            try:text=data.decode(encoding);break
            except UnicodeError:pass
        converted={'text':text,'sections':[],'warnings':[]}
    text=converted.get('text')
    if not text or not text.strip() or len(text)>2000000:raise ValueError('正文为空或超过200万字')
    path=object_path(identifier,'original'+suffix)
    object_call('POST',path,data)
    b=table('books','POST',data={'id':identifier,'title':Path(filename).stem,'filename':Path(filename).name,'format':suffix[1:],
           'sha256':digest,'object_path':path,'text_content':text,'sections':converted.get('sections',[]),'warnings':converted.get('warnings',[]),'status':'ready'})[0]
    return {'id':identifier,'title':b['title'],'status':'ready'}


def rows(sql,params=(),one=False):
    """Explicit compatibility for existing repository operations; unknown SQL fails closed."""
    statement=' '.join(sql.split()).lower()
    out=[]
    if statement.startswith('select id,title,filename,format,status,error,warnings,created_at from books'):
        out=table('books',params={'select':'id,title,filename,format,status,warnings,created_at','order':'created_at.desc'})
        term=params[0].strip('%').lower()
        out=[dict(b,warnings=json.dumps(b.get('warnings',[]),ensure_ascii=False),error=None) for b in out if term in b['title'].lower()]
    elif statement.startswith('select value from preferences'):
        key=params[0] if params else 'interpretations'
        out=[{'value':json.dumps(r['value'],ensure_ascii=False)} for r in table('preferences',params={'name':'eq.'+key})]
    elif statement.startswith('insert into preferences'):
        key,value=params if len(params)==2 else ('interpretations',params[0])
        out=table('preferences','POST',params={'on_conflict':'owner_id,name'},data={'name':key,'value':json.loads(value)})
    elif statement.startswith('select page,notes from reading_state'):
        out=[dict(r,notes=json.dumps(r['notes'],ensure_ascii=False)) for r in table('state',params={'book_id':'eq.'+params[0]})]
    elif statement.startswith('insert into reading_state'):
        book,page,notes=params
        out=table('state','POST',params={'on_conflict':'owner_id,book_id'},data={'book_id':book,'page':page,'notes':json.loads(notes)})
    elif statement.startswith('insert into annotations'):
        book,page,quote_,question,response=params
        out=table('annotations','POST',data={'book_id':book,'page':page,'quote':quote_,'user_input':question,'response':json.loads(response)})
    elif statement.startswith('select * from annotations'):
        out=[dict(r,response=json.dumps(r['response'],ensure_ascii=False)) for r in table('annotations',params={'book_id':'eq.'+params[0],'order':'created_at.asc'})]
    elif statement.startswith('update books set title='):
        out=table('books','PATCH',params={'id':'eq.'+params[1]},data={'title':params[0]})
    elif statement.startswith("update books set status='queued'"):
        raise HTTPException(422,'云端请重新导入已提取正文的文件；扫描版先在本地完成 OCR')
    else:raise HTTPException(503,'此数据操作尚未支持云端模式')
    return (out[0] if out else None) if one else out
