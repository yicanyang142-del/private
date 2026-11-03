/* Local React client. Originals, progress and annotations are stored in SQLite. */
const h=React.createElement;
async function api(path,options={}){
 const r=await fetch(path,options);let d;try{d=await r.json()}catch{throw Error('服务器没有返回可用数据')}
 if(r.status===401)window.dispatchEvent(new Event('reader-auth-expired'));
 if(!r.ok)throw Error(typeof d.detail==='string'?d.detail:'请求失败，请重试');return d;
}
function Library({onReaderChange=()=>{},initialBook=null}){
 const [books,B]=React.useState([]),[q,Q]=React.useState(''),[book,K]=React.useState(null),[page,P]=React.useState(null),[notes,N]=React.useState([]),[busy,U]=React.useState(false),[error,E]=React.useState(''),[notice,M]=React.useState('');
 const [saved,A]=React.useState([]);
 const [preparing,F]=React.useState(null),[coverVersion,CV]=React.useState(0);
 React.useEffect(()=>{onReaderChange(!!book||!!preparing)},[book,preparing]);
 React.useEffect(()=>{if(initialBook)open(initialBook.book,initialBook.page)},[initialBook]);
 async function refresh(){try{B((await api('/api/books')).books)}catch(e){E(e.message)}}
 React.useEffect(()=>{refresh();const timer=setInterval(refresh,10000);return()=>clearInterval(timer)},[]);
 async function run(fn){U(true);E('');try{await fn()}catch(e){E(e.message)}finally{U(false)}}
 const save=(id,p,n)=>api(`/api/books/${id}/state`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:p,notes:n})});
 async function open(b,targetPage,direct=false){
  if(b.status==='failed')return run(async()=>{await api(`/api/books/${b.id}/retry`,{method:'POST'});M('已重新排队转换');await refresh()});
  if(b.status!=='ready'){M('正文正在转换，扫描版或大部头可能需要较长时间。');return}
  if(!direct&&!targetPage){F(b);K(null);return}
  F(null);
  await run(async()=>{const state=await api(`/api/books/${b.id}/state`);P(await api(`/api/books/${b.id}/pages/${targetPage||state.page}`));A((await api(`/api/books/${b.id}/annotations`)).annotations);N(state.notes);K(b);M('');window.scrollTo(0,0)});
 }
 async function navigate(n){await run(async()=>{const data=await api(`/api/books/${book.id}/pages/${n}`);await save(book.id,n,notes);P(data);window.scrollTo(0,0)})}
 async function importParsed(file,parsed,signal){
  const form=new FormData();form.append('file',file,file.name);form.append('metadata',JSON.stringify(parsed));
  const result=await api('/api/books/browser-import',{method:'POST',body:form,signal});
  const [bookList,data,annotations,state]=await Promise.all([api('/api/books',{signal}),api(`/api/books/${result.id}/pages/1`,{signal}),api(`/api/books/${result.id}/annotations`,{signal}),api(`/api/books/${result.id}/state`,{signal})]);
  if(signal.aborted)return;B(bookList.books);K(bookList.books.find(b=>b.id===result.id));P(data);A(annotations.annotations);N(state.notes);E('');M('');window.scrollTo(0,0);
 }
 async function importOCR(file){await api('/api/books',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(file.name)},body:file});await refresh()}
 function importBackup(){const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=()=>run(async()=>{const file=input.files[0];if(!file)return;if(file.size>2000000)throw Error('备份文件过大');const data=JSON.parse(await file.text());const result=await api('/api/import-browser-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});M(result.already_imported?'这份备份已经导入过':`已迁移 ${result.matched} 本书的阅读记录。旧页码与新分页可能有差异，请核对。`)});input.click()}
 const status={ready:'可以阅读',queued:'等待转换',processing:'正在转换',failed:'转换失败 · 点击重试'};
 const button=(label,fn,disabled=false,primary=false)=>h('button',{onClick:fn,disabled:busy||disabled,className:primary?'primary':''},label);
 if(preparing)return h(React.Fragment,null,error&&h('p',{className:'error',role:'alert'},error),h(LearningGuide,{key:preparing.id,book:preparing,onBack:()=>F(null),onRead:n=>open(preparing,n,true)}));
 return h(React.Fragment,null,
  h('header',null,h('strong',null,'文论伴读'),book?button('返回书架',()=>{K(null);P(null);E('')}):h('span',{className:'muted'},'自己的书，自己的节奏')),
  h('main',{className:book?'reader':''},error&&h('p',{className:'error',role:'alert'},error),notice&&h('p',{className:'muted',role:'status'},notice),
   !book?h(React.Fragment,null,
    h('div',{className:'shelf-heading'},h('div',null,h('p',{className:'eyebrow'},'YOUR LIBRARY'),h('h1',null,'书架')),h(UploadArea,{onImport:importParsed,onOCR:importOCR,disabled:busy,compact:true})),
    h('div',{className:'toolbar'},h('input',{value:q,onChange:e=>Q(e.target.value),placeholder:'搜索书名','aria-label':'搜索书名'})),
    h('div',{className:'books'},...books.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())).map(b=>h('div',{key:b.id,className:'shelf-item'},h('button',{className:'book',onClick:()=>open(b),disabled:busy},h(BookCover,{book:b,version:coverVersion}),h('p',{className:'book-title'},b.title),h('p',{className:'muted'},status[b.status])),h('label',{className:'change-cover'},'设置封面',h('input',{type:'file',hidden:true,accept:'image/jpeg,image/png,image/webp',onChange:e=>{const file=e.target.files[0];if(!file)return;run(async()=>{if(file.size>5*1024*1024)throw Error('封面图片请小于5MB');await api(`/api/books/${b.id}/cover`,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:file});CV(v=>v+1);M('封面已保存在本机')});e.target.value=''}}))))),
    h(FreeBooks,{onImported:async b=>{await refresh();M('已加入书架：'+b.title)}}),
    !books.length&&h('p',{className:'muted'},'暂无书籍。点击右上角「导入」开始。'),!window.READER_CLOUD&&h('div',{className:'actions'},button('导入旧网页阅读记录',importBackup)),h('footer',null,window.READER_CLOUD?'云端支持 TXT 和文字型 PDF，单份上限50MB。扫描件请先在本地完成 OCR。':'上传支持 TXT 和 PDF，单个文件上限 80MB。扫描件可改用本机 OCR；分栏、公式及脚注的顺序请核对原文。')):
   h(DynamicReader,{key:book.id+':'+page.page,book,page,notes,saved,onNotes:N,onSaved:A,onNavigate:navigate,onGuide:()=>{F(book);K(null)}})));
}
