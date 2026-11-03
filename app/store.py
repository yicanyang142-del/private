import hashlib
import json
import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
from contextlib import contextmanager
from pathlib import Path

from config import ROOT, DATABASE, UPLOADS, WORK, MAX_BYTES, prepare

ALLOWED = {'.pdf','.txt','.md','.docx','.epub','.png','.jpg','.jpeg','.webp'}


@contextmanager
def db():
    connection = sqlite3.connect(DATABASE, timeout=20)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys=ON')
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def init():
    prepare()
    with db() as conn:
        conn.execute('PRAGMA journal_mode=WAL')
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,title TEXT NOT NULL,filename TEXT NOT NULL,format TEXT NOT NULL,
          sha256 TEXT NOT NULL UNIQUE,size_bytes INTEGER NOT NULL,upload_name TEXT NOT NULL,
          text_content TEXT,sections TEXT NOT NULL DEFAULT '[]',warnings TEXT NOT NULL DEFAULT '[]',
          status TEXT NOT NULL DEFAULT 'queued',error TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS reading_state (
          book_id TEXT PRIMARY KEY REFERENCES books(id),page INTEGER NOT NULL DEFAULT 1,
          notes TEXT NOT NULL DEFAULT '[]',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS annotations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,book_id TEXT NOT NULL REFERENCES books(id),
          page INTEGER NOT NULL,quote TEXT NOT NULL,user_input TEXT NOT NULL DEFAULT '',
          response TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS legacy_sources (
          legacy_id TEXT PRIMARY KEY,book_id TEXT NOT NULL REFERENCES books(id));
        CREATE TABLE IF NOT EXISTS browser_imports (
          id TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS preferences (
          name TEXT PRIMARY KEY,value TEXT NOT NULL);
        PRAGMA user_version=1;
        ''')
        conn.execute("UPDATE books SET status='queued',error=NULL WHERE status='processing'")


def rows(sql, params=(), one=False):
    with db() as conn:
        result = [dict(r) for r in conn.execute(sql,params).fetchall()]
    return (result[0] if result else None) if one else result


def get(book_id):
    return rows('SELECT * FROM books WHERE id=?',(book_id,),one=True)


def ingest(source, filename, converted=None, legacy_id=None):
    source = Path(source)
    filename = Path(filename.replace('\\','/')).name
    suffix = Path(filename).suffix.lower()
    size = source.stat().st_size
    if suffix not in ALLOWED or not 0 < size <= MAX_BYTES:
        raise ValueError('格式不支持、文件为空或超过上传上限')
    with source.open('rb') as stream:
        digest = hashlib.file_digest(stream,'sha256').hexdigest()
    book_id = digest[:24]
    upload_name = digest+suffix
    destination = UPLOADS/upload_name
    if not destination.exists():
        temporary = destination.with_suffix(destination.suffix+'.tmp')
        shutil.copyfile(source,temporary)
        os.replace(temporary,destination)
    if converted is None and suffix in ('.txt','.md'):
        data = source.read_bytes()
        text = None
        for encoding in (['utf-16'] if data[:2] in (b'\xff\xfe',b'\xfe\xff') else ['utf-8-sig','gb18030']):
            try:
                text=data.decode(encoding)
                break
            except UnicodeError:
                continue
        if text is None or not text.strip():
            raise ValueError('未识别到正文，请检查编码或文件内容')
        converted = {'complete':True,'text':text,'sections':[{'text':text,'method':'text'}]}
    complete = converted and converted.get('complete') and converted.get('text','').strip()
    with db() as conn:
        conn.execute('''INSERT INTO books(id,title,filename,format,sha256,size_bytes,upload_name,
         text_content,sections,warnings,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(sha256) DO UPDATE SET
          text_content=COALESCE(excluded.text_content,books.text_content),
          sections=CASE WHEN excluded.text_content IS NOT NULL THEN excluded.sections ELSE books.sections END,
          warnings=CASE WHEN excluded.text_content IS NOT NULL THEN excluded.warnings ELSE books.warnings END,
          status=CASE WHEN excluded.text_content IS NOT NULL THEN 'ready' ELSE books.status END''',
         (book_id,Path(filename).stem,filename,suffix[1:],digest,size,upload_name,
          converted['text'] if complete else None,
          json.dumps(converted.get('sections',[]) if complete else [],ensure_ascii=False),
          json.dumps(converted.get('warnings',[]) if complete else [],ensure_ascii=False),
          'ready' if complete else 'queued'))
        if legacy_id:
            conn.execute('INSERT OR REPLACE INTO legacy_sources(legacy_id,book_id) VALUES(?,?)',(legacy_id,book_id))
    return {'id':book_id,'title':Path(filename).stem,'status':get(book_id)['status']}


def worker(stop):
    while not stop.is_set():
        book = None
        try:
            with db() as conn:
                conn.execute('BEGIN IMMEDIATE')
                result = conn.execute("SELECT * FROM books WHERE status='queued' ORDER BY created_at LIMIT 1").fetchone()
                if result:
                    book = dict(result)
                    conn.execute("UPDATE books SET status='processing',error=NULL WHERE id=?",(book['id'],))
            if not book:
                stop.wait(2)
                continue
            with tempfile.TemporaryDirectory(dir=WORK) as folder:
                output = Path(folder)/'text.json'
                process = subprocess.Popen([sys.executable,str(ROOT/'convert_book.py'),
                    str(UPLOADS/book['upload_name']),str(output)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
                start = time.monotonic()
                try:
                    while process.poll() is None:
                        if stop.wait(.5):
                            raise InterruptedError()
                        if time.monotonic()-start > 7200:
                            raise ValueError('转换超时，请分卷导入')
                    if process.returncode or not output.exists():
                        raise ValueError('转换失败，请检查文件格式、密码保护或扫描清晰度')
                    result = json.loads(output.read_text(encoding='utf-8'))
                    if not result.get('complete') or not result.get('text','').strip():
                        raise ValueError('未提取到完整正文')
                    rows("UPDATE books SET text_content=?,sections=?,warnings=?,status='ready' WHERE id=? RETURNING id",
                        (result['text'],json.dumps(result.get('sections',[]),ensure_ascii=False),
                         json.dumps(result.get('warnings',[]),ensure_ascii=False),book['id']))
                finally:
                    if process.poll() is None:
                        process.terminate()
                        try:
                            process.wait(timeout=5)
                        except subprocess.TimeoutExpired:
                            process.kill();process.wait()
        except InterruptedError:
            if book:
                rows("UPDATE books SET status='queued' WHERE id=? RETURNING id",(book['id'],))
        except Exception:
            if book:
                rows("UPDATE books SET status='failed',error=? WHERE id=? RETURNING id",
                     ('未能提取正文，请检查文件后点击重试。',book['id']))
            stop.wait(2)
