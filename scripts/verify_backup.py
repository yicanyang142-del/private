import hashlib
import json
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    manifest=json.loads(archive.read('manifest.json'))
    for name,expected in manifest.items():
        with archive.open(name) as stream:
            if hashlib.file_digest(stream,'sha256').hexdigest()!=expected:
                raise SystemExit('备份校验失败：'+name)
    if any(name.endswith('.env') for name in archive.namelist()):
        raise SystemExit('备份中不应包含.env')
print('备份SHA256校验全部通过；文件数：',len(manifest))
