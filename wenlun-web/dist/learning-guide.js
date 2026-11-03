function LearningGuide({book,onRead,onBack}){
 const [guide,G]=React.useState(null),[busy,B]=React.useState(false),[error,E]=React.useState('');
 const request=React.useRef(null);
 React.useEffect(()=>{const c=new AbortController();request.current=c;api(`/api/learning/books/${book.id}/guide`,{signal:c.signal}).then(d=>G(d.guide)).catch(e=>{if(e.name!=='AbortError')E(e.message)});return()=>{request.current?.abort()}},[book.id]);
 async function generate(){request.current?.abort();const c=new AbortController();request.current=c;B(true);E('');try{const d=await api(`/api/learning/books/${book.id}/guide`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({regenerate:!!guide}),signal:c.signal});G(d.guide)}catch(e){if(e.name!=='AbortError')E(e.message)}finally{if(request.current===c)B(false)}}
 return h('main',{className:'learning-guide-page'},h('div',{className:'guide-top'},h('button',{onClick:onBack},'← 返回'),h('button',{className:'primary',onClick:()=>onRead()},'继续阅读 →')),h('p',{className:'eyebrow'},'按需准备 / 随时开始'),h('h1',null,book.title),h('p',{className:'guide-intro'},'先找到进入这本书的路，也可以直接翻开正文。'),
 error&&h('p',{className:'error',role:'alert'},error),
 !guide&&h('section',{className:'guide-empty'},h('h2',null,'这本书，需要怎样的准备？'),h('p',null,'根据导入文本的开头和可识别的标题，整理必要知识与问题之间的关系。内容随书而变，不要求完成固定步骤。'),h('p',{className:'muted'},'生成时会将书名、开头最多 12,000 字与候选标题发送至已配置的模型。不会把局部摘录称作全书分析。')),
 h('button',{onClick:generate,disabled:busy},busy?'正在对照文本整理准备材料…':guide?'重新生成准备材料':'生成这本书的准备材料'),
 guide&&h(React.Fragment,null,h('p',{className:'guide-intro'},guide.overview),h('p',{className:'muted'},guide.scope),
  h('div',{className:'guide-modules'},...(guide.modules||[]).map((m,i)=>h('section',{key:i},h('h2',null,m.title),h('p',null,m.body),h('details',null,h('summary',null,'查看原文依据'),h('blockquote',null,m.quote),h('button',{onClick:()=>onRead(m.page)},'读这一处 →'))))),
  (guide.map||[]).length>0&&h('section',{className:'problem-map'},h('h2',null,'问题之间的关系'),h('p',{className:'muted'},'这是当前摘录的问题路线，不代表全书目录或完整理论体系。'),h('ol',null,...guide.map.map((m,i)=>h('li',{key:i},h('h3',null,m.title),h('p',null,m.role),h('details',null,h('summary',null,'原文依据'),h('blockquote',null,m.quote)),h('button',{onClick:()=>onRead(m.page)},'从这里读 →'))))),
  (guide.headings||[]).length>0&&h('details',null,h('summary',null,'文本中识别到的候选标题（可能含目录重复）'),h('ul',null,...guide.headings.map((m,i)=>h('li',{key:i},h('button',{onClick:()=>onRead(m.page)},m.title))))),guide.limits&&h('p',{className:'muted'},guide.limits)),
 h('div',{className:'guide-bottom'},h('button',{className:'primary',onClick:()=>onRead()},'现在开始阅读'),h('small',null,'准备材料会保存在本地，可以随时回来查看。')));
}
