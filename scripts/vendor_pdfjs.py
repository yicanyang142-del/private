"""Vendor the official npm PDF.js build; verify npm SHA512 integrity."""
import base64
import hashlib
import io
import json
import tarfile
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
destination=ROOT/'wenlun-web/dist/vendor/pdfjs'
metadata=json.load(urllib.request.urlopen('https://registry.npmjs.org/pdfjs-dist/latest',timeout=60))
payload=urllib.request.urlopen(metadata['dist']['tarball'],timeout=120).read()
algorithm,encoded=metadata['dist']['integrity'].split('-',1)
if algorithm!='sha512' or base64.b64encode(hashlib.sha512(payload).digest()).decode()!=encoded:
    raise RuntimeError('PDF.js package integrity check failed')
destination.mkdir(parents=True,exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(payload),mode='r:gz') as archive:
    for member in archive.getmembers():
        name=member.name.removeprefix('package/')
        if not member.isfile() or not (name in ('build/pdf.mjs','build/pdf.worker.mjs','LICENSE') or name.startswith(('cmaps/','standard_fonts/','wasm/'))):continue
        output=(destination/name).resolve()
        if not output.is_relative_to(destination.resolve()):raise RuntimeError('Unsafe package path')
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_bytes(archive.extractfile(member).read())
(destination/'version.json').write_text(json.dumps({'package':'pdfjs-dist','version':metadata['version'],'integrity':metadata['dist']['integrity']},indent=2),encoding='utf-8')
print('Vendored official pdfjs-dist',metadata['version'])
