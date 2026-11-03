import {EXAMPLES,requestCompanion,validateInput,validateResponse} from './mock-engine.mjs';
const $=id=>document.getElementById(id);
let selected='',result=null,request=null,toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2400);}
function clearResults(){request?.abort();request=null;result=null;$('result').hidden=true;$('loading').hidden=true;$('empty-result').hidden=false;$('generate').disabled=false;$('generate').textContent='开始伴读 ↗';}
function sync(){clearResults();selected='';$('selection-tools').hidden=true;$('reading').textContent=$('source').value||'原文会显示在这里。你可以先点上方任一试读示例。';$('char-count').textContent=`${$('source').value.length} / 8000 字`;$('error').hidden=true;}
function setView(name){for(const view of ['studio','connect'])$(view).hidden=view!==name;document.querySelectorAll('.nav').forEach(button=>button.classList.toggle('active',button.dataset.view===name));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('source').addEventListener('input',()=>{sync();$('sample-label').textContent='当前引用依据：你输入的文本。'});
document.querySelectorAll('[data-sample]').forEach(button=>button.addEventListener('click',()=>{const example=EXAMPLES[button.dataset.sample];$('source').value=example.text;sync();$('sample-label').textContent=example.author+' · '+example.title;}));
$('clear').addEventListener('click',()=>{if($('source').value&&!confirm('清空当前原文和伴读结果？未复制的思考内容也会清空。'))return;$('source').value='';sync();$('source').focus();});
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function render(data,source){
 validateResponse(data,source);result=data;$('questions').replaceChildren();
 data.questions.forEach((question,index)=>{
  const card=element('section','question');const title=element('div','question-title');title.append(element('span','',String(index+1).padStart(2,'0')),element('h3','',question.label));card.append(title,element('p','',question.text));
  const details=element('details');details.append(element('summary','','＋ 写下我的思考（仅当前页面保留）'));const reflection=element('textarea','reflection');reflection.setAttribute('aria-label','对第'+(index+1)+'个追问的思考');reflection.placeholder='我的判断是……原文中的依据是……';reflection.maxLength=2000;details.append(reflection);card.append(details);$('questions').append(card);
 });
 $('term-name').textContent=data.term.name;$('term-quote').textContent=data.term.quote;$('term-definition').textContent=data.term.definition;$('term-metaphor').textContent=data.term.metaphor;
 $('focus').hidden=!data.focus;$('focus').textContent='本次关注：'+data.focus;
 $('result').hidden=false;$('empty-result').hidden=true;
}
async function generate(useSelection=false){
 const source=$('source').value;try{validateInput(source,useSelection?selected:'');}catch(error){$('error').textContent=error.message;$('error').hidden=false;$('source').focus();return;}
 request?.abort();const controller=new AbortController();request=controller;
 $('error').hidden=true;$('result').hidden=true;$('empty-result').hidden=true;$('loading').hidden=false;$('generate').disabled=true;$('generate').textContent='正在准备……';
 try{const data=await requestCompanion({source,selected:useSelection?selected:''},{signal:controller.signal});if(request!==controller)return;render(data,source);if(matchMedia('(max-width:640px)').matches)$('result-title').scrollIntoView({behavior:'smooth',block:'start'});}
 catch(error){if(error.name!=='AbortError'){$('error').textContent=error.message;$('error').hidden=false;$('empty-result').hidden=false;}}
 finally{if(request===controller){$('loading').hidden=true;$('generate').disabled=false;$('generate').textContent='开始伴读 ↗';}}
}
$('generate').addEventListener('click',()=>generate(false));$('regenerate').addEventListener('click',()=>generate(!!result?.focus));
document.addEventListener('selectionchange',()=>{
 const selection=window.getSelection();if(!selection||selection.isCollapsed)return;
 if(!$('reading').contains(selection.anchorNode)||!$('reading').contains(selection.focusNode))return;
 const text=selection.toString().trim();if(!text||!$('source').value.includes(text))return;
 selected=text;$('selection-label').textContent='已选 '+selected.length+' 字 · 保留整段作为上下文';$('selection-tools').hidden=false;
});
$('help-selection').addEventListener('click',()=>generate(true));$('inspire-selection').addEventListener('click',()=>generate(true));
$('copy-result').addEventListener('click',async()=>{
 if(!result)return;
 const reflections=[...document.querySelectorAll('.reflection')];
 const text=['文论伴读｜模拟演示',...result.questions.map((q,i)=>`${i+1}. ${q.text}${reflections[i].value?'\n我的思考：'+reflections[i].value:''}`),'术语：'+result.term.name,'原文引句：'+result.term.quote,result.term.definition,result.term.metaphor,'说明：规则生成的假数据，不是模型的学术判断。'].join('\n\n');
 try{await navigator.clipboard.writeText(text);toast('已复制伴读卡片与当前思考');}catch{toast('浏览器未允许复制，请手动选择结果文字复制。');}
});
sync();
