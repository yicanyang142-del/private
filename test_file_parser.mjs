import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLocalFile,decodeTXT,textItemsToText,NeedsOCR} from './wenlun-web/dist/file-parser.mjs';
const file=(name,text)=>({name,size:new TextEncoder().encode(text).length,arrayBuffer:async()=>new TextEncoder().encode(text).buffer});
test('TXT preserves Chinese and normalizes newlines',async()=>{
 const result=await parseLocalFile(file('论文.TXT','为情而造文。\r\n为文而造情。'));
 assert.equal(result.text,'为情而造文。\n为文而造情。');assert.equal(result.sections[0].method,'browser-txt');
 assert.equal(decodeTXT(new Uint8Array([255,254,65,0]).buffer),'A');
});
test('browser text extraction preserves words and paragraph boundaries',()=>{
 assert.equal(textItemsToText([{str:'Human'},{str:'thought',hasEOL:true},{str:'为情'},{str:'造文。'}]),'Human thought\n为情造文。');
});
function fakePDF(pages){let destroyed=false;return {getDocument:()=>({promise:Promise.resolve({numPages:pages.length,getPage:async n=>({getTextContent:async()=>({items:[{str:pages[n-1],hasEOL:true}]}),cleanup(){}})}),destroy:async()=>{destroyed=true}}),get destroyed(){return destroyed}}}
test('PDF pages become readable text with source page markers',async()=>{
 const pdfjs=fakePDF(['Hello, world!','为情而造文。']);
 const result=await parseLocalFile(file('paper.pdf','%PDF-fake'),{pdfjs});
 assert.equal(result.sections.length,2);assert.match(result.text,/〔原书第 2 页〕\n为情而造文/);assert.ok(pdfjs.destroyed);
});
test('no text PDF requests OCR instead of pretending conversion succeeded',async()=>{
 const pdfjs=fakePDF(['']);await assert.rejects(parseLocalFile(file('scan.pdf','%PDF-fake'),{pdfjs}),NeedsOCR);assert.ok(pdfjs.destroyed);
});
test('unsupported, empty, oversize and aborted imports stop early',async()=>{
 await assert.rejects(parseLocalFile(file('x.exe','x')),/请选择/);
 await assert.rejects(parseLocalFile(file('x.txt','')),/为空/);
 await assert.rejects(parseLocalFile({name:'x.pdf',size:81*1024*1024}),/80MB/);
 const controller=new AbortController();controller.abort();await assert.rejects(parseLocalFile(file('x.txt','text'),{signal:controller.signal}),{name:'AbortError'});
});
