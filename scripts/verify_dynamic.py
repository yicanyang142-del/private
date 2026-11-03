"""Real local HTTP/model check for the dynamic reader, without moving the UI."""
import json
import sys
from pathlib import Path
import httpx
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'app'))
from config import DATA_DIR, SETTINGS
url=f"http://{SETTINGS['server']['host']}:{SETTINGS['server']['port']}"
SAMPLE='昔诗人什篇，为情而造文；辞人赋颂，为文而造情。'
with httpx.Client(base_url=url,timeout=180,trust_env=False) as client:
    def call(method,path,**kwargs):
        r=client.request(method,path,**kwargs);r.raise_for_status();return r.json()
    # Only a fixed public-domain test sentence, never a user's private book.
    book=call('POST','/api/books',content=SAMPLE.encode('utf-8'),headers={'X-File-Name':'dynamic-public-sample.txt'})
    page=call('GET',f"/api/books/{book['id']}/pages/1")
    assert page['text']==SAMPLE and page['total']==1, '测试样本不匹配，禁止发送模型请求'
    payload={'book_id':book['id'],'page':1,'selected_text':page['text'],'start':0,'end':len(page['text'])}
    deck=call('POST','/api/reader/inspire',json=payload)
    assert len(deck['questions'])==3
    question=deck['questions'][0]['question']
    result=call('POST','/api/reader/discuss',json={**payload,'question':question,'academic_search':False})
    assert result['quote'] in page['text'] and result['scaffold'] and result['question']
    saved=call('POST',f"/api/books/{book['id']}/annotations",json={
        'page':1,'quote':result['quote'],'user_input':question,'response':result})
    annotations=call('GET',f"/api/books/{book['id']}/annotations")['annotations']
    assert any(a['id']==saved['id'] for a in annotations)
    report={'passed':True,'deck':deck,'discussion':result,'annotation_id':saved['id']}
    (DATA_DIR/'dynamic-reader-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('真实动态阅读验收通过：三个问题 → 选择问题 → 分析及追问 → 保存批注并重新读取。')
