"""Real SQLite/file integration tests; model output alone is mocked here."""
import atexit
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch

ROOT=Path(__file__).parent.resolve()
(ROOT/'data/work').mkdir(parents=True,exist_ok=True)
temporary=tempfile.TemporaryDirectory(dir=ROOT/'data/work')
atexit.register(temporary.cleanup)
test_root=Path(temporary.name)
config=test_root/'config.toml'
config.write_text('''[server]
host="127.0.0.1"
port=8765
[paths]
'''+ '\n'.join(f'{key}="{(test_root/value).as_posix()}"' for key,value in {
 'data_dir':'db','database':'db/app.db','uploads':'db/uploads','work':'db/work','runtime':'db/server.json'}.items())+'''
[library]
page_size=900
max_upload_mb=80
''',encoding='utf-8')
os.environ['WENLUN_CONFIG']=str(config)
os.environ['SUPER_MIND_API_KEY']=''
sys.path.insert(0,str(ROOT/'app'))
from fastapi.testclient import TestClient
import main
import store
import reading_routes
import dynamic_routes
import academic_search
import openalex_search
import httpx
from fastapi import HTTPException
from config import UPLOADS, DATABASE

TEXT='昔诗人什篇，为情而造文；辞人赋颂，为文而造情。'


class LocalTests(unittest.TestCase):
    def upload(self,client):
        response=client.post('/api/books',content=TEXT.encode(),headers={'X-File-Name':'test.txt'})
        self.assertEqual(response.status_code,200)
        return response.json()['id']

    def test_save_refresh_and_restart(self):
        answer={'quote':TEXT,'sentence':'诗人先有情感再写文章，辞人却为写文章制造情感。','limit':'略去了后续论证。'}
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            with patch.object(reading_routes,'generate_json',new=AsyncMock(return_value=answer)):
                generated=client.post('/api/skim',json={'source_text':TEXT}).json()
            url=f'/api/books/{book_id}'
            response=client.post(url+'/annotations',json={'page':1,'quote':TEXT,'user_input':'试着理解','response':generated})
            self.assertEqual(response.status_code,200)
            annotation_id=response.json()['id']
            notes=[{'page':1,'text':'这是我自己的批注','quote':TEXT}]
            self.assertTrue(client.put(url+'/state',json={'page':1,'notes':notes}).json()['saved'])
            self.assertTrue(any(a['id']==annotation_id for a in client.get(url+'/annotations').json()['annotations']))
        # New application lifespan opens the same SQLite files after complete shutdown.
        with TestClient(main.app) as restarted:
            self.assertEqual(restarted.get(url+'/pages/1').json()['text'],TEXT)
            self.assertEqual(restarted.get(url+'/state').json()['notes'],notes)
            self.assertTrue(any(a['id']==annotation_id for a in restarted.get(url+'/annotations').json()['annotations']))
        self.assertTrue(DATABASE.exists())
        self.assertTrue(any(p.is_file() for p in UPLOADS.iterdir()))

    def test_bad_quote_cannot_be_saved(self):
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            response=client.post(f'/api/books/{book_id}/annotations',json={'page':1,'quote':'伪造引句','response':{'quote':'伪造引句'}})
            self.assertEqual(response.status_code,422)

    def test_file_and_secret_boundaries(self):
        with TestClient(main.app) as client:
            for path in ('/.env','/data/app.db','/config.toml','/app/main.py'):
                self.assertEqual(client.get(path).status_code,404)
            self.assertEqual(client.get('/healthz').json()['storage'],'sqlite-local')
            self.assertEqual(client.get('/',headers={'Host':'evil.example'}).status_code,403)
            self.assertEqual(client.post('/chat',json={'user_message':'x'},headers={'Origin':'https://other.example'}).status_code,403)

    def test_duplicate_upload_uses_same_book_and_file(self):
        with TestClient(main.app) as client:
            first=self.upload(client);second=self.upload(client)
            self.assertEqual(first,second)
            self.assertEqual(len([b for b in client.get('/api/books').json()['books'] if b['id']==first]),1)

    def test_no_key_returns_error_instead_of_mock(self):
        with TestClient(main.app) as client:
            self.assertEqual(client.post('/api/skim',json={'source_text':TEXT}).status_code,503)

    def test_dynamic_questions_and_selected_discussion(self):
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            selection={'book_id':book_id,'page':1,'selected_text':TEXT,'start':0,'end':len(TEXT)}
            deck={'questions':[{'angle':str(i),'question':q} for i,q in enumerate(['虚构会排斥真情吗？','形式会改变情感吗？','今天如何验证这种区分？'])]}
            with patch.object(dynamic_routes,'generate_json',new=AsyncMock(return_value=deck)) as model:
                response=client.post('/api/reader/inspire',json=selection)
                self.assertEqual(response.status_code,200)
                self.assertEqual(len(response.json()['questions']),3)
                self.assertEqual(model.call_args.args[2]['source_text'],TEXT)
            answer={'path':'critique','acknowledgment':'这是值得追问的区分。','quote':TEXT,
                'scaffold':'原句区分了情与文的先后关系，尚不足以断言所有虚构都缺乏真情。',
                'question':'什么反例会使这种区分变得困难？','interpretation_ids':[],'next_path_hint':'feynman'}
            with patch.object(dynamic_routes,'generate_json',new=AsyncMock(return_value=answer)):
                response=client.post('/api/reader/discuss',json={**selection,'question':deck['questions'][0]['question'],'academic_search':False})
                self.assertEqual(response.status_code,200)
                self.assertEqual(response.json()['quote'],TEXT)

    def test_dynamic_selection_and_duplicate_cards_rejected(self):
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            selection={'book_id':book_id,'page':1,'selected_text':TEXT,'start':1,'end':len(TEXT)}
            self.assertEqual(client.post('/api/reader/inspire',json=selection).status_code,422)
            selection['start']=0
            with patch.object(dynamic_routes,'generate_json',new=AsyncMock(return_value={'questions':[{'angle':'角度','question':'同一个问题？'}]*3})):
                self.assertEqual(client.post('/api/reader/inspire',json=selection).status_code,502)

    def test_browser_import_is_immediately_readable_and_keeps_original(self):
        with TestClient(main.app) as client:
            metadata={'text':'浏览器已经提取的正文。','sections':[{'page':1,'text':'浏览器已经提取的正文。','method':'pdfjs'}],'warnings':[]}
            response=client.post('/api/books/browser-import',files={'file':('browser-test.pdf',b'%PDF-test-original','application/pdf')},data={'metadata':json.dumps(metadata)})
            self.assertEqual(response.status_code,200)
            book_id=response.json()['id'];self.assertEqual(response.json()['status'],'ready')
            self.assertEqual(client.get(f'/api/books/{book_id}/pages/1').json()['text'],metadata['text'])
            original=store.get(book_id)
            self.assertEqual((UPLOADS/original['upload_name']).read_bytes(),b'%PDF-test-original')
            metadata['text']='重复导入不应替换已有正文。'
            repeated=client.post('/api/books/browser-import',files={'file':('browser-test.pdf',b'%PDF-test-original','application/pdf')},data={'metadata':json.dumps(metadata)})
            self.assertTrue(repeated.json()['existing'])
            self.assertEqual(client.get(f'/api/books/{book_id}/pages/1').json()['text'],'浏览器已经提取的正文。')

    def test_browser_import_rejects_empty_text(self):
        with TestClient(main.app) as client:
            response=client.post('/api/books/browser-import',files={'file':('empty.pdf',b'%PDF-empty','application/pdf')},data={'metadata':json.dumps({'text':'  '})})
            self.assertEqual(response.status_code,422)

    def test_academic_retrieval_precedes_generation_and_preserves_sources(self):
        sequence=[]
        source={'id':'S1','title':'测试学术摘要','url':'https://cnki.net/paper/1','domain':'cnki.net',
            'snippet':'这是一条用于核验引句的学术检索摘要，其中讨论了创作动机与情感表达的关系。','evidence_type':'search_excerpt','full_text_verified':False}
        retrieval={'status':'retrieved','query':'情与文 学术','sources':[source],'retrieved_at':'test','notice':'摘要未核对全文'}
        async def search(query):sequence.append('search');return retrieval
        async def generate(request,prompt,body):
            sequence.append('generate');self.assertEqual(body['academic_context']['sources'][0]['id'],'S1')
            return {'path':'critique','acknowledgment':'先区分两种创作起点。','quote':TEXT,'scaffold':'原句可以引出动机和表达的不同[S1]。',
                'question':'怎样的例子会挑战这个区分？','next_path_hint':'feynman','interpretation_ids':[],
                'evidence_limit':'检索摘要未核对全文，不能据此确定唯一解释。','citations':['S1'],
                'scholarly_views':[{'perspective':'创作动机的研究视角','claim':'这条摘要涉及动机与表达的关系，不足以归属某一学派。',
                    'source_ids':['S1'],'evidence':[{'source_id':'S1','quote':'讨论了创作动机与情感表达的关系'}]}]}
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            payload={'book_id':book_id,'page':1,'selected_text':TEXT,'start':0,'end':len(TEXT),'research_provider':'tavily','user_message':'情与文有什么区别？'}
            with patch.object(dynamic_routes,'search_academic',new=search),patch.object(dynamic_routes,'generate_json',new=generate):
                response=client.post('/api/reader/discuss',json=payload)
            self.assertEqual(response.status_code,200,response.text)
            self.assertEqual(sequence,['search','generate'])
            result=response.json();self.assertEqual(result['sources'],[source])
            saved=client.post(f'/api/books/{book_id}/annotations',json={'page':1,'quote':TEXT,'user_input':'学术检索测试','response':result})
            self.assertEqual(saved.status_code,200)
            records=client.get(f'/api/books/{book_id}/annotations').json()['annotations']
            self.assertTrue(any(r['response'].get('sources')==[source] for r in records))

    def test_no_academic_results_or_missing_key_do_not_call_model(self):
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            payload={'book_id':book_id,'page':1,'selected_text':TEXT,'start':0,'end':len(TEXT),'research_provider':'tavily','user_message':'概念是什么？'}
            with patch.object(dynamic_routes,'search_academic',new=AsyncMock(return_value={'sources':[]})),patch.object(dynamic_routes,'generate_json',new=AsyncMock()) as model:
                self.assertEqual(client.post('/api/reader/discuss',json=payload).status_code,424)
                model.assert_not_called()
            with patch.dict(os.environ,{'TAVILY_API_KEY':''}),patch.object(dynamic_routes,'generate_json',new=AsyncMock()) as model:
                self.assertEqual(client.post('/api/reader/discuss',json=payload).status_code,503)
                model.assert_not_called()

    def test_openalex_context_is_forwarded_before_model_generation(self):
        sources=openalex_search.normalize_works([{'id':'https://openalex.org/W123','title':'Concept study',
            'authorships':[{'author':{'display_name':'Researcher A'}}],'publication_year':2020,
            'abstract_inverted_index':{'The':[0],'study':[1],'examines':[2],'concepts.':[3]}}])
        retrieval={'provider':'openalex','sources':sources,'status':'retrieved','notice':'metadata and abstracts',
                   'context_text':openalex_search.papers_to_context(sources)}
        async def generate(request,prompt,body):
            self.assertIn('Title: Concept study',body['academic_context']['context_text'])
            self.assertIn('Authors: Researcher A',body['academic_context']['context_text'])
            return {'path':'critique','acknowledgment':'所检索的摘要与原句关系尚不明确。','quote':TEXT,
                'scaffold':'先根据原句区分创作起点，不能凭这篇不够相关的摘要补写学者观点。',
                'question':'你会如何核对这种区分？','next_path_hint':'feynman','evidence_limit':'未核对全文，摘要不足以形成归属。',
                'citations':[],'scholarly_views':[]}
        with TestClient(main.app) as client:
            book_id=self.upload(client)
            with patch.object(dynamic_routes,'search_openalex',new=AsyncMock(return_value=retrieval)) as search,patch.object(dynamic_routes,'generate_json',new=generate):
                response=client.post('/api/reader/discuss',json={'book_id':book_id,'page':1,'selected_text':TEXT,
                    'start':0,'end':len(TEXT),'user_message':'这段话有什么研究？','research_provider':'openalex'})
            self.assertEqual(response.status_code,200,response.text)
            search.assert_awaited_once_with(TEXT)
            self.assertEqual(response.json()['retrieval']['status'],'insufficient_evidence')


class AcademicSearchTests(unittest.IsolatedAsyncioTestCase):
    async def test_openalex_reconstructs_abstract_without_inventing_missing_words(self):
        self.assertEqual(openalex_search.reconstruct_abstract({'art':[1],'Theory':[0],'matters':[2]}),'Theory art matters')
        self.assertIsNone(openalex_search.reconstruct_abstract(None))
        self.assertIsNone(openalex_search.reconstruct_abstract({'missing':[2]}))
        self.assertIsNone(openalex_search.reconstruct_abstract({'one':[0],'two':[0]}))

    async def test_openalex_request_papers_and_structured_context(self):
        def handle(request):
            self.assertEqual(request.url.params['search'],'Simulacra')
            self.assertEqual(request.url.params['sort'],'cited_by_count:desc')
            self.assertEqual(request.url.params['per_page'],'3')
            return httpx.Response(200,json={'results':[
                {'id':'https://openalex.org/W1','title':'Paper One','authorships':[{'author':{'display_name':'Author A'}}],'publication_year':2001,'cited_by_count':100,'abstract_inverted_index':{'A':[0],'study':[1],'of':[2],'simulacra.':[3]}},
                {'id':'https://openalex.org/W2','title':'Paper Two','authorships':[],'publication_year':2002,'cited_by_count':50,'abstract_inverted_index':None}]})
        with patch.dict(os.environ,{'OPENALEX_API_KEY':''}):
            result=await openalex_search.search_openalex('Simulacra',transport=httpx.MockTransport(handle))
        self.assertEqual(result['sources'][0]['abstract'],'A study of simulacra.')
        self.assertEqual(result['sources'][0]['authors'],['Author A'])
        self.assertFalse(result['sources'][1]['has_abstract'])
        self.assertIn('Title: Paper One',result['context_text']);self.assertIn('Year: 2001',result['context_text'])
        self.assertIn('Not available',result['context_text'])

    async def test_openalex_rejects_upstream_errors_without_leaking_body(self):
        for code,expected in [(401,503),(429,429),(500,502)]:
            with self.assertRaises(HTTPException) as caught:
                await openalex_search.search_openalex('test',transport=httpx.MockTransport(lambda request:httpx.Response(code,text='PRIVATE-KEY')))
            self.assertEqual(caught.exception.status_code,expected);self.assertNotIn('PRIVATE-KEY',caught.exception.detail)

    async def test_tavily_request_filter_and_deduplication(self):
        snippet='研究者讨论了风骨概念的解释分歧，需要结合文本语境区分不同的研究取向。'*5
        def handle(request):
            self.assertEqual(str(request.url),'https://api.tavily.com/search')
            body=json.loads(request.content)
            self.assertFalse(body['include_answer']);self.assertFalse(body['include_raw_content'])
            self.assertEqual(body['search_depth'],'advanced');self.assertIn('cnki.net',body['include_domains'])
            self.assertEqual(request.headers['Authorization'],'Bearer tvly-test-only')
            return httpx.Response(200,json={'results':[
                {'title':'伪造域名','url':'https://cnki.net.attacker.example/a','content':snippet},
                {'title':'一','url':'https://cnki.net/paper/1?utm_source=test','content':snippet},
                {'title':'重复','url':'https://cnki.net/paper/1#heading','content':snippet},
                {'title':'二','url':'https://plato.stanford.edu/entries/test/','content':'另一份不同的摘要。'+snippet},
                {'title':'三','url':'https://academic.oup.com/paper/3','content':'第三份不同的摘要。'+snippet},
                {'title':'四','url':'https://jstor.org/paper/4','content':'第四份摘要。'+snippet}]})
        with patch.dict(os.environ,{'TAVILY_API_KEY':'tvly-test-only'}):
            result=await academic_search.search_academic('风骨 文论 学术',transport=httpx.MockTransport(handle))
        self.assertEqual([s['id'] for s in result['sources']],['S1','S2','S3'])
        self.assertEqual(result['sources'][0]['url'],'https://cnki.net/paper/1')

    async def test_tavily_failures_are_sanitized(self):
        with patch.dict(os.environ,{'TAVILY_API_KEY':'tvly-test-only'}):
            for code,expected in [(401,502),(429,429),(432,429),(500,502)]:
                with self.assertRaises(HTTPException) as caught:
                    await academic_search.search_academic('test',transport=httpx.MockTransport(lambda request:httpx.Response(code,text='DO-NOT-LEAK-KEY')))
                self.assertEqual(caught.exception.status_code,expected)
                self.assertNotIn('DO-NOT-LEAK',caught.exception.detail)
            def timeout(request):raise httpx.ReadTimeout('DO-NOT-LEAK-KEY')
            with self.assertRaises(HTTPException) as caught:
                await academic_search.search_academic('test',transport=httpx.MockTransport(timeout))
            self.assertEqual(caught.exception.status_code,504)

    async def test_citation_quotes_and_unknown_ids_are_rejected(self):
        source={'id':'S1','snippet':'检索摘要中的实际引句，只有这段文字可以作为引句依据。'}
        data={'path':'critique','acknowledgment':'回应','quote':TEXT,'scaffold':'分析[S1]','question':'还有什么依据？',
            'next_path_hint':'feynman','citations':['S1'],'scholarly_views':[{'perspective':'研究取向','claim':'有边界的观点',
                'source_ids':['S1'],'evidence':[{'source_id':'S1','quote':'检索摘要中的实际引句'}]}]}
        result=academic_search.AcademicLabOutput.model_validate(data)
        academic_search.validate_citations(result,{'sources':[source]})
        result.scholarly_views[0].evidence[0].quote='摘要没有这一条支持引句'
        with self.assertRaises(HTTPException):academic_search.validate_citations(result,{'sources':[source]})
        result.citations=['S999']
        with self.assertRaises(HTTPException):academic_search.validate_citations(result,{'sources':[source]})

    async def test_query_is_short_and_does_not_include_full_page(self):
        query=academic_search.build_query('长段落'*1000,'用户问题'*100,'风骨')
        self.assertIn('风骨',query);self.assertIn('学术',query);self.assertLess(len(query),300)


if __name__=='__main__':unittest.main()
