export const IMPORT_LIMITS={bytes:80*1024*1024,pages:2500,characters:2000000};
export class NeedsOCR extends Error{constructor(pages){super(`第 ${pages.slice(0,12).join('、')} 页没有可提取文字，可能是扫描图像或空白页。`);this.name='NeedsOCR';this.pages=pages}}
function checkAbort(signal){if(signal?.aborted)throw new DOMException('已取消导入','AbortError')}
export function decodeTXT(buffer){
 const bytes=new Uint8Array(buffer);let text;
 if(bytes[0]===255&&bytes[1]===254)text=new TextDecoder('utf-16le',{fatal:true}).decode(bytes);
 else if(bytes[0]===254&&bytes[1]===255)text=new TextDecoder('utf-16be',{fatal:true}).decode(bytes);
 else{try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{text=new TextDecoder('gb18030',{fatal:true}).decode(bytes)}}
 text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 if(!text.trim()||text.includes('\0'))throw Error('未读取到有效文本，请检查文件内容或编码。');return text;
}
export function textItemsToText(items){
 let text='',previous='';
 for(const item of items){if(typeof item.str!=='string')continue;
  const value=item.str;
  if(previous&&value&&!/[\s\u3400-\u9fff]$/.test(previous)&&! /^[\s\u3400-\u9fff，。；：！？、）]/.test(value))text+=' ';
  text+=value;if(item.hasEOL){text+='\n';previous=''}else previous=value;
 }
 return text.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
export async function parseLocalFile(file,{signal,onProgress=()=>{},pdfjs:injected}={}){
 const extension=file.name.split('.').pop().toLowerCase();
 if(!['txt','pdf'].includes(extension))throw Error('请选择 .txt 或 .pdf 文献。');
 if(!file.size)throw Error('文件为空，请重新选择。');
 if(file.size>IMPORT_LIMITS.bytes)throw Error('单个文件不能超过80MB。');
 checkAbort(signal);onProgress({stage:'reading',message:'正在读取本地文件…'});
 const buffer=await file.arrayBuffer();checkAbort(signal);
 if(extension==='txt'){
  const text=decodeTXT(buffer);if(text.length>IMPORT_LIMITS.characters)throw Error('正文过长，请拆分后导入。');
  return {text,sections:[{text,method:'browser-txt'}],warnings:[]};
 }
 const pdfjs=injected||await import('./vendor/pdfjs/build/pdf.mjs');checkAbort(signal);
 if(!injected)pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/build/pdf.worker.mjs',import.meta.url).href;
 const base=new URL('./vendor/pdfjs/',import.meta.url).href;
 const task=pdfjs.getDocument({data:new Uint8Array(buffer),cMapUrl:base+'cmaps/',cMapPacked:true,
  standardFontDataUrl:base+'standard_fonts/',wasmUrl:base+'wasm/',isEvalSupported:false});
 const abort=()=>{Promise.resolve(task.destroy()).catch(()=>{})};signal?.addEventListener('abort',abort,{once:true});
 try{
  const pdf=await task.promise;checkAbort(signal);
  if(pdf.numPages>IMPORT_LIMITS.pages)throw Error('PDF超过2500页，请按卷拆分。');
  const sections=[],missing=[];let count=0;
  for(let number=1;number<=pdf.numPages;number++){
   checkAbort(signal);onProgress({stage:'extracting',current:number,total:pdf.numPages,message:`正在提取第 ${number} / ${pdf.numPages} 页`});
   const page=await pdf.getPage(number);const content=await page.getTextContent();checkAbort(signal);
   const text=textItemsToText(content.items);page.cleanup();
   if(!text.trim())missing.push(number);
   sections.push({page:number,text,method:'pdfjs'});count+=text.length;
   if(count>IMPORT_LIMITS.characters)throw Error('提取的正文过长，请拆分文件。');
  }
  if(missing.length)throw new NeedsOCR(missing);
  const text=sections.map(s=>`〔原书第 ${s.page} 页〕\n${s.text}`).join('\n\n');
  if(text.length>IMPORT_LIMITS.characters)throw Error('提取的正文过长，请拆分文件。');
  return {text,sections,
   warnings:['PDF.js 浏览器提取；分栏、脚注与公式的阅读顺序可能有误，请核对原文。']};
 }catch(error){checkAbort(signal);if(error.name==='PasswordException')throw Error('PDF有密码保护，请先解密后导入。');if(error.name==='InvalidPDFException')throw Error('PDF文件损坏或格式无效，请重新导出后上传。');throw error}
 finally{signal?.removeEventListener('abort',abort);await task.destroy().catch(()=>{})}
}
