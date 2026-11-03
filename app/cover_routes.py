"""Local covers: original PDF first page, or a reader-supplied image."""
import io
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from PIL import Image, UnidentifiedImageError
from config import UPLOADS
import store

router = APIRouter(prefix='/api/books')


def cover_path(book_id):
    if not store.get(book_id):
        raise HTTPException(404, '书籍不存在')
    return UPLOADS / (book_id + '.cover.jpg')


def write_cover(path, data):
    try:
        with Image.open(io.BytesIO(data)) as original:
            if original.width * original.height > 25000000:
                raise ValueError()
            original.thumbnail((600, 900))
            image = original.convert('RGB')
            with tempfile.NamedTemporaryFile(dir=UPLOADS, suffix='.jpg', delete=False) as stream:
                temporary = Path(stream.name)
                image.save(stream, 'JPEG', quality=88)
        try:
            os.replace(temporary, path)
        finally:
            temporary.unlink(missing_ok=True)
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise HTTPException(422, '请选择有效且尺寸适中的 JPG、PNG 或 WebP 封面图片') from None


@router.get('/{book_id}/cover')
def get_cover(book_id: str):
    path = cover_path(book_id)
    if not path.exists():
        book = store.get(book_id)
        if book['format'] != 'pdf':
            raise HTTPException(404, '该文件没有内置封面，可自行设置')
        import fitz
        try:
            with fitz.open(UPLOADS / book['upload_name']) as doc:
                if not len(doc) or doc.needs_pass:
                    raise ValueError()
                page = doc[0]
                pix = page.get_pixmap(matrix=fitz.Matrix(min(600/page.rect.width, 900/page.rect.height), min(600/page.rect.width, 900/page.rect.height)), alpha=False)
                write_cover(path, pix.tobytes('png'))
        except (RuntimeError, ValueError, OSError):
            raise HTTPException(404, '暂时无法提取该书封面，可自行设置') from None
    return FileResponse(path, media_type='image/jpeg')


@router.post('/{book_id}/cover')
async def upload_cover(book_id: str, request: Request):
    path = cover_path(book_id)
    data = bytearray()
    async for block in request.stream():
        data.extend(block)
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(413, '封面图片请小于5MB')
    import asyncio
    await asyncio.to_thread(write_cover, path, bytes(data))
    return {'saved': True}
