function BookSearch(){
 const [query,Q]=React.useState(''),[state,S]=React.useState({status:'idle',books:[],error:''}),[retry,R]=React.useState(0);
 const revision=React.useRef(0);
 React.useEffect(()=>{
  const id=++revision.current,controller=new AbortController(),text=query.trim();
  if(!text){S({status:'idle',books:[],error:''});return()=>controller.abort()}
  S({status:'waiting',books:[],error:''});
  const timer=setTimeout(async()=>{
   S({status:'loading',books:[],error:''});
   try{const {searchBooks}=await import('./book-search.mjs');if(controller.signal.aborted)return;
    const books=await searchBooks(text,{signal:controller.signal});if(id===revision.current)S({status:'done',books,error:''});
   }catch(e){if(e.name!=='AbortError'&&id===revision.current)S({status:'error',books:[],error:e instanceof TypeError?'网络连接失败，请重试。':e.message||'网络连接失败，请重试。'})}
  },500);
  return()=>{clearTimeout(timer);controller.abort()};
 },[query,retry]);
 return h('section',{className:'online-books','aria-label':'在线搜书'},h('h2',null,'发现一本经典'),
 h('p',{className:'muted'},'搜索 Open Library 书目；开始阅读将打开原站，全文以授权和借阅状态为准。'),
 h('input',{value:query,onChange:e=>Q(e.target.value),placeholder:'输入书名，例如 Poetics',maxLength:200,'aria-label':'在线搜书关键词',type:'search'}),
 h('div',{'aria-live':'polite'},state.status==='waiting'&&h('p',{className:'muted'},'等待输入完成…'),state.status==='loading'&&h('p',{className:'muted'},'正在寻找相关书籍…'),state.status==='error'&&h('p',{className:'error',role:'alert'},state.error,h('button',{onClick:()=>R(n=>n+1)},'重试')),state.status==='done'&&!state.books.length&&h('p',{className:'muted'},'没有找到相关书籍，试试英文原名或作者名。')),
 h('div',{className:'online-book-grid'},...state.books.map(book=>h('article',{className:'online-book',key:book.id},h('h3',null,book.title),
 h('p',null,book.authors.join(' / ')||'作者暂缺'),h('small',null,'初版年份（书目记录）：'+(book.year??'未知')),h('small',null,book.access),h('a',{href:book.url,target:'_blank',rel:'noopener noreferrer',className:'read-external'},'开始阅读 ↗')))),
 h('small',{className:'muted'},'年份来自 Open Library 书目记录，不代表古代原著成书年代。检索词会发送给该服务，书目不会自动导入本地书架。'));
}
