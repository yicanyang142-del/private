function UploadArea({onImport,onOCR,disabled=false,compact=false}){
 const [phase,setPhase]=React.useState('idle'),[message,setMessage]=React.useState(''),[error,setError]=React.useState(''),[drag,setDrag]=React.useState(false),[ocrFile,setOCRFile]=React.useState(null);
 const input=React.useRef(),controller=React.useRef(),counter=React.useRef(0),active=React.useRef(false);
 React.useEffect(()=>()=>controller.current?.abort(),[]);
 const busy=phase==='parsing'||phase==='saving';
 async function choose(file){
  if(!file||active.current||disabled)return;active.current=true;
  if(window.READER_CLOUD&&file.size>50*1024*1024){active.current=false;setError('云端每份文件上限50MB，请拆分后导入');return}
  const abort=new AbortController();controller.current=abort;setError('');setOCRFile(null);setPhase('parsing');
  try{const {parseLocalFile}=await import('./file-parser.mjs');
   const parsed=await parseLocalFile(file,{signal:abort.signal,onProgress:p=>setMessage(p.message)});
   if(abort.signal.aborted)return;setPhase('saving');setMessage('文字已提取，正在保存到本机并打开阅读器…');
   await onImport(file,parsed,abort.signal);setPhase('idle');setMessage('');
  }catch(e){if(e.name==='AbortError'){setPhase('idle');setMessage('已取消导入')}else{setPhase('error');setError(e.message);if(e.name==='NeedsOCR')setOCRFile(file)}}
  finally{active.current=false;if(input.current)input.current.value=''}
 }
 async function ocr(){if(active.current)return;active.current=true;setPhase('saving');setError('');setMessage('正在交给本机 OCR 转换…');try{await onOCR(ocrFile);setOCRFile(null);setPhase('idle');setMessage('已加入本机转换队列，完成后可从书架打开。')}catch(e){setPhase('error');setError(e.message)}finally{active.current=false}}
 return h('section',{className:(compact?'upload-compact':'upload-area')+(drag?' is-dragging':''),'aria-label':'导入本地文献',
  onDragEnter:e=>{e.preventDefault();counter.current++;setDrag(true)},onDragOver:e=>e.preventDefault(),
  onDragLeave:e=>{e.preventDefault();counter.current--;if(counter.current<=0)setDrag(false)},
  onDrop:e=>{e.preventDefault();counter.current=0;setDrag(false);if(e.dataTransfer.files.length>1){setError('请一次导入一份文献。');return}choose(e.dataTransfer.files[0])}},
  !compact&&h('div',{className:'upload-mark','aria-hidden':true},'↥'),!compact&&h('h2',null,'把一篇原著，放到眼前'),
  !compact&&h('p',null,'拖入 TXT / PDF，或从电脑中选择。'),
  h('input',{ref:input,type:'file',hidden:true,accept:'.txt,.pdf',onChange:e=>choose(e.target.files[0])}),
  h('button',{className:compact?'import-small':'primary',disabled:disabled||busy,onClick:()=>input.current.click()},busy?'正在导入…':compact?'＋ 导入':'选择文献'),
  busy&&h('button',{className:'upload-cancel',disabled:phase==='saving',onClick:()=>controller.current?.abort()},'取消'),
  message&&h('p',{className:'muted',role:'status','aria-live':'polite'},message),error&&h('p',{className:'error',role:'alert'},error),
  ocrFile&&!window.READER_CLOUD&&h('button',{disabled:busy,onClick:ocr},'改用本机 OCR 转文字'),
  ocrFile&&window.READER_CLOUD&&h('p',{className:'muted'},'此版本可能是扫描件，请先在本地完成 OCR 后上传文本。'),
  !compact&&h('small',null,'文字先在浏览器提取，再保存在本机。扫描件需要 OCR；单份不超过 80MB。'));
}
