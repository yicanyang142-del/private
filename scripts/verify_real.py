"""Actual local HTTP + model + process-restart acceptance. Never prints secrets."""
import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
import httpx

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'app'))
from config import SETTINGS, PATHS, RUNTIME, STOP_REQUEST, UPLOADS

BASE=f"http://{SETTINGS['server']['host']}:{SETTINGS['server']['port']}"
TEXT='昔诗人什篇，为情而造文；辞人赋颂，为文而造情。'
process=None


def start():
    global process
    flags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0
    process=subprocess.Popen([sys.executable,'-X','utf8',str(ROOT/'app/serve_reader.py')],cwd=ROOT,
         stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=flags)
    deadline=time.monotonic()+30
    while time.monotonic()<deadline:
        if process.poll() is not None:raise RuntimeError('服务启动失败，请直接运行start.ps1查看错误')
        try:
            result=httpx.get(BASE+'/healthz',timeout=2,trust_env=False)
            if result.status_code==200 and result.json().get('app')=='wenlun-local':return
        except httpx.HTTPError:pass
        time.sleep(.3)
    raise RuntimeError('等待本机服务超时')


def stop():
    global process
    if process is None or process.poll() is not None:return
    if RUNTIME.exists():
        runtime=json.loads(RUNTIME.read_text(encoding='utf-8'))
        # Windows venv's redirector can have a different PID from its Python child.
        if runtime['url']==BASE and runtime['hostname']==socket.gethostname():
            STOP_REQUEST.write_text(str(runtime['pid']),encoding='utf-8')
    process.wait(timeout=30)
    process=None


with socket.socket() as sock:
    try:sock.bind((SETTINGS['server']['host'],SETTINGS['server']['port']))
    except OSError:raise SystemExit('请先关闭8765端口已有服务，再进行真实验收。')

report={'runtime':'local Windows process','hostname':socket.gethostname(),'url':BASE,'checks':{}}
try:
    start()
    first_pid=process.pid
    with httpx.Client(base_url=BASE,timeout=180,trust_env=False) as client:
        def request(method,path,**kwargs):
            response=client.request(method,path,**kwargs)
            response.raise_for_status()
            return response.json()
        status=request('GET','/api/status')
        if not status['configured']:raise RuntimeError('本地.env尚未配置模型密钥')
        uploaded=request('POST','/api/books',content=TEXT.encode(),headers={'X-File-Name':'wenxin-local-acceptance.txt'})
        book_id=uploaded['id'];prefix='/api/books/'+book_id
        report['book_id']=book_id
        page=request('GET',prefix+'/pages/1')
        assert page['text']==TEXT
        report['checks']['upload']=True
        generated=request('POST','/api/thought-lab',json={'book':'文心雕龙','chapter':'情采',
             'source_text':TEXT,'selected_text':TEXT,'user_input':'虚构的情感也可能打动我，这和原句矛盾吗？',
             'next_path':'critique'})
        assert generated['mode']=='live' and generated['quote'] in TEXT
        report['checks']['real_ai']=True
        annotation=request('POST',prefix+'/annotations',json={'page':1,'quote':generated['quote'],
            'user_input':'本地验收：尝试批判性阅读','response':generated})
        notes=[{'page':1,'text':'本地验收笔记：情感与形式的关系需要结合原文判断。','quote':TEXT}]
        request('PUT',prefix+'/state',json={'page':1,'notes':notes})
        assert any(a['id']==annotation['id'] for a in request('GET',prefix+'/annotations')['annotations'])
        report['checks']['saved_and_refetched']=True
        report['annotation_id']=annotation['id']
        report['ai_response']=generated
    stop();start()
    report['process_ids']=[first_pid,process.pid]
    assert first_pid!=process.pid
    with httpx.Client(base_url=BASE,timeout=30,trust_env=False) as client:
        assert client.get(prefix+'/pages/1').json()['text']==TEXT
        assert client.get(prefix+'/state').json()['notes']==notes
        assert any(a['id']==annotation['id'] for a in client.get(prefix+'/annotations').json()['annotations'])
        assert client.get('/.env').status_code==404
    report['checks']['process_restart_persistence']=True
    report['checks']['secret_not_public']=True
    report['uploads_count']=len(list(UPLOADS.iterdir()))
    report['passed']=True
finally:
    stop()
    report.setdefault('passed',False)
    PATHS['acceptance_report'].write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('真实本地验收通过：上传 → AI注解 → 保存 → 重新获取 → 重启进程后保留。')
print('报告：'+str(PATHS['acceptance_report']))
