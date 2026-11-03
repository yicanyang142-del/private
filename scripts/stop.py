import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'app'))
from config import RUNTIME, STOP_REQUEST
if not RUNTIME.exists():raise SystemExit('没有发现本项目运行记录，可能已经关闭。')
runtime=json.loads(RUNTIME.read_text(encoding='utf-8'))
STOP_REQUEST.write_text(str(runtime['pid']),encoding='utf-8')
print('已请求安全关闭，请等待服务终端显示 Application shutdown complete。')
