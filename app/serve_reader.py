import json
import os
import socket
import asyncio
from datetime import datetime, timezone
import uvicorn
from config import SETTINGS, RUNTIME, STOP_REQUEST, prepare


async def run_server(host,port):
    server=uvicorn.Server(uvicorn.Config('main:app',host=host,port=port,proxy_headers=False))
    async def watch_stop():
        while not server.should_exit:
            if STOP_REQUEST.exists():
                try:
                    requested=STOP_REQUEST.read_text(encoding='utf-8').strip()
                    STOP_REQUEST.unlink(missing_ok=True)
                    if requested==str(os.getpid()):
                        server.should_exit=True
                except OSError:
                    pass
            await asyncio.sleep(.5)
    watcher=asyncio.create_task(watch_stop())
    try:
        await server.serve()
    finally:
        watcher.cancel()
        try:await watcher
        except asyncio.CancelledError:pass

if __name__=='__main__':
    host=SETTINGS['server']['host']
    port=SETTINGS['server']['port']
    if host!='127.0.0.1':
        raise SystemExit('本地试用版只允许监听127.0.0.1，请修改config.toml')
    try:
        with socket.socket() as sock:
            sock.bind((host,port))
    except OSError:
        raise SystemExit(f'端口 {port} 已被占用。请先打开 http://{host}:{port}/ 检查是否已启动，勿重复启动。')
    prepare()
    RUNTIME.write_text(json.dumps({'pid':os.getpid(),'started_at':datetime.now(timezone.utc).isoformat(),
        'url':f'http://{host}:{port}','hostname':socket.gethostname()},ensure_ascii=False),encoding='utf-8')
    print(f'文论伴读已在本机启动：http://{host}:{port}/\n保持此窗口打开；按 Ctrl+C 安全关闭。',flush=True)
    try:
        asyncio.run(run_server(host,port))
    finally:
        RUNTIME.unlink(missing_ok=True)
