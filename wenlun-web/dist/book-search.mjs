export function normalizeBooks(docs){
 return docs.filter(doc=>doc&&typeof doc.title==='string').map(doc=>{
  const match=String(doc.key||'').match(/^(?:\/works\/)?(OL\d+W)$/);
  if(!match)return null;
  const ia=Array.isArray(doc.ia)?doc.ia.find(id=>typeof id==='string'&&/^[a-zA-Z0-9_.-]+$/.test(id)):null;
  const publicAccess=doc.ebook_access==='public';
  return {id:match[1],title:doc.title,authors:Array.isArray(doc.author_name)?doc.author_name.filter(a=>typeof a==='string'):[],
   year:Number.isInteger(doc.first_publish_year)?doc.first_publish_year:null,
   url:publicAccess&&ia?`https://archive.org/details/${encodeURIComponent(ia)}/mode/2up`:`https://openlibrary.org/works/${match[1]}`,
   access:publicAccess?'公开可读':doc.ebook_access==='borrowable'?'可能需要借阅':'全文权限以来源页为准'};
 }).filter(Boolean);
}
export async function searchBooks(query,{signal,fetcher=fetch}={}){
 const params=new URLSearchParams({q:query.trim(),limit:'12',fields:'key,title,author_name,first_publish_year,ebook_access,ia'});
 const response=await fetcher('https://openlibrary.org/search.json?'+params,{signal});
 if(!response.ok)throw Error(response.status===429?'搜书请求过于频繁，请稍后重试。':'Open Library 搜索暂时不可用。');
 let data;try{data=await response.json()}catch{throw Error('搜书服务未返回有效JSON。')}
 if(!Array.isArray(data.docs))throw Error('搜书服务返回格式异常。');
 return normalizeBooks(data.docs);
}
