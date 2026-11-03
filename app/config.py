"""All local data paths are resolved here, relative to the project, not cwd."""
import os
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_FILE = Path(os.getenv('WENLUN_CONFIG', str(ROOT/'config.toml')))
SETTINGS = tomllib.loads(CONFIG_FILE.read_text(encoding='utf-8'))
PATHS = {k: (ROOT/v).resolve() for k,v in SETTINGS['paths'].items()}
DATA_DIR = PATHS['data_dir']
for name, path in PATHS.items():
    if not path.is_relative_to(DATA_DIR):
        raise RuntimeError('数据路径必须在配置的 data_dir 内：'+name)
DATABASE, UPLOADS, WORK, RUNTIME = (PATHS[k] for k in ('database','uploads','work','runtime'))
STOP_REQUEST = PATHS.get('stop_request', RUNTIME.with_name('stop.request'))
PAGE_SIZE = SETTINGS['library']['page_size']
MAX_BYTES = SETTINGS['library']['max_upload_mb']*1024*1024


def prepare():
    for folder in (DATA_DIR, DATABASE.parent, UPLOADS, WORK, RUNTIME.parent):
        folder.mkdir(parents=True, exist_ok=True)
