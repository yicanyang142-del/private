function BookCover({book,version=0}){
 const [failed,F]=React.useState(false);
 React.useEffect(()=>F(false),[book.id,version]);
 const palette=['#d1d9cb','#d9c7b8','#c8d7dc','#d6d0b6','#d4c8d8','#d9c4bc'];
 const tone=Array.from(book.title).reduce((sum,c)=>sum+c.codePointAt(0),0)%palette.length;
 return h('div',{className:'shelf-cover',style:{background:palette[tone]}},!failed?h('img',{src:`/api/books/${book.id}/cover?v=${version}`,alt:book.title+'封面',loading:'lazy',onError:()=>F(true)}):h('div',{className:'cover-placeholder'},h('small',null,book.format.toUpperCase()),h('span',null,book.title),h('small',null,'暂无原文件封面')));
}
function NoteFolders({notes,loading,onOpen}){
 const [folder,F]=React.useState(null),[query,Q]=React.useState('');
 const groups=Array.from(new Map(notes.map(n=>[n.book.id,n.book])).values());
 const matched=notes.filter(n=>(!folder||n.book.id===folder.id)&&[n.book.title,n.quote,n.body,n.kind].join(' ').toLowerCase().includes(query.toLowerCase()));
 return h(React.Fragment,null,
  folder&&h('div',{className:'folder-heading'},h('button',{onClick:()=>{F(null);Q('')}},'← 全部书籍'),h('h2',null,folder.title)),
  h('div',{className:'toolbar'},h('input',{value:query,onChange:e=>Q(e.target.value),placeholder:folder?'搜索本书笔记':'搜索书籍或笔记内容','aria-label':'搜索笔记'})),
  loading?h('p',{role:'status'},'正在整理你的笔记…'):
  !folder?h('div',{className:'note-folders'},...groups.filter(b=>matched.some(n=>n.book.id===b.id)).map(b=>h('button',{className:'note-folder',key:b.id,onClick:()=>{F(b);Q('')}},h('span',{className:'folder-symbol','aria-hidden':true},'▰'),h('strong',null,b.title),h('small',null,notes.filter(n=>n.book.id===b.id).length+' 条笔记'),h('span',{className:'folder-open'},'打开 →'))),!matched.length&&h('p',{className:'empty-state'},notes.length?'没有找到匹配的书籍或笔记。':'还没有笔记。阅读时保存想法，每本书会自动形成一个笔记文件夹。')):
  h('div',{className:'note-list'},...matched.map(n=>h('article',{key:n.key,className:'saved-note'},h('small',null,n.kind+' · 第 '+(n.page||1)+' 页'),n.quote&&h('blockquote',null,n.quote),h('p',{className:'note'},n.body),h('button',{onClick:()=>onOpen(n.book,Number(n.page)||1)},'回到原文 →'))),!matched.length&&h('p',{className:'empty-state'},'这本书中没有匹配的笔记。')));
}
