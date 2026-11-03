"""Real local persistence and source boundaries; external calls mocked explicitly."""
from test_local import *
import learning_routes as learning


class LearningTests(unittest.TestCase):
    def upload(self, client, text=TEXT):
        response = client.post('/api/books', content=text.encode(), headers={'X-File-Name':'learning.txt'})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()['id']

    def payload(self, book):
        return {'book_id':book,'page':1,'selected_text':TEXT,'start':0,'end':len(TEXT),'user_message':'请解释这段话'}

    def test_answer_and_discussion_have_different_contracts_and_save(self):
        with TestClient(main.app) as client:
            book=self.upload(client)
            result={'quote':TEXT,'scaffold':'这段区分写作的出发点。','question':'是否一定如此？','citations':[]}
            with patch.object(learning,'generate_json',AsyncMock(return_value=result)) as model:
                answer=client.post('/api/learning/tutor',json=self.payload(book))
                self.assertEqual(answer.status_code,200,answer.text)
                self.assertEqual(answer.json()['question'],'')
                self.assertIn('不强制追问',model.call_args.args[1])
                discussion=client.post('/api/learning/tutor',json={**self.payload(book),'intent':'discuss','user_message':''})
                self.assertEqual(discussion.status_code,200,discussion.text)
                self.assertTrue(discussion.json()['question'])
                saved=client.post(f'/api/books/{book}/annotations',json={'page':1,'quote':TEXT,'user_input':'讨论','response':discussion.json()})
                self.assertEqual(saved.status_code,200,saved.text)
                self.assertTrue(client.get(f'/api/books/{book}/annotations').json()['annotations'])

    def test_failed_search_does_not_block_and_false_quote_rejected(self):
        with TestClient(main.app) as client:
            book=self.upload(client)
            with patch.object(learning,'retrieve',AsyncMock(return_value=([],['检索限流']))),patch.object(learning,'generate_json',AsyncMock(return_value={'quote':TEXT,'scaffold':'原文分析','citations':[]})):
                r=client.post('/api/learning/tutor',json={**self.payload(book),'academic_search':True})
                self.assertEqual(r.status_code,200,r.text)
                self.assertIn('未获得外部资料',r.json()['retrieval']['notice'])
            with patch.object(learning,'generate_json',AsyncMock(return_value={'quote':'伪造的原文','scaffold':'分析'})):
                self.assertEqual(client.post('/api/learning/tutor',json=self.payload(book)).status_code,502)

    def test_guide_cached_and_trace_does_not_expose_unread_pages(self):
        with TestClient(main.app) as client:
            book=self.upload(client,TEXT+'甲'*1000+'未来概念')
            result={'overview':'从写作起点读起','modules':[{'title':'观察次序','body':'先看情与文的关系','quote':TEXT}], 'map':[{'title':'情与文','role':'比较两种起点','quote':TEXT}], 'limits':'只有开头摘录'}
            with patch.object(learning,'generate_json',AsyncMock(return_value=result)) as model:
                a=client.post(f'/api/learning/books/{book}/guide',json={})
                self.assertEqual(a.status_code,200,a.text)
                client.post(f'/api/learning/books/{book}/guide',json={})
                self.assertEqual(model.await_count,1)
            self.assertEqual(client.get(f'/api/learning/books/{book}/guide').json()['guide']['map'][0]['page'],1)
            self.assertEqual(client.get(f'/api/learning/books/{book}/trace',params={'term':'未来概念','page':1}).json()['matches'],[])
            self.assertEqual(len(client.get(f'/api/learning/books/{book}/trace',params={'term':'未来概念','page':2}).json()['matches']),1)

    def test_public_source_adapters(self):
        async def check():
            crossref={'message':{'items':[{'DOI':'10.1234/test','title':['A title'],'abstract':'<jats:p>An actual abstract.</jats:p>','issued':{'date-parts':[[2024]]}}]}}
            items=await learning.public_search('crossref','aesthetic',transport=httpx.MockTransport(lambda r:httpx.Response(200,json=crossref)))
            self.assertEqual(items[0]['snippet'],'An actual abstract.')
            self.assertEqual(items[0]['year'],2024)
            semantic={'data':[{'title':'A paper','url':'https://www.semanticscholar.org/paper/abc123','abstract':None}]}
            items=await learning.public_search('semantic','aesthetic',transport=httpx.MockTransport(lambda r:httpx.Response(200,json=semantic)))
            self.assertFalse(items[0]['has_abstract'])
        import asyncio
        asyncio.run(check())

    def test_invented_external_quote_and_guide_quote_rejected(self):
        with TestClient(main.app) as client:
            book=self.upload(client)
            source={'id':'S1','snippet':'A real abstract about literary interpretation.'}
            response={'quote':TEXT,'scaffold':'见[S1]','citations':[{'source_id':'S1','quote':'An invented external quotation.'}]}
            with patch.object(learning,'retrieve',AsyncMock(return_value=([source],[]))),patch.object(learning,'generate_json',AsyncMock(return_value=response)):
                self.assertEqual(client.post('/api/learning/tutor',json={**self.payload(book),'academic_search':True}).status_code,502)
            bad={'overview':'overview','modules':[{'title':'title','body':'body','quote':'不存在的原文'}]}
            with patch.object(learning,'generate_json',AsyncMock(return_value=bad)):
                self.assertEqual(client.post(f'/api/learning/books/{book}/guide',json={'regenerate':True}).status_code,502)


if __name__=='__main__':unittest.main()
