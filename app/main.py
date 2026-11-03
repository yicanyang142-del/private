import os
import asyncio
import threading
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    RateLimitError,
)
from pydantic import BaseModel, ConfigDict, Field, field_validator


# Resolve .env relative to this file, regardless of the launch directory.
# Existing deployment environment variables take precedence over .env.
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')

BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://space.ai-builders.com/backend/v1')
MODEL = os.getenv('OPENAI_MODEL', 'gpt-5')


@asynccontextmanager
async def lifespan(app: FastAPI):
    import store
    await asyncio.to_thread(store.init)
    from config import WORK
    tempfile.tempdir=str(WORK)
    stop = threading.Event()
    worker = asyncio.create_task(asyncio.to_thread(store.worker, stop))
    api_key = os.getenv('SUPER_MIND_API_KEY', '').strip()
    client = (
        AsyncOpenAI(
            api_key=api_key,
            base_url=BASE_URL,
            timeout=120.0,
            max_retries=0,
        )
        if api_key
        else None
    )
    app.state.openai_client = client
    try:
        yield
    finally:
        stop.set()
        await worker
        if client is not None:
            await client.close()


app = FastAPI(title='Chat API', lifespan=lifespan)

@app.get('/auth/config')
def local_auth_config():
    return {'cloud':False,'configured':True}


@app.middleware('http')
async def private_reader(request: Request, call_next):
    if request.url.hostname not in ('127.0.0.1','localhost','testserver'):
        return JSONResponse({'detail':'仅允许本机访问'},status_code=403)
    origin = request.headers.get('origin')
    if request.method not in ('GET', 'HEAD', 'OPTIONS') and origin and origin.rstrip('/') != str(request.base_url).rstrip('/'):
        return JSONResponse({'detail': '不接受跨站写入请求'}, status_code=403)
    try:
        response = await call_next(request)
    except Exception:
        return JSONResponse({'detail': '服务暂时不可用，请稍后重试'}, status_code=503)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


@app.get('/healthz')
async def health():
    import store
    try:
        await asyncio.to_thread(store.rows, 'SELECT id FROM books LIMIT 1')
    except Exception:
        raise HTTPException(503, '数据库尚未就绪') from None
    return {'status': 'ok','app':'wenlun-local','storage':'sqlite-local'}


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    user_message: str = Field(strict=True, min_length=1)

    @field_validator('user_message')
    @classmethod
    def reject_blank_message(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('user_message must not be blank')
        return value


class ChatResponse(BaseModel):
    content: str


@app.post('/chat', response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    client = request.app.state.openai_client
    if client is None:
        raise HTTPException(status_code=503, detail='SUPER_MIND_API_KEY is not configured')

    try:
        completion = await client.chat.completions.create(
            model=MODEL,
            messages=[{'role': 'user', 'content': payload.user_message}],
        )
    except APITimeoutError:
        raise HTTPException(status_code=504, detail='Chat provider timed out') from None
    except RateLimitError:
        raise HTTPException(status_code=429, detail='Chat provider rate limit or quota exceeded') from None
    except APIConnectionError:
        raise HTTPException(status_code=502, detail='Unable to connect to chat provider') from None
    except APIStatusError:
        # Do not send upstream exception bodies, credentials, or headers to callers.
        raise HTTPException(status_code=502, detail='Chat provider returned an error') from None

    if not completion.choices or completion.choices[0].message.content is None:
        raise HTTPException(status_code=502, detail='Chat provider returned no assistant content')
    return ChatResponse(content=completion.choices[0].message.content)


from reading_routes import router as reading_router
from library_routes import router as library_router
from dynamic_routes import router as dynamic_router
from learning_routes import router as learning_router
from cover_routes import router as cover_router
from free_books import router as free_books_router

app.include_router(reading_router)
app.include_router(library_router)
app.include_router(dynamic_router)
app.include_router(learning_router)
app.include_router(cover_router)
app.include_router(free_books_router)


@app.get('/api/status')
async def status(request: Request):
    return {'mode': 'live', 'configured': request.app.state.openai_client is not None,
            'model': MODEL, 'app': 'wenlun-local','storage':'sqlite-local',
            'academic_search_configured': bool(os.getenv('TAVILY_API_KEY','').strip())}


# Expose only the public frontend directory. Never mount the directory containing .env.
app.mount('/', StaticFiles(directory=Path(__file__).resolve().parent.parent / 'wenlun-web' / 'dist', html=True), name='reader')
