import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBooks,searchBooks} from './wenlun-web/dist/book-search.mjs';
test('book cards handle author/year and public reading links',()=>{
 const books=normalizeBooks([{key:'/works/OL1W',title:'Poetics',author_name:['Aristotle'],first_publish_year:1902,ebook_access:'public',ia:['poetics-test']},{key:'OL2W',title:'Another Poetics'},{key:'https://evil.example',title:'bad'}]);
 assert.equal(books.length,2);assert.equal(books[0].authors[0],'Aristotle');assert.equal(books[0].year,1902);
 assert.equal(books[0].url,'https://archive.org/details/poetics-test/mode/2up');assert.equal(books[1].year,null);assert.equal(books[1].url,'https://openlibrary.org/works/OL2W');
});
test('search URL encodes keywords and propagates cancellation',async()=>{
 const controller=new AbortController();let requested;
 const result=await searchBooks('Poetics & art',{signal:controller.signal,fetcher:async(url,options)=>{requested=new URL(url);assert.equal(options.signal,controller.signal);return {ok:true,json:async()=>({docs:[]})}}});
 assert.equal(requested.searchParams.get('q'),'Poetics & art');assert.deepEqual(result,[]);
});
test('search reports rate limits and invalid results',async()=>{
 await assert.rejects(searchBooks('x',{fetcher:async()=>({ok:false,status:429})}),/频繁/);
 await assert.rejects(searchBooks('x',{fetcher:async()=>({ok:true,json:async()=>({})})}),/格式/);
});
