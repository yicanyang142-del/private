/* Product navigation. Library and reader retain their existing persistence APIs. */
const selections=[
 {title:'苏菲的世界',author:'乔斯坦·贾德',tag:'哲学入门',desc:'借助小说进入哲学问题，适合第一次接触哲学史。',color:'#ddd5c5'},
 {title:'艺术的故事',author:'E. H. 贡布里希',tag:'艺术与审美',desc:'从作品与历史入手，观察艺术如何回应它的时代。',color:'#cdd7cf'},
 {title:'社会学的想象力',author:'C. 赖特·米尔斯',tag:'社会学视角',desc:'连接个人经历与社会结构，适合带着现实问题慢读。',color:'#d7c9bd'},
 {title:'观看之道',author:'约翰·伯格',tag:'视觉文化',desc:'从日常观看出发，思考图像、表达与社会。',color:'#d7d6bc'}
];
function Product(){
 const [entered,enter]=React.useState(false),[tab,T]=React.useState('首页'),[reading,R]=React.useState(false),[target,S]=React.useState(null);
 const [books,B]=React.useState([]),[notes,N]=React.useState([]),[query,Q]=React.useState(''),[status,C]=React.useState(null),[error,E]=React.useState(''),[loading,L]=React.useState(false),[message,M]=React.useState('');
 async function refresh(){B((await api('/api/books')).books)}
 React.useEffect(()=>{if(!entered)return;refresh().catch(e=>E(e.message));api('/api/status').then(C).catch(e=>E(e.message))},[entered,tab]);
 React.useEffect(()=>{if(tab!=='笔记'||!entered)return;let active=true;L(true);E('');
  Promise.all(books.map(async b=>{const [s,a]=await Promise.all([api(`/api/books/${b.id}/state`),api(`/api/books/${b.id}/annotations`)]);return [...s.notes.map((n,i)=>({...n,key:b.id+'n'+i,book:b,kind:n.kind||'个人笔记',body:n.text})),...a.annotations.map(n=>({...n,key:b.id+'a'+n.id,book:b,kind:'AI 批注',body:[n.user_input,n.response?.scaffold,n.response?.question].filter(Boolean).join('\n')}))]})).then(items=>{if(active)N(items.flat())}).catch(e=>{if(active)E(e.message)}).finally(()=>{if(active)L(false)});return()=>{active=false}
 },[tab,books,entered]);
 function switchTab(value){T(value);R(false);S(null);E('');M('');window.scrollTo(0,0)}
 function openBook(book,page){S({book,page});T('书架');window.scrollTo(0,0)}
 async function exportNotes(){L(true);E('');try{const entries=await Promise.all(books.map(async b=>({book:{id:b.id,title:b.title},state:await api(`/api/books/${b.id}/state`),annotations:(await api(`/api/books/${b.id}/annotations`)).annotations})));const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exported_at:new Date().toISOString(),entries},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='文论伴读-笔记备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);M('笔记已导出。完整书籍与数据库请另行备份 data/ 文件夹。')}catch(e){E(e.message)}finally{L(false)}}
 const intro=(title,subtitle)=>h('div',{className:'page-intro'},h('p',{className:'eyebrow'},'文论伴读 / 你的阅读空间'),h('h1',null,title),h('p',{className:'muted'},subtitle));
 if(!entered)return h('main',{className:'entry'},h('span',{className:'entry-mark'},'文'),h('p',{className:'eyebrow'},'READ · UNDERSTAND · REFLECT'),h('h1',null,'文论伴读'),h('p',{className:'entry-subtitle'},'在字句之间，打开理解的可能。'),h('p',{className:'muted'},'读一本书，从自己的问题开始。'),h('button',{className:'primary entry-button',onClick:()=>enter(true)},'进入文论伴读 →'),h('small',null,window.READER_CLOUD?'书籍、进度与批注，保存在你的私人书房。':'书籍、进度与批注，留在这台电脑。'));
 return h(React.Fragment,null,
  tab!=='书架'&&h('header',null,h('strong',null,'文论伴读'),h('span',{className:'muted'},'慢读，深思')),
  error&&h('p',{className:'error',role:'alert'},error),message&&h('p',{role:'status'},message),
  tab==='书架'?h('div',{className:reading?'':'shelf-shell'},h(Library,{onReaderChange:R,initialBook:target})):
  h('main',{className:'app-main'},
   tab==='首页'?h(React.Fragment,null,intro('阅读','从一个问题出发，走进一本书。'),
    h('section',{className:'continue-reading'},h('div',null,h('small',null,'把时间留给原著'),h('h2',null,books.length?'回到你的书架':'开始第一段阅读'),h('p',{className:'muted'},books.length?`已有 ${books.length} 本本地文献，打开后接着上次的位置阅读。`:'导入一份 TXT 或 PDF，在阅读中随时寻求帮助。')),h('button',{onClick:()=>switchTab('书架')},'去书架 →')),
    h('div',{className:'section-title'},h('h2',null,'入门精选'),h('small',null,'编辑精选 · 哲学 / 艺术 / 社会学')),
    h('div',{className:'recommendations'},...selections.map(r=>{const local=books.find(b=>b.status==='ready'&&b.title.includes(r.title));return h('article',{key:r.title,className:'recommendation'},h('div',{className:'mini-cover',style:{background:r.color}},h('small',null,r.tag),h('h3',null,r.title),h('span',null,r.author)),h('p',null,r.desc),h('small',null,local?'书架已有正文':'推荐书目 · 暂无本地正文'),h('button',{onClick:()=>local?openBook(local):switchTab('书架')},local?'开始阅读':'去书架导入'))})),
    h('section',{className:'discovery'},h('h2',null,'寻找下一本书'),h('p',{className:'muted'},'搜索公开书目信息。外部阅读入口由原网站提供。'),h(BookSearch))):
   tab==='笔记'?h(React.Fragment,null,intro('笔记','按书归档，让每次思考都有归处。'),h(NoteFolders,{notes,loading,onOpen:openBook})):
   h(React.Fragment,null,intro('我的','管理你的阅读空间。'),h('section',{className:'profile-card'},h('span',{className:'profile-avatar'},'读'),h('div',null,h('h2',null,window.READER_CLOUD?'私人书房':'本地读者'),h('p',{className:'muted'},window.READER_CLOUD?'书籍和笔记仅属于当前登录账号。':'不需要注册，数据保存在你的电脑。'))),h('div',{className:'account-stats'},h('div',null,h('strong',null,books.length),h('small',null,window.READER_CLOUD?'私人藏书':'本地书籍')),h('div',null,h('strong',null,window.READER_CLOUD?'云端':'本机'),h('small',null,'存储位置'))),h('section',{className:'settings-section'},h('h2',null,'AI 伴读'),h('p',{className:'muted'},status?(status.configured?'模型接口已配置。使用时会将选区与相关上下文发送至模型服务。':'模型接口尚未配置，请在本地 .env 中配置密钥。'):'正在确认接口状态…')),h('section',{className:'settings-section'},h('h2',null,'数据与备份'),h('p',{className:'muted'},window.READER_CLOUD?'书籍与笔记保存在受登录权限保护的云端数据库及私有文件存储。建议定期导出笔记；退出登录后他人无法访问你的书房。':'书籍与记录集中在项目 data/ 文件夹。完整备份前请先关闭服务，再复制整个文件夹；密钥 .env 请单独妥善保管。'),h('button',{onClick:exportNotes,disabled:loading},loading?'正在导出…':'导出全部笔记')),h('section',{className:'settings-section'},h('h2',null,'阅读方式'),h('p',{className:'muted'},'划选原文，按需要提问或探索。阅读节奏由你决定。')))),
  !reading&&h('nav',{className:'bottom-nav','aria-label':'主导航'},...['首页','书架','笔记','我的'].map((name,i)=>h('button',{key:name,className:tab===name?'active':'','aria-current':tab===name?'page':undefined,onClick:()=>switchTab(name)},h('span',{'aria-hidden':true},['⌂','▤','✎','○'][i]),h('span',null,name)))));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(AccountGate,null,h(Product)));
