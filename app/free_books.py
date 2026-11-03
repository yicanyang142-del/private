"""Small public-domain library; catalog API and a fixed official-listed download mirror."""
import asyncio
import hashlib
import json
import re
import tempfile
import time
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from config import WORK
import store

router=APIRouter(prefix='/api/free-books')
CURATED=[
    {'id':1497,'title':'The Republic','chinese':'理想国','authors':['Plato'],'languages':['en'],'copyright':False},
    {'id':1974,'title':'The Poetics of Aristotle','chinese':'诗学','authors':['Aristotle'],'languages':['en'],'copyright':False},
    {'id':34901,'title':'On Liberty','chinese':'论自由','authors':['John Stuart Mill'],'languages':['en'],'copyright':False},
]
_cache={}
_download_lock=asyncio.Lock()


def normalize(item):
    if item.get('copyright') is not False or item.get('media_type','Text')!='Text':return None
    identifier=item.get('id')
    if type(identifier) is not int or not 1<=identifier<=1000000:return None
    formats=item.get('formats') or {}
    if not any(k.startswith('text/plain') for k in formats):return None
    return {'id':identifier,'title':str(item.get('title',''))[:400],
            'authors':[str(a.get('name',''))[:200] for a in item.get('authors',[]) if isinstance(a,dict)],
            'languages':item.get('languages',[]),'copyright':False,
            'url':f'https://www.gutenberg.org/ebooks/{identifier}'}


async def catalog(search):
    key=search.strip()[:150]
    if not key:return {'books':[{**b,'url':f'https://www.gutenberg.org/ebooks/{b["id"]}'} for b in CURATED], 'notice':'精选公版英文版本，可导入正文。中文书名仅帮助检索，不代表中文译本。'}
    if key in _cache and time.monotonic()-_cache[key][0]<600:return _cache[key][1]
    try:
        async with httpx.AsyncClient(timeout=15,follow_redirects=False) as c:
            r=await c.get('https://gutendex.com/books/',params={'search':key,'copyright':'false','mime_type':'text/plain'},headers={'User-Agent':'WenlunLocalReader/1.0'})
            r.raise_for_status()
            results=r.json()['results']
        books=[b for item in results[:16] if (b:=normalize(item))]
        result={'books':books,'notice':'Gutendex 公开书目；公版状态按美国目录标注，具体版本仍请核对来源。'}
    except (httpx.HTTPError,ValueError,KeyError,TypeError):
        matches=[{**b,'url':f'https://www.gutenberg.org/ebooks/{b["id"]}'} for b in CURATED if key.lower() in ' '.join([b['title'],b['chinese'],*b['authors']]).lower()]
        result={'books':matches,'notice':'在线目录暂不可用，当前显示本地精选书目中的匹配结果。可试 Plato / Aristotle / Mill 或对应中文书名。'}
    _cache[key]=(time.monotonic(),result)
    return result


@router.get('')
async def search_books(q:str=''):
    return await catalog(q)


class ImportBook(BaseModel):
    id:int=Field(ge=1,le=1000000)


async def metadata(identifier):
    curated=next((b for b in CURATED if b['id']==identifier),None)
    if curated:return curated
    try:
        async with httpx.AsyncClient(timeout=15,follow_redirects=False) as c:
            r=await c.get(f'https://gutendex.com/books/{identifier}/')
            r.raise_for_status()
            book=normalize(r.json())
        if not book:raise HTTPException(422,'此版本没有可确认的公版纯文本，不能直接导入')
        return book
    except (httpx.HTTPError,ValueError):
        raise HTTPException(502,'无法核对该版本的书目信息，请稍后重试') from None


@router.post('/import')
async def import_book(payload:ImportBook):
    identifier=payload.id
    # Store provenance separately from text hashes; duplicate imports keep reading state.
    old=store.rows('SELECT value FROM preferences WHERE name=?',(f'free-book:{identifier}',),one=True)
    if old:
        previous=json.loads(old['value'])
        existing=store.get(previous['book_id'])
        if existing:return {'book':{k:existing[k] for k in ['id','title','format','status']},'existing':True}
    book=await metadata(identifier)
    async with _download_lock:
        try:
            data=bytearray()
            async with httpx.AsyncClient(timeout=45,follow_redirects=False) as c:
                # ODU is listed at https://www.gutenberg.org/MIRRORS.ALL.
                async with c.stream('GET',f'https://mirror.cs.odu.edu/gutenberg-epub/{identifier}/pg{identifier}.txt') as r:
                    r.raise_for_status()
                    async for chunk in r.aiter_bytes():
                        data.extend(chunk)
                        if len(data)>12*1024*1024:raise HTTPException(413,'该书超过当前在线导入上限12MB')
        except httpx.HTTPError:
            raise HTTPException(502,'书源镜像暂未提供此版本的纯文本，请从来源页下载后用右上角导入') from None
    try:text=bytes(data).decode('utf-8-sig')
    except UnicodeError:raise HTTPException(422,'书源文本编码不受支持，请从来源页选择其他版本') from None
    if len(text)<200 or 'PROJECT GUTENBERG' not in text[:3000].upper() or '<html' in text[:500].lower():
        raise HTTPException(422,'下载内容不是预期的 Gutenberg 纯文本，本次未导入')
    with tempfile.TemporaryDirectory(dir=WORK) as folder:
        path=Path(folder)/'book.txt'
        path.write_bytes(bytes(data))
        result=await asyncio.to_thread(store.ingest,path,f'gutenberg-{identifier}.txt')
    title=(book.get('chinese','')+' · ' if book.get('chinese') else '')+book['title']
    store.rows('UPDATE books SET title=? WHERE id=? RETURNING id',(title,result['id']))
    provenance={'book_id':result['id'],'source':'Project Gutenberg / ODU mirror','source_id':identifier,
                'url':f'https://www.gutenberg.org/ebooks/{identifier}','title':book['title'],
                'authors':book['authors'],'languages':book['languages'],'copyright':'Public domain in the USA; check edition and local requirements',
                'sha256':hashlib.sha256(data).hexdigest()}
    store.rows('INSERT INTO preferences(name,value) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value RETURNING name',
               (f'free-book:{identifier}',json.dumps(provenance,ensure_ascii=False)))
    return {'book':{'id':result['id'],'title':title,'format':'txt','status':'ready'},'existing':False}
