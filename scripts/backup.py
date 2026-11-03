"""Stop the server first; backup includes SQLite, original uploads and config."""
import hashlib
import json
import sqlite3
import sys
import tempfile
import urllib.request
import socket
import zipfile
from contextlib import closing
from datetime import datetime
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'app'))
from config import DATA_DIR, DATABASE, SETTINGS, WORK

url=f"http://{SETTINGS['server']['host']}:{SETTINGS['server']['port']}/healthz"
try:
    connection=socket.create_connection((SETTINGS['server']['host'],SETTINGS['server']['port']),timeout=2)
    connection.close()
except OSError:
    pass
else:
    raise SystemExit('请先在服务终端按 Ctrl+C 停止服务，再备份。')
if not DATABASE.exists():raise SystemExit('尚未创建本地数据库，请先启动一次服务。')
destination=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'backups'
if destination.is_relative_to(DATA_DIR):raise SystemExit('备份目录不能位于data内部。')
destination.mkdir(parents=True,exist_ok=True)
archive=destination/('wenlun-data-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f')+'.zip')
manifest={}
WORK.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(dir=WORK) as folder:
    snapshot=Path(folder)/'app.db'
    with closing(sqlite3.connect(DATABASE)) as source,closing(sqlite3.connect(snapshot)) as target:
        source.backup(target)
        if target.execute('PRAGMA integrity_check').fetchone()[0]!='ok':
            raise SystemExit('数据库完整性检查未通过，备份已停止。')
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as output:
        for item in DATA_DIR.rglob('*'):
            if not item.is_file() or item.is_symlink() or item==DATABASE or item.name in ('app.db-wal','app.db-shm','server.json'):
                continue
            if item.is_relative_to(WORK):
                continue
            relative='data/'+item.relative_to(DATA_DIR).as_posix()
            output.write(item,relative)
            manifest[relative]=hashlib.sha256(item.read_bytes()).hexdigest()
        output.write(snapshot,'data/app.db')
        manifest['data/app.db']=hashlib.sha256(snapshot.read_bytes()).hexdigest()
        output.write(ROOT/'config.toml','config.toml')
        output.writestr('manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2))
print('备份完成：'+str(archive))
print('不包含 .env。请单独安全保管密钥。')
