"""Cloud-only entry point: Supabase Auth + JWT-scoped REST/Storage. Local main is unchanged."""
import asyncio
import io
import json
import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlsplit
from uuid import UUID

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

ROOT=Path(__file__).resolve().parent.parent
load_dotenv(ROOT/'.env')
import cloud_store as storage
import library_routes
import dynamic_routes
import learning_routes
import free_books
import reading_routes
from config import prepare,WORK
from cover_routes import write_cover

# These modules only use store.get/rows/ingest; their checks stay in place.
for module in (library_routes,dynamic_routes,learning_routes,free_books):module.store=storage


def configured():return bool(storage.BASE and storage.KEY)


def missing_config():
    return [name for name,value in [('SUPABASE_URL',storage.BASE),('SUPABASE_PUBLISHABLE_KEY',storage.KEY)] if not value]


@asynccontextmanager
async def lifespan(app):
    # Read the running service environment at startup rather than retaining import-time values.
    storage.BASE=os.getenv('SUPABASE_URL','').strip().rstrip('/')
    storage.KEY=os.getenv('SUPABASE_PUBLISHABLE_KEY','').strip()
    prepare();tempfile.tempdir=str(WORK)
    key=os.getenv('SUPER_MIND_API_KEY','').strip()
    client=AsyncOpenAI(api_key=key,base_url=os.getenv('OPENAI_BASE_URL','https://space.ai-builders.com/backend/v1'),timeout=120,max_retries=0) if key else None
    app.state.openai_client=client
    try:yield
    finally:
        if client:await client.close()


app=FastAPI(title='文论伴读 · 私人书房',lifespan=lifespan,docs_url=None,redoc_url=None,openapi_url=None)


def set_session(response,session):
    response.set_cookie('reader_access',session['access_token'],httponly=True,secure=True,samesite='lax',max_age=3600,path='/')
    response.set_cookie('reader_refresh',session['refresh_token'],httponly=True,secure=True,samesite='lax',max_age=2592000,path='/')


async def auth_call(path,method='GET',token=None,data=None):
    headers={'apikey':storage.KEY}
    if token:headers['Authorization']='Bearer '+token
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            return await client.request(method,storage.BASE+'/auth/v1/'+path,headers=headers,json=data)
    except httpx.HTTPError:raise HTTPException(503,'登录服务暂时无法连接，请稍后重试') from None


@app.middleware('http')
async def cloud_security(request,call_next):
    host=request.url.hostname
    expected=os.getenv('RENDER_EXTERNAL_HOSTNAME','') or urlsplit(os.getenv('APP_URL','')).hostname
    if host not in {expected,'localhost','127.0.0.1','testserver'}:
        return JSONResponse({'detail':'不接受此访问域名'},status_code=403)
    origin=request.headers.get('origin')
    allowed={'https://'+host}
    if host in {'localhost','127.0.0.1','testserver'}:allowed.add(str(request.base_url).rstrip('/'))
    if request.method not in {'GET','HEAD','OPTIONS'} and origin and origin.rstrip('/') not in allowed:
        return JSONResponse({'detail':'不接受跨站请求'},status_code=403)
    marker=None;session=None
    try:
        if request.url.path.startswith('/api/') or request.url.path=='/chat':
            if not configured():raise HTTPException(503,'尚未配置 Supabase 连接')
            token=request.cookies.get('reader_access')
            user_response=await auth_call('user',token=token) if token else None
            if user_response is None or user_response.status_code==401 or user_response.status_code==403:
                refresh=request.cookies.get('reader_refresh')
                if refresh:
                    r=await auth_call('token?grant_type=refresh_token','POST',data={'refresh_token':refresh})
                    if r.is_success:
                        session=r.json();token=session['access_token'];user_response=await auth_call('user',token=token)
            if user_response is None or not user_response.is_success:
                raise HTTPException(401,'请先登录，或登录状态已过期')
            user=user_response.json()
            identifier=str(UUID(user['id']))
            marker=storage.identity.set((identifier,token));request.state.reader_user=user
        response=await call_next(request)
        if session:set_session(response,session)
    except HTTPException as e:response=JSONResponse({'detail':e.detail},status_code=e.status_code)
    except ValueError:response=JSONResponse({'detail':'输入内容无效或不受支持'},status_code=422)
    except Exception:response=JSONResponse({'detail':'服务暂时不可用，请稍后重试'},status_code=503)
    finally:
        if marker is not None:storage.identity.reset(marker)
    response.headers['Cache-Control']='private, no-store'
    response.headers['X-Content-Type-Options']='nosniff'
    response.headers['Referrer-Policy']='same-origin'
    response.headers['X-Frame-Options']='DENY'
    return response


@app.get('/healthz')
def health():return {'status':'ok','mode':'cloud','configured':configured(),'missing_variables':missing_config()}


@app.get('/auth/config')
def auth_config():return {'cloud':True,'configured':configured(),'missing_variables':missing_config(),'ai_configured':bool(os.getenv('SUPER_MIND_API_KEY','').strip())}


class Credentials(BaseModel):
    email:str=Field(min_length=3,max_length=254)
    password:str=Field(min_length=8,max_length=128)


@app.post('/auth/login')
async def login(payload:Credentials):
    if not configured():raise HTTPException(503,'尚未配置 Supabase')
    r=await auth_call('token?grant_type=password','POST',data=payload.model_dump())
    if not r.is_success:raise HTTPException(400,'邮箱或密码不正确，或邮箱尚未验证。请检查后重试。')
    session=r.json()
    if not session.get('access_token') or not session.get('refresh_token'):
        raise HTTPException(401,'登录未获得有效凭证，请重试')
    verified=await auth_call('user',token=session['access_token'])
    if not verified.is_success or not verified.json().get('email_confirmed_at'):
        raise HTTPException(401,'请先验证邮箱，再使用邮箱与密码登录')
    response=JSONResponse({'signed_in':True})
    set_session(response,session)
    return response


@app.post('/auth/register')
async def register(payload:Credentials):
    if not configured():raise HTTPException(503,'尚未配置 Supabase')
    site=os.getenv('APP_URL','https://'+os.getenv('RENDER_EXTERNAL_HOSTNAME','')).rstrip('/')
    r=await auth_call('signup?redirect_to='+site,'POST',data=payload.model_dump())
    if not r.is_success:raise HTTPException(400,'注册未完成：请检查邮箱、密码要求、邮件服务配置，或稍后再试。')
    session=r.json();response=JSONResponse({'message':'如果邮箱可注册，我们已发送验证邮件。请验证后返回登录。'})
    if session.get('access_token') and session.get('refresh_token'):
        set_session(response,session)
        return response
    return response


@app.post('/auth/logout')
async def logout(request:Request):
    token=request.cookies.get('reader_access')
    if token:
        try:await auth_call('logout','POST',token=token)
        except HTTPException:pass
    r=JSONResponse({'signed_out':True});r.delete_cookie('reader_access',path='/');r.delete_cookie('reader_refresh',path='/');return r


@app.get('/api/me')
def me(request:Request):return {'email':request.state.reader_user.get('email'),'cloud':True}


class RecoveryEmail(BaseModel):
    email:str=Field(min_length=3,max_length=254)


@app.post('/auth/resend')
async def resend(payload:RecoveryEmail):
    if not configured():raise HTTPException(503,'尚未配置 Supabase')
    site=os.getenv('APP_URL','https://'+os.getenv('RENDER_EXTERNAL_HOSTNAME','')).rstrip('/')
    r=await auth_call('resend?redirect_to='+site,'POST',data={'type':'signup','email':payload.email})
    if not r.is_success:raise HTTPException(400,'验证邮件暂未能发送，请稍后再试；维护者需检查 SMTP 配置及邮件额度')
    return {'message':'如果账号需要验证，已重新发送邮件；请只使用最新的一封。'}


@app.post('/auth/recover')
async def recover(payload:RecoveryEmail):
    if not configured():raise HTTPException(503,'尚未配置 Supabase')
    host=os.getenv('RENDER_EXTERNAL_HOSTNAME','')
    site=os.getenv('APP_URL','https://'+host).rstrip('/')
    r=await auth_call('recover?redirect_to='+site,'POST',data={'email':payload.email})
    if not r.is_success:raise HTTPException(400,'重置邮件暂时未能发送，请稍后重试或联系维护者')
    return {'message':'如果邮箱已注册，你将收到重置密码邮件。'}


class RecoverySession(BaseModel):
    access_token:str=Field(min_length=20,max_length=12000)
    refresh_token:str=Field(min_length=10,max_length=2000)


@app.post('/auth/recovery-session')
async def recovery_session(payload:RecoverySession):
    if not configured():raise HTTPException(503,'尚未配置 Supabase')
    r=await auth_call('user',token=payload.access_token)
    if not r.is_success:raise HTTPException(401,'链接已失效，请重新申请重置邮件')
    response=JSONResponse({'ready':True});set_session(response,payload.model_dump());return response


class NewPassword(BaseModel):
    password:str=Field(min_length=8,max_length=128)


@app.post('/api/account/password')
async def new_password(payload:NewPassword,request:Request):
    r=await auth_call('user','PUT',token=storage.identity.get()[1],data=payload.model_dump())
    if not r.is_success:raise HTTPException(400,'密码修改失败，可能需要重新验证，请重新申请邮件链接')
    return {'saved':True}


@app.get('/api/status')
def status(request:Request):return {'configured':bool(request.app.state.openai_client),'storage':'supabase-private','app':'wenlun-cloud','model':os.getenv('OPENAI_MODEL','gpt-5')}


@app.post('/api/import-browser-data')
def old_backup():raise HTTPException(422,'云端暂不接受旧浏览器备份；请在本地保留备份，原著可重新导入自己的账号')


@app.get('/api/books/{book_id}/cover')
def cover(book_id:str):
    b=storage.get(book_id)
    if not b:raise HTTPException(404,'书籍不存在')
    path=storage.object_path(book_id,'cover.jpg')
    try:return Response(storage.object_call('GET',path).content,media_type='image/jpeg')
    except HTTPException as e:
        if e.status_code!=404:raise
    if b['format']!='pdf':raise HTTPException(404,'没有内置封面')
    original=storage.object_call('GET',b['object_path']).content
    import fitz
    try:
        with fitz.open(stream=original,filetype='pdf') as doc:
            page=doc[0];scale=min(600/page.rect.width,900/page.rect.height)
            pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False)
            data=pix.tobytes('jpeg')
    except Exception:raise HTTPException(404,'无法提取封面') from None
    storage.object_call('POST',path,data,'image/jpeg')
    return Response(data,media_type='image/jpeg')


@app.post('/api/books/{book_id}/cover')
async def set_cover(book_id:str,request:Request):
    if not await asyncio.to_thread(storage.get,book_id):raise HTTPException(404,'书籍不存在')
    data=bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data)>5*1024*1024:raise HTTPException(413,'图片请小于5MB')
    with tempfile.TemporaryDirectory(dir=WORK) as folder:
        path=Path(folder)/'cover.jpg'
        await asyncio.to_thread(write_cover,path,bytes(data))
        await asyncio.to_thread(storage.object_call,'POST',storage.object_path(book_id,'cover.jpg'),path.read_bytes(),'image/jpeg')
    return {'saved':True}


class ChatInput(BaseModel):
    user_message:str=Field(strict=True,min_length=1,max_length=12000)


@app.post('/chat')
async def chat(payload:ChatInput,request:Request):
    client=reading_routes.client_for(request)
    try:
        result=await client.chat.completions.create(model=os.getenv('OPENAI_MODEL','gpt-5'),messages=[{'role':'user','content':payload.user_message}])
        return {'content':result.choices[0].message.content}
    except Exception:raise HTTPException(502,'模型服务未返回有效内容，请稍后重试') from None


app.include_router(library_routes.router)
app.include_router(learning_routes.router)
app.include_router(reading_routes.router)
app.include_router(free_books.router)
app.mount('/',StaticFiles(directory=ROOT/'wenlun-web/dist',html=True),name='reader')
