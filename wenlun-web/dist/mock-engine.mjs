// MODEL CALL BOUNDARY: replace only requestCompanion() with POST /api/companion.
// This file intentionally contains no API Key, SDK, fetch, or model call.
export const EXAMPLES = {
  mimesis: {title:'模仿与创造', author:'教学改写 · 非原著译文', text:'艺术并不只是照搬眼前的事物，而是在模仿中呈现人的行动。诗人关注的不仅是已经发生的事，也包括按照某种联系可能发生的事。因此，一个虚构的故事，也能使我们认识共同的人类处境。'},
  idea: {title:'理式与图像', author:'教学改写 · 非原著译文', text:'如果把理式理解为事物的真实根据，那么感官所见的具体事物便不是认识的终点。图像呈现了事物的外观，却未必揭示它的根据。面对一幅足以乱真的画，我们还应追问：它使我们更接近真实，还是只使外观变得更有说服力？'},
  catharsis: {title:'悲剧与情绪', author:'教学改写 · 非原著译文', text:'悲剧让观众在观看他人遭遇时产生怜悯与恐惧。所谓净化，不能在这里被简单理解为删除所有不愉快的情绪。我们需要考察：这些情绪在故事的展开中发生了怎样的变化，以及这种变化为何值得重视。'}
};
const concepts=[
 {matches:['模仿'],name:'模仿',reading:'可先把“模仿”当作阅读入口：关注文本如何区分再现与机械复制，而不要仅凭一个词就认定作者否定创造。',life:'设想同一件校园事件被写成新闻和拍成短片：不同的选择与组织，会不会改变它呈现的意义？'},
 {matches:['理式','理念'],name:'理式／理念',reading:'可先区分“具体事物”与“使它成为这种事物的根据”。本段不足以独立确定这一术语在某位哲学家全部著作中的定义。',life:'设想一张AI生成的椅子图片与一把可以坐的椅子：你判断它们是否“真实”时，使用的是同一种标准吗？'},
 {matches:['净化'],name:'净化',reading:'可先关注情绪如何发生变化，再区分消除、释放与理解等可能含义。这里不替学界争论作定论，也不把这段材料当作某一译本的权威定义。',life:'设想看完一部悲剧后，你仍感到难过，却更能理解这种难过：情绪还在，是否意味着它没有发生变化？'}
];
export function validateInput(source,selected=''){
 if(typeof source!=='string'||!source.trim())throw Error('请先输入一段原著，再开始伴读。');
 if(source.length>8000)throw Error('一次最多输入8000字，建议选择一个完整段落。');
 if(selected&&!source.includes(selected))throw Error('所选内容已不在当前原文中，请重新划选。');
}
export function chooseQuote(source,selected=''){
 const sentences=source.match(/[^。！？!?\n]+[。！？!?]?/g)?.map(s=>s.trim()).filter(Boolean)||[source.trim()];
 if(selected){const surrounding=sentences.find(s=>s.includes(selected));return surrounding||selected;}
 return sentences.find(s=>concepts.some(c=>c.matches.some(m=>s.includes(m))))||sentences[0];
}
export function validateResponse(result,source){
 if(!Array.isArray(result.questions)||result.questions.length!==3||result.questions.some(q=>!q.text))throw Error('输出结构不正确，必须包含三个追问。');
 if(!result.term?.quote||!source.includes(result.term.quote))throw Error('引用校验未通过：解释中的引句必须与原文逐字一致。');
 return result;
}
export function createMockResponse({source,selected=''}){
 validateInput(source,selected);const quote=chooseQuote(source,selected);
 const lookup=selected||source;
 const concept=concepts.find(c=>c.matches.some(m=>lookup.includes(m)))||(!selected?null:concepts.find(c=>c.matches.some(m=>quote.includes(m))));
 const term=concept?{name:concept.name,definition:concept.reading,metaphor:concept.life}:{name:'核心概念待确认',definition:'演示规则没有识别到预设术语，因此不虚构学术定义。可以先圈出本段反复出现或承担关键论证作用的词，再结合原句确认它的含义。',metaphor:'试着把这个判断放进一个日常情境：换掉其中一个条件，结论还成立吗？'};
 return validateResponse({mode:'mock',focus:selected,questions:[
  {label:'澄清概念',text:concept?`这里的“${concept.name}”与它在日常语言中的意思有什么差别？请找出支持你判断的原文措辞。`:'这段文字中，哪个词的含义最需要澄清？换一种理解，会怎样改变整段论证？'},
  {label:'寻找依据',text:`作者从“${quote}”出发，依靠了什么理由或前提？如果一个前提并未明说，你会怎样从上下文寻找证据？`},
  {label:'挑战与迁移',text:concept?.metaphor||'如果把这段观点放到AI创作或社交媒体的具体情境中，你能提出什么反例，并说明它究竟挑战了原文的哪个判断？'}
 ],term:{...term,quote},disclaimer:'规则生成的假数据，用于体验交互；不是模型的学术判断。'},source);
}
export async function requestCompanion(payload,{signal}={}){
 // TODO(MODEL): return fetch('/api/companion', {method:'POST', ...}).then(...)
 // Future backend: read LLM_API_KEY from environment; demand structured output;
 // validate 3 questions and exact source quotation on the server before returning.
 await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,550);signal?.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('已取消','AbortError'));},{once:true});});
 return createMockResponse(payload);
}
