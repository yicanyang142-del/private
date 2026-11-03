"""Cloud auth/tenant adapter integration. Mock Supabase is not a live RLS acceptance test.
Run separately from local tests: cloud modules bind repositories at import time.
"""
import sys,os,json,unittest
from pathlib import Path
from unittest.mock import patch
import httpx
sys.path.insert(0,str(Path(__file__).parent/'app'))
os.environ['SUPABASE_URL']='https://example.supabase.co'
os.environ['SUPABASE_PUBLISHABLE_KEY']='public-test-key'
os.environ['SUPER_MIND_API_KEY']=''
import cloud_main as cloud
import store as local_store
from fastapi.testclient import TestClient

for module in (cloud.library_routes,cloud.dynamic_routes,cloud.learning_routes,cloud.free_books):module.store=local_store

A='11111111-1111-4111-8111-111111111111'
B='22222222-2222-4222-8222-222222222222'
TEXT='这是仅属于甲的原文。'


class CloudPrivateTests(unittest.TestCase):
    def setUp(self):
        for module in (cloud.library_routes,cloud.dynamic_routes,cloud.learning_routes,cloud.free_books):module.store=cloud.storage
        self.calls=[]
        self.books={A:[{'id':'private-book','owner_id':A,'title':'甲的书','filename':'private.txt','format':'txt','sha256':'digest','object_path':A+'/private-book/original.txt','text_content':TEXT,'warnings':[],'sections':[],'status':'ready'}],B:[]}
        real_client=httpx.AsyncClient
        def auth_handler(r):
            token=r.headers.get('Authorization','').removeprefix('Bearer ')
            if r.url.path.endswith('/user') and token in ('a-token','b-token'):
                return httpx.Response(200,json={'id':A if token=='a-token' else B,'email':token+'@example.com'})
            return httpx.Response(401,json={'error':'invalid'})
        self.auth=patch.object(cloud.httpx,'AsyncClient',side_effect=lambda *args,**kw:real_client(*args,**kw,transport=httpx.MockTransport(auth_handler)))
        def rest(method,url,**kwargs):
            headers=kwargs['headers'];params=kwargs.get('params',{});token=headers['Authorization'].removeprefix('Bearer ')
            owner=A if token=='a-token' else B
            self.assertEqual(params.get('owner_id'),'eq.'+owner)
            self.assertEqual(headers['apikey'],'public-test-key')
            self.calls.append((owner,method,url,params,kwargs.get('json')))
            rows=self.books[owner] if url.endswith('/reader_books') else []
            if params.get('id'):rows=[r for r in rows if r['id']==params['id'][3:]]
            return httpx.Response(200,json=rows)
        self.rest=patch.object(cloud.storage.httpx,'request',side_effect=rest)
        self.auth.start();self.rest.start()

    def tearDown(self):
        self.auth.stop();self.rest.stop()
        for module in (cloud.library_routes,cloud.dynamic_routes,cloud.learning_routes,cloud.free_books):module.store=local_store

    def test_anonymous_denied_and_static_public(self):
        with TestClient(cloud.app,base_url='https://testserver') as c:
            self.assertEqual(c.get('/').status_code,200)
            self.assertTrue(c.get('/auth/config').json()['cloud'])
            self.assertEqual(c.get('/api/books').status_code,401)
            self.assertEqual(c.post('/chat',json={'user_message':'hello'}).status_code,401)
            self.assertEqual(c.get('/api/learning/books/private-book/guide').status_code,401)

    def test_two_identities_cannot_read_other_books_or_related_data(self):
        with TestClient(cloud.app,base_url='https://testserver') as c:
            c.cookies.set('reader_access','a-token')
            a=c.get('/api/books');self.assertEqual(a.status_code,200,a.text);self.assertEqual(len(a.json()['books']),1)
            self.assertEqual(c.get('/api/books/private-book/pages/1').json()['text'],TEXT)
            c.cookies.set('reader_access','b-token')
            self.assertEqual(c.get('/api/books').json()['books'],[])
            for endpoint in ['pages/1','state','annotations','cover']:
                self.assertEqual(c.get('/api/books/private-book/'+endpoint).status_code,404,endpoint)
            self.assertEqual(c.get('/api/learning/books/private-book/guide').status_code,404)

    def test_cross_origin_rejected(self):
        with TestClient(cloud.app,base_url='https://testserver') as c:
            c.cookies.set('reader_access','a-token')
            self.assertEqual(c.post('/api/books',headers={'Origin':'https://evil.example'},content=b'test').status_code,403)

    def test_body_cannot_override_owner(self):
        marker=cloud.storage.identity.set((A,'a-token'))
        try:
            cloud.storage.table('preferences','POST',data={'owner_id':B,'name':'x','value':{}})
            self.assertEqual(self.calls[-1][4]['owner_id'],A)
        finally:cloud.storage.identity.reset(marker)

    def test_login_keeps_tokens_in_secure_httponly_cookies(self):
        from unittest.mock import AsyncMock
        result=httpx.Response(200,json={'access_token':'a-token','refresh_token':'refresh-example-token'})
        with TestClient(cloud.app,base_url='https://testserver') as c,patch.object(cloud,'auth_call',AsyncMock(return_value=result)):
            r=c.post('/auth/login',json={'email':'reader@example.com','password':'example-password'})
            self.assertEqual(r.status_code,200)
            self.assertNotIn('a-token',r.text)
            self.assertIn('HttpOnly',r.headers['set-cookie'])
            self.assertIn('Secure',r.headers['set-cookie'])
            r=c.post('/auth/logout')
            self.assertEqual(r.status_code,200)
            self.assertFalse(c.cookies.get('reader_access'))


if __name__=='__main__':unittest.main()
