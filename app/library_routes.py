import asyncio
import hashlib
import json
import tempfile
from pathlib import Path
from urllib.parse import unquote
from starlette.datastructures import UploadFile

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from config import WORK, MAX_BYTES, PAGE_SIZE
import store

router=APIRouter(prefix='/api')


@router.get('/preferences/interpretations')
def get_interpretations():
    row=store.rows("SELECT value FROM preferences WHERE name='interpretations'",one=True)
    return {'value':json.loads(row['value']) if row else {}}


@router.put('/preferences/interpretations')
def save_interpretations(payload:dict[str,str]):
    if len(payload)>100 or any(len(k)>200 or len(v)>200 for k,v in payload.items()):
        raise HTTPException(422,'观点选择内容过长')
    store.rows("INSERT INTO preferences(name,value) VALUES('interpretations',?) ON CONFLICT(name) DO UPDATE SET value=excluded.value RETURNING name",(json.dumps(payload,ensure_ascii=False),))
    return {'saved':True}


def get_book(book_id):
    result=store.get(book_id)
    if not result:
        raise HTTPException(404,'书籍不存在')
    return result


def get_page(book,page):
    if book['status']!='ready':
        raise HTTPException(409,'正文尚未转换完成，请稍后刷新书架')
    total=max(1,(len(book['text_content'])+PAGE_SIZE-1)//PAGE_SIZE)
    if not 1<=page<=total:
        raise HTTPException(404,'页码不存在')
    return {'id':book['id'],'title':book['title'],'page':page,'total':total,
            'text':book['text_content'][(page-1)*PAGE_SIZE:page*PAGE_SIZE],
            'warnings':json.loads(book['warnings'])}


@router.get('/books')
def books(q:str=''):
    result=store.rows('SELECT id,title,filename,format,status,error,warnings,created_at FROM books WHERE title LIKE ? ORDER BY created_at DESC',('%'+q[:200]+'%',))
    for book in result:
        book['warnings']=json.loads(book['warnings'])
    return {'books':result}


@router.post('/books')
async def upload(request:Request):
    filename=Path(unquote(request.headers.get('X-File-Name','')).replace('\\','/')).name
    if Path(filename).suffix.lower() not in store.ALLOWED:
        raise HTTPException(422,'请选择 PDF、TXT、DOCX、EPUB、Markdown 或常见图片')
    with tempfile.TemporaryDirectory(dir=WORK) as folder:
        source=Path(folder)/'upload'
        size=0
        with source.open('wb') as stream:
            async for chunk in request.stream():
                size+=len(chunk)
                if size>MAX_BYTES:
                    raise HTTPException(413,'文件超过配置的上传大小上限')
                stream.write(chunk)
        if not size:
            raise HTTPException(422,'上传文件为空')
        try:
            return await asyncio.to_thread(store.ingest,source,filename)
        except ValueError as error:
            raise HTTPException(422,str(error)) from None


class BrowserText(BaseModel):
    text:str=Field(min_length=1,max_length=2000000)
    sections:list[dict]=Field(default_factory=list,max_length=2500)
    warnings:list[str]=Field(default_factory=list,max_length=100)


@router.post('/books/browser-import')
async def browser_import(request:Request):
    # Browser sends original file + extracted text in one atomic import.
    length=request.headers.get('content-length')
    if length is None:raise HTTPException(411,'导入请求缺少长度信息，请使用网页重新上传')
    try:size=int(length)
    except ValueError:raise HTTPException(400,'无效的上传长度') from None
    if size>MAX_BYTES+20*1024*1024:raise HTTPException(413,'导入内容过大，请拆分文献')
    async with request.form(max_files=1,max_fields=1,max_part_size=20*1024*1024) as form:
        original=form.get('file');metadata=form.get('metadata')
        if not isinstance(original,UploadFile) or not isinstance(metadata,str):
            raise HTTPException(422,'请选择文献文件并完成浏览器提取')
        filename=Path((original.filename or '').replace('\\','/')).name
        if Path(filename).suffix.lower() not in ('.pdf','.txt'):
            raise HTTPException(422,'浏览器导入仅支持 TXT 和 PDF')
        try:parsed=BrowserText.model_validate_json(metadata)
        except ValueError:raise HTTPException(422,'提取结果不完整或正文过长') from None
        if not parsed.text.strip() or '\0' in parsed.text:
            raise HTTPException(422,'没有可阅读的有效正文')
        with tempfile.TemporaryDirectory(dir=WORK) as folder:
            source=Path(folder)/'original';count=0
            with source.open('wb') as stream:
                while chunk:=await original.read(1024*1024):
                    count+=len(chunk)
                    if count>MAX_BYTES:raise HTTPException(413,'原文件超过上传大小上限')
                    stream.write(chunk)
            if not count:raise HTTPException(422,'原文件为空')
            # Preserve established text and its annotation offsets on duplicate imports.
            with source.open('rb') as stream:digest=hashlib.file_digest(stream,'sha256').hexdigest()
            existing=await asyncio.to_thread(store.get,digest[:24])
            if existing and existing['status']=='ready':
                return {'id':existing['id'],'title':existing['title'],'status':'ready','existing':True}
            if existing and existing['status']=='processing':
                raise HTTPException(409,'这份文献正在本机转换中，请稍后从书架打开')
            converted={**parsed.model_dump(),'complete':True}
            return await asyncio.to_thread(store.ingest,source,filename,converted)


@router.get('/books/{book_id}/pages/{page}')
def page(book_id:str,page:int):
    return get_page(get_book(book_id),page)


@router.post('/books/{book_id}/retry')
def retry(book_id:str):
    get_book(book_id)
    row=store.rows("UPDATE books SET status='queued',error=NULL WHERE id=? AND status='failed' RETURNING id",(book_id,),one=True)
    if not row:
        raise HTTPException(409,'仅失败的转换任务可以重试')
    return {'queued':True}


class State(BaseModel):
    page:int=Field(ge=1)
    notes:list[dict]=Field(default_factory=list,max_length=1000)


@router.get('/books/{book_id}/state')
def state(book_id:str):
    get_book(book_id)
    row=store.rows('SELECT page,notes FROM reading_state WHERE book_id=?',(book_id,),one=True)
    return {'page':row['page'],'notes':json.loads(row['notes'])} if row else {'page':1,'notes':[]}


@router.put('/books/{book_id}/state')
def save_state(book_id:str,payload:State):
    get_page(get_book(book_id),payload.page)
    notes=json.dumps(payload.notes,ensure_ascii=False)
    if len(notes)>200000:
        raise HTTPException(413,'笔记内容过长')
    store.rows('''INSERT INTO reading_state(book_id,page,notes) VALUES(?,?,?)
       ON CONFLICT(book_id) DO UPDATE SET page=excluded.page,notes=excluded.notes,
       updated_at=CURRENT_TIMESTAMP RETURNING book_id''',(book_id,payload.page,notes))
    return {'saved':True}


class Annotation(BaseModel):
    page:int=Field(ge=1)
    quote:str=Field(min_length=1,max_length=12000)
    user_input:str=Field(default='',max_length=2000)
    response:dict


@router.post('/books/{book_id}/annotations')
def save_annotation(book_id:str,payload:Annotation):
    page=get_page(get_book(book_id),payload.page)
    if payload.quote not in page['text'] or payload.response.get('quote')!=payload.quote:
        raise HTTPException(422,'注解引用与这一页的原文不一致')
    response=json.dumps(payload.response,ensure_ascii=False)
    if len(response)>30000:
        raise HTTPException(413,'注解内容过长')
    row=store.rows('''INSERT INTO annotations(book_id,page,quote,user_input,response)
       VALUES(?,?,?,?,?) RETURNING id''',(book_id,payload.page,payload.quote,payload.user_input,response),one=True)
    return {'saved':True,'id':row['id']}


@router.get('/books/{book_id}/annotations')
def annotations(book_id:str):
    get_book(book_id)
    rows=store.rows('SELECT * FROM annotations WHERE book_id=? ORDER BY id',(book_id,))
    for row in rows:
        row['response']=json.loads(row['response'])
    return {'annotations':rows}


@router.post('/import-browser-data')
def import_browser_data(payload:dict[str,str]):
    raw=json.dumps(payload,ensure_ascii=False,sort_keys=True)
    if len(raw)>2000000 or any(not(k.startswith(('wl:page:','wl:notes:')) or k=='wenlun:interpretations') for k in payload):
        raise HTTPException(422,'请选择文论伴读的浏览器备份文件')
    digest=hashlib.sha256(raw.encode()).hexdigest()
    matched=0
    with store.db() as conn:
        if conn.execute('SELECT id FROM browser_imports WHERE id=?',(digest,)).fetchone():
            return {'already_imported':True,'matched':0}
        for legacy in {k.split(':',2)[2] for k in payload if k.startswith(('wl:page:','wl:notes:'))}:
            book=conn.execute('SELECT b.* FROM books b JOIN legacy_sources s ON s.book_id=b.id WHERE s.legacy_id=?',(legacy,)).fetchone()
            if not book:
                continue
            try:
                old_page=max(1,int(payload.get('wl:page:'+legacy,'1')))
                old_notes=json.loads(payload.get('wl:notes:'+legacy,'[]'))
                if not isinstance(old_notes,list):raise ValueError()
                notes=[{'page':n.get('page',1),'text':n.get('thought',''),'quote':n.get('context',''),'created_at':n.get('at')} for n in old_notes if isinstance(n,dict)]
            except (ValueError,TypeError):
                raise HTTPException(422,'备份中的阅读记录格式有误') from None
            total=max(1,(len(book['text_content'] or '')+PAGE_SIZE-1)//PAGE_SIZE)
            existing=conn.execute('SELECT notes FROM reading_state WHERE book_id=?',(book['id'],)).fetchone()
            combined=(json.loads(existing['notes']) if existing else [])+notes
            conn.execute('''INSERT INTO reading_state(book_id,page,notes) VALUES(?,?,?)
               ON CONFLICT(book_id) DO UPDATE SET notes=excluded.notes''',
               (book['id'],min(old_page,total),json.dumps(combined,ensure_ascii=False)))
            matched+=1
        conn.execute('INSERT INTO browser_imports(id,payload) VALUES(?,?)',(digest,raw))
        if 'wenlun:interpretations' in payload:
            try:
                views=json.loads(payload['wenlun:interpretations'])
                if not isinstance(views,dict) or len(views)>100 or not all(isinstance(k,str) and isinstance(v,str) and len(k)<=200 and len(v)<=200 for k,v in views.items()):
                    raise ValueError()
            except (ValueError,TypeError):
                raise HTTPException(422,'暂选观点备份格式有误') from None
            conn.execute("INSERT INTO preferences(name,value) VALUES('interpretations',?) ON CONFLICT(name) DO UPDATE SET value=excluded.value",(json.dumps(views,ensure_ascii=False),))
    return {'matched':matched,'backup_preserved':True}
