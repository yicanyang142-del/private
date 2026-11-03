"""Local cover files and public-domain import boundaries; no live downloads in tests."""
from test_local import *
from PIL import Image
import io
import cover_routes
import free_books


class OrganizationTests(unittest.TestCase):
    def test_cover_upload_and_pdf_first_page(self):
        import fitz
        with TestClient(main.app) as c:
            book=c.post('/api/books',content=TEXT.encode(),headers={'X-File-Name':'cover-test.txt'}).json()['id']
            self.assertEqual(c.get(f'/api/books/{book}/cover').status_code,404)
            image=io.BytesIO();Image.new('RGB',(120,180),'navy').save(image,'PNG')
            self.assertEqual(c.post(f'/api/books/{book}/cover',content=image.getvalue()).status_code,200)
            response=c.get(f'/api/books/{book}/cover')
            self.assertEqual(response.status_code,200)
            self.assertTrue(response.headers['content-type'].startswith('image/jpeg'))
            self.assertEqual(c.post(f'/api/books/{book}/cover',content=b'not an image').status_code,422)
            doc=fitz.open();page=doc.new_page();page.insert_text((40,80),'ORIGINAL COVER')
            pdf=doc.tobytes();doc.close()
            book=c.post('/api/books',content=pdf,headers={'X-File-Name':'original-cover.pdf'}).json()['id']
            self.assertEqual(c.get(f'/api/books/{book}/cover').status_code,200)

    def test_online_import_keeps_provenance_and_duplicate_notes(self):
        real_client=httpx.AsyncClient
        text='The Project Gutenberg eBook of The Republic\n'+TEXT*20
        def network(request):
            self.assertEqual(request.url.host,'mirror.cs.odu.edu')
            return httpx.Response(200,content=text.encode())
        def client_factory(*args,**kwargs):return real_client(*args,**kwargs,transport=httpx.MockTransport(network))
        with TestClient(main.app) as c,patch.object(free_books.httpx,'AsyncClient',side_effect=client_factory):
            first=c.post('/api/free-books/import',json={'id':1497})
            self.assertEqual(first.status_code,200,first.text)
            book=first.json()['book']['id']
            c.put(f'/api/books/{book}/state',json={'page':1,'notes':[{'text':'保留的笔记'}]})
            second=c.post('/api/free-books/import',json={'id':1497})
            self.assertTrue(second.json()['existing'])
            self.assertEqual(second.json()['book']['id'],book)
            self.assertEqual(c.get(f'/api/books/{book}/state').json()['notes'][0]['text'],'保留的笔记')
            self.assertTrue(store.rows('SELECT value FROM preferences WHERE name=?',('free-book:1497',),one=True))

    def test_catalog_blocks_unknown_rights_and_fake_download(self):
        self.assertIsNone(free_books.normalize({'id':42,'copyright':True,'formats':{'text/plain':'a'}}))
        self.assertIsNone(free_books.normalize({'id':42,'copyright':None,'formats':{'text/plain':'a'}}))
        real_client=httpx.AsyncClient
        def client_factory(*args,**kwargs):return real_client(*args,**kwargs,transport=httpx.MockTransport(lambda r:httpx.Response(200,text='<html>Error</html>')))
        with TestClient(main.app) as c,patch.object(free_books.httpx,'AsyncClient',side_effect=client_factory):
            response=c.post('/api/free-books/import',json={'id':1974})
            self.assertEqual(response.status_code,422)
            self.assertFalse(store.rows('SELECT value FROM preferences WHERE name=?',('free-book:1974',),one=True))


if __name__=='__main__':unittest.main()
