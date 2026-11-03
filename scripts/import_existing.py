"""Copy existing literature into local data/uploads and preserve ready text."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'app'))
import store

parser=argparse.ArgumentParser()
parser.add_argument('--library',type=Path,required=True)
parser.add_argument('--old-data',type=Path,required=True)
args=parser.parse_args()
store.init()
count=0
for source in sorted(args.library.iterdir()):
    if not source.is_file() or source.is_symlink() or source.suffix.lower() not in store.ALLOWED:
        continue
    legacy=hashlib.sha256(source.name.encode()).hexdigest()[:24]
    converted_file=args.old_data/'texts'/(legacy+'.json')
    converted=json.loads(converted_file.read_text(encoding='utf-8')) if converted_file.exists() else None
    store.ingest(source,source.name,converted,legacy)
    count+=1
catalog=args.old_data/'catalog'
if catalog.exists():
    for entry in catalog.glob('*.json'):
        record=json.loads(entry.read_text(encoding='utf-8'))
        source=Path(record.get('originalPath',''))
        if not source.is_file():
            candidates=list((args.old_data/'originals').glob(record['id']+'.*'))
            if not candidates:raise RuntimeError('缺少旧导入文件：'+entry.name)
            source=candidates[0]
        converted_file=args.old_data/'texts'/(record['id']+'.json')
        converted=json.loads(converted_file.read_text(encoding='utf-8')) if converted_file.exists() else None
        store.ingest(source,record.get('filename',source.name),converted,record['id'])
        count+=1
print('本地导入完成：',count,'份；原始文件未修改。')
