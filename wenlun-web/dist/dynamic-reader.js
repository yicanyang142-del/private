/* React Context + reducer: selection is a snapshot, not a live DOM Range. */
const ReaderContext=React.createContext(null);
const readerInitial={selection:null,anchor:null,menu:false,open:false,phase:'chat',questions:[],chosen:'',turns:[],draft:'',loading:false,error:'',academic:false,provider:'auto',mode:'answer',kind:'理解',trace:[],traceNotice:''};
function readerReducer(state,action){
 if(action.type==='SELECT')return {...readerInitial,selection:action.selection,anchor:action.anchor,menu:true};
 if(action.type==='PATCH')return {...state,...action.value};
 return state;
}
function useReader(){return React.useContext(ReaderContext)}
function useTextSelection(ref,onSelect,onCollapse){
 React.useEffect(()=>{
  let timer;
  const inspect=()=>{
   const selection=window.getSelection(),root=ref.current;
   if(!selection||selection.isCollapsed){onCollapse();return}
   if(!root?.contains(selection.anchorNode)||!root.contains(selection.focusNode))return;
   const range=selection.getRangeAt(0),raw=range.toString(),text=raw.trim();
   if(!text||Array.from(text).length>2000)return;
   const prefix=range.cloneRange();prefix.selectNodeContents(root);prefix.setEnd(range.startContainer,range.startOffset);
   const start=Array.from(prefix.toString()).length+Array.from(raw.slice(0,raw.length-raw.trimStart().length)).length;
   const rect=range.getClientRects()[0]||range.getBoundingClientRect();
   if(rect.bottom<0||rect.top>window.innerHeight){onCollapse();return}
   const width=Math.min(150,window.innerWidth-24);
   onSelect({text,start,end:start+Array.from(text).length},{left:Math.max(12,Math.min(rect.left+rect.width/2-width/2,window.innerWidth-width-12)),top:rect.top>=62?rect.top-54:rect.bottom+12,width});
  };
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(inspect,140)};
  document.addEventListener('selectionchange',schedule);document.addEventListener('pointerup',schedule);
  window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
  return()=>{clearTimeout(timer);document.removeEventListener('selectionchange',schedule);document.removeEventListener('pointerup',schedule);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule)};
 },[ref,onSelect,onCollapse]);
}
function SelectionToolbar(){
 const {state,begin}=useReader();
 if(!state.menu||!state.anchor)return null;
 return h('div',{className:'selection-toolbar',style:state.anchor,role:'toolbar','aria-label':'选区操作',onPointerDown:e=>e.preventDefault()},
 h('button',{onClick:()=>begin('chat')},'AI 提问'));
}
function DynamicGuide({data,depth=0}){
 if(data==null)return null;
 if(depth>4)return h('p',null,'更多信息请查看文献来源。');
 if(Array.isArray(data))return h('ul',null,...data.map((v,i)=>h('li',{key:i},h(DynamicGuide,{data:v,depth:depth+1}))));
 if(typeof data==='object')return h('dl',{className:'dynamic-guide'},...Object.entries(data).map(([key,value])=>h('div',{key},h('dt',null,key),h('dd',null,h(DynamicGuide,{data:value,depth:depth+1})))));
 return h('span',null,String(data));
}
function QuestionDeck(){
 const {state,discuss}=useReader();
 return h('div',{className:'question-deck'},h('p',{className:'muted'},'哪一个问题让你想停下来？选一个，开始深入讨论。'),
 ...state.questions.map((q,i)=>h('button',{className:'question-card',key:q.id,onClick:()=>discuss(q.question),disabled:state.loading},h('small',null,`0${i+1} / ${q.angle}`),h('p',null,q.question),h('span',null,'沿着这个问题想下去 ↗'))));
}
function AcademicSources({result}){
 const sources=result.sources||[],views=result.scholarly_views||[];
 return h(React.Fragment,null,
 result.retrieval&&h('p',{className:'muted'},result.retrieval.notice),
 ...views.map((view,i)=>h('section',{key:i,className:'scholarly-view'},h('h3',null,view.perspective),h('p',null,view.claim),h('small',null,'来源：'+view.source_ids.map(id=>'['+id+']').join(' ')),
 ...view.evidence.map((e,j)=>h('blockquote',{key:j},'['+e.source_id+'] '+e.quote)))),
 sources.length>0&&h('details',{className:'academic-sources'},h('summary',null,`学术检索来源 · ${sources.length} 条（摘要，未核对全文）`),
 ...sources.map(s=>h('div',{className:'academic-source',key:s.id},h('a',{href:s.url,target:'_blank',rel:'noopener noreferrer'},`[${s.id}] ${s.title}`),h('small',null,s.domain),s.authors&&h('p',null,s.authors.join(' / ')||'作者暂缺'),s.year!==undefined&&h('small',null,`发表年份：${s.year??'未知'} · 引用量：${s.cited_by_count??'未知'}`),h('p',null,s.has_abstract===false?'OpenAlex未提供可重建的摘要，不能推断论文观点。':s.abstract||s.snippet)))));
}
function MentorDrawer(){
 const {state,patch,close,discuss,saveTurn,saveNote,traceConcept,goTo,notes,saved}=useReader();
 const panel=React.useRef(),closeRef=React.useRef(),oldFocus=React.useRef();
 React.useEffect(()=>{if(!state.open)return;oldFocus.current=document.activeElement;closeRef.current?.focus();return()=>oldFocus.current?.focus?.()},[state.open]);
 React.useEffect(()=>{if(!state.open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[state.open]);
 if(!state.open)return null;
 function keydown(e){if(e.key==='Escape'){close();return}if(e.key==='Tab'){const list=Array.from(panel.current.querySelectorAll('button:not(:disabled),textarea,input,select,a[href]'));const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
 const renderAnswer=result=>h(React.Fragment,null,result.quote&&h('blockquote',null,result.quote),result.acknowledgment&&h('p',null,result.acknowledgment),h('p',{className:'tutor-analysis'},result.scaffold||result.sentence),h(AcademicSources,{result}),...(result.citations||[]).map((c,i)=>h('blockquote',{key:i},'['+c.source_id+'] '+c.quote)),result.question&&h('p',{className:'tutor-question'},result.question),result.evidence_limit&&h('p',{className:'muted'},result.evidence_limit));
 return h('div',{className:'mentor-layer'},h('div',{className:'mentor-shade',onClick:close}),h('aside',{ref:panel,className:'mentor-drawer',role:'dialog','aria-modal':true,'aria-labelledby':'mentor-heading',onKeyDown:keydown},
 h('div',{className:'mentor-heading'},h('div',null,h('small',null,'按你的困难，提供恰好的帮助'),h('h2',{id:'mentor-heading'},'随行导师')),h('button',{ref:closeRef,onClick:close,'aria-label':'关闭随行导师'},'✕')),
 state.phase!=='archive'&&state.selection&&h('blockquote',{className:'selection-excerpt'},state.selection.text),
 state.error&&h('p',{className:'error',role:'alert'},state.error),
 state.phase!=='archive'&&h(React.Fragment,null,
  h('label',{className:'academic-toggle'},h('input',{type:'checkbox',checked:state.academic,disabled:state.loading,onChange:e=>patch({academic:e.target.checked})}),'检索学术来源'),
  state.academic&&h('details',{className:'source-settings'},h('summary',null,'来源设置'),h('select',{'aria-label':'学术资料来源',value:state.provider,onChange:e=>patch({provider:e.target.value}),disabled:state.loading},...Object.entries({auto:'多源检索',openalex:'OpenAlex · 论文摘要',crossref:'Crossref · 书目与摘要',semantic:'Semantic Scholar · 论文摘要',tavily:'Tavily · 学术网页'}).map(([value,label])=>h('option',{key:value,value},label))),h('p',{className:'muted'},'检索词发送至所选服务；摘要交给模型。部分接口可能需要密钥或受限流。')),
  state.loading&&h('p',{className:'muted',role:'status'},state.mode==='discuss'?'正在结合原文和已有理解寻找值得深究的问题…':'正在对照原文分析…'),
  ...state.turns.map((t,i)=>h('section',{className:'answer',key:i},h('small',null,t.result.intent==='discuss'?'深入讨论':t.result.intent==='review'?'理解回顾':'原文问答'),t.input&&h('p',null,'你：'+t.input),renderAnswer(t.result),h('div',{className:'actions'},h('button',{disabled:state.loading||!!t.savedId,onClick:()=>saveTurn(t,i)},t.savedId?'已保存笔记':'保存为笔记'),h('button',{disabled:state.loading,onClick:()=>discuss('evidence','请核对上轮解释的原文依据和推断边界。')},'这一步依据是什么')))),
  h('form',{onSubmit:e=>{e.preventDefault();if(state.draft.trim())discuss(state.mode)}},h('label',{htmlFor:'mentor-draft'},state.mode==='review'?'我的白话总结':'提问'),h('div',{className:'question-input'},h('textarea',{id:'mentor-draft',value:state.draft,maxLength:4000,onChange:e=>patch({draft:e.target.value}),placeholder:state.mode==='review'?'试着用两三句话解释这一段，也可以直接说哪里还没想清楚。':'用通俗一点的话解释这段话；\n这里没看懂，可以举一个贴切的例子吗？'}),h('button',{type:'submit',className:'primary send-question',disabled:state.loading||!state.draft.trim()},'发送'))),
  h('div',{className:'actions mentor-actions'},h('button',{onClick:()=>discuss('discuss'),disabled:state.loading},'与导师讨论'),h('button',{onClick:saveNote,disabled:state.loading},'保存为笔记')),
  h('details',{className:'learning-extras'},h('summary',null,'按需探索'),h('div',{className:'actions'},h('button',{onClick:traceConcept,disabled:state.loading},'追踪这个概念'),h('button',{onClick:()=>patch({mode:'review',draft:'',error:''})},'回顾我的理解')),h('label',{className:'note-kind'},'保存为 ',h('select',{value:state.kind,onChange:e=>patch({kind:e.target.value})},h('option',{value:'理解'},'我的理解'),h('option',{value:'未解问题'},'未解问题'))),state.traceNotice&&h('p',{className:'muted'},state.traceNotice),...state.trace.map((m,i)=>h('div',{key:i,className:'trace-hit'},h('small',null,'第 '+m.page+' 页'),h('p',null,m.quote),h('button',{onClick:()=>goTo(m.page)},'回到这一处'))))
 ),
 state.phase==='archive'&&h(React.Fragment,null,!saved.length&&!notes.length&&h('p',{className:'muted'},'还没有保存的笔记。'),...saved.map(a=>h('section',{className:'answer',key:a.id},h('small',null,'第 '+a.page+' 页 · AI 批注'),a.user_input&&h('p',null,a.user_input),renderAnswer(a.response))),...notes.map((n,i)=>h('section',{className:'note',key:'note'+i},h('small',null,'第 '+n.page+' 页 · '+(n.kind||'我的理解')),n.quote&&h('blockquote',null,n.quote),h('p',null,n.text)))),
 h('p',{className:'muted'},'AI 分析可质疑，理解检验可跳过；想继续读时随时关闭。')));
}
function DynamicReader(props){
 const {book,page,notes,saved,onNotes,onSaved,onNavigate}=props;
 const [state,dispatch]=React.useReducer(readerReducer,readerInitial);
 const latest=React.useRef(state);latest.current=state;
 const textRef=React.useRef(),request=React.useRef(null),revision=React.useRef(0),snapshot=React.useRef(null);
 const patch=React.useCallback(value=>dispatch({type:'PATCH',value}),[]);
 const cancel=()=>{revision.current++;request.current?.abort();request.current=null};
 React.useEffect(()=>()=>{revision.current++;request.current?.abort()},[]);
 const collapse=React.useCallback(()=>patch({menu:false}),[patch]);
 const select=React.useCallback((selection,anchor)=>{
  if(latest.current.open)return;
  if(snapshot.current?.start===selection.start&&snapshot.current?.end===selection.end){patch({anchor,menu:true});return}
  revision.current++;request.current?.abort();snapshot.current=selection;
  dispatch({type:'SELECT',selection,anchor});
 },[patch]);
 useTextSelection(textRef,select,collapse);
 const gesture=React.useRef(null),turning=React.useRef(false);
 function pointerDown(e){if(e.button!==0||state.open||!e.target.closest('main.reader')||e.target.closest('button,a,input,textarea,select,summary,details,.mentor-layer'))return;gesture.current={x:e.clientX,y:e.clientY,time:Date.now(),pointer:e.pointerId,selected:!!window.getSelection()?.toString()}}
 function turn(delta){const n=page.page+delta;if(turning.current||n<1||n>page.total)return;turning.current=true;Promise.resolve(onNavigate(n)).finally(()=>{turning.current=false})}
 function pointerUp(e){const g=gesture.current;gesture.current=null;if(!g||g.pointer!==e.pointerId||state.open||g.selected||window.getSelection()?.toString())return;const dx=e.clientX-g.x,dy=e.clientY-g.y,elapsed=Date.now()-g.time;
  if(elapsed>500)return;
  if(e.pointerType==='touch'&&Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.7){turn(dx<0?1:-1);return}
  if(Math.abs(dx)>8||Math.abs(dy)>8)return;
  const r=textRef.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;
  if(x>.75)turn(1);else if(x<.25)turn(-1);
 }
 React.useEffect(()=>{const cancelGesture=()=>{gesture.current=null};document.addEventListener('pointerdown',pointerDown);document.addEventListener('pointerup',pointerUp);document.addEventListener('pointercancel',cancelGesture);return()=>{document.removeEventListener('pointerdown',pointerDown);document.removeEventListener('pointerup',pointerUp);document.removeEventListener('pointercancel',cancelGesture)}},[page.page,page.total,state.open]);
 React.useEffect(()=>{function key(e){if(latest.current.open||/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable||window.getSelection()?.toString())return;if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}}document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[page.page,page.total]);

 const payload=()=>({book_id:book.id,page:page.page,selected_text:state.selection.text,start:state.selection.start,end:state.selection.end});
 async function fetchAI(route,body,success){
  cancel();const id=revision.current;const controller=new AbortController();request.current=controller;patch({loading:true,error:''});
  try{const result=await api('/api/reader/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});if(id===revision.current)success(result)}
  catch(e){if(e.name!=='AbortError'&&id===revision.current)patch({error:e.message})}
  finally{if(id===revision.current)patch({loading:false})}
 }
 async function begin(phase){patch({open:true,menu:false,phase,mode:'answer',error:'',...(phase==='cards'?{questions:[]}: {})});if(phase==='cards')await fetchAI('inspire',payload(),result=>patch({questions:result.questions}));}
 async function discuss(intent='answer',override){
  const input=override===undefined?state.draft:override;
  patch({phase:'chat',mode:intent==='evidence'?state.mode:intent,open:true,menu:false});
  cancel();const id=revision.current,controller=new AbortController();request.current=controller;patch({loading:true,error:''});
  try{const result=await api('/api/learning/tutor',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({...payload(),intent,user_message:input,academic_search:state.academic,research_provider:state.provider,history:state.turns.slice(-8).map(t=>({user:t.input,assistant:{quote:t.result.quote,scaffold:t.result.scaffold,question:t.result.question}}))})});if(id===revision.current)patch({turns:[...state.turns,{input,result}],draft:''})}
  catch(e){if(e.name!=='AbortError'&&id===revision.current)patch({error:e.message})}finally{if(id===revision.current)patch({loading:false})}
 }
 async function traceConcept(){if(Array.from(state.selection.text).length>60){patch({error:'请缩小选区到一个概念（不超过60字）'});return}try{const result=await api(`/api/learning/books/${book.id}/trace?term=${encodeURIComponent(state.selection.text)}&page=${page.page}`);patch({trace:result.matches,traceNotice:result.scope+(result.matches.length?'':' 未找到其他出现位置。'),error:''})}catch(e){patch({error:e.message})}}
 function goTo(n){if(state.draft&&!confirm('当前输入尚未保存，确认离开这一页？'))return;close();onNavigate(n)}
 async function saveTurn(turn,index){try{const result=await api(`/api/books/${book.id}/annotations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:page.page,quote:turn.result.quote,user_input:turn.input,response:turn.result})});patch({turns:state.turns.map((t,i)=>i===index?{...t,savedId:result.id}:t)});onSaved((await api(`/api/books/${book.id}/annotations`)).annotations)}catch(e){patch({error:e.message})}}
 async function saveNote(){
  if(!state.draft.trim()&&state.turns.length&&state.kind!=='未解问题'){const turn=state.turns.at(-1);if(turn.savedId){patch({error:'这条回复已经保存，可在笔记中查看。'});return}return saveTurn(turn,state.turns.length-1)}
  try{const next=[...notes,{page:page.page,text:state.draft||(state.kind==='未解问题'?state.turns.at(-1)?.result.question:'')||state.selection.text,kind:state.kind,quote:state.selection.text,created_at:new Date().toISOString()}];await api(`/api/books/${book.id}/state`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:page.page,notes:next})});onNotes(next);patch({draft:'',error:''})}catch(e){patch({error:e.message})}
 }
 const close=()=>{cancel();patch({open:false,menu:false,loading:false})};
 const value={state,patch,begin,discuss,saveTurn,saveNote,traceConcept,goTo,close,notes,saved};
 return h(ReaderContext.Provider,{value},h('p',{className:'muted'},'上下文阅读 / 划选一段，让问题从原文中生长'),h('h1',null,book.title),
 h('div',{className:'reader-tools'},h('small',null,`第 ${page.page} / ${page.total} 页`),h('button',{onClick:props.onGuide},'问题地图 / 读前准备'),h('button',{onClick:()=>patch({open:true,phase:'archive',menu:false,error:''})},`我的笔记 · ${saved.length+notes.length}`)),
 h('details',null,h('summary',null,'文献线索'),h(DynamicGuide,{data:book.metadata||{'文献':book.title,'来源':'本地导入；版本信息待核对'}})),
 page.warnings.length>0&&h('p',{className:'muted'},page.warnings.join('；')),
 h('article',{ref:textRef,className:'prose dynamic-prose'},page.text),h(SelectionToolbar),
 h('div',{className:'reading-progress'},h('span',null,'左侧上一页 · 右侧下一页 · 滑动翻页'),h('label',null,'跳至 ',h('select',{'aria-label':'跳转页码',value:page.page,onChange:e=>onNavigate(Number(e.target.value))},...Array.from({length:page.total},(_,i)=>h('option',{key:i+1,value:i+1},i+1))), ' / '+page.total)),

 h(MentorDrawer));
}
