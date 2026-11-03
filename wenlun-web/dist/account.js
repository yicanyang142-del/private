function AccountGate({children}){
 const [phase,P]=React.useState('loading'),[email,E]=React.useState(''),[password,W]=React.useState(''),[error,X]=React.useState(''),[message,M]=React.useState(''),[busy,B]=React.useState(false),[cloud,C]=React.useState(false);
 async function initialize(){P('loading');X('');try{const config=await api('/auth/config');window.READER_CLOUD=config.cloud;C(config.cloud);if(!config.cloud){P('ready');return}if(!config.configured){P('unconfigured');return}
  const fragment=new URLSearchParams(window.location.hash.slice(1));if(fragment.get('error')||new URLSearchParams(location.search).get('error')){history.replaceState(null,'',location.pathname);M('验证链接已过期或无效，请填写邮箱并重新发送验证邮件。')}
  if(fragment.get('access_token')){const payload={access_token:fragment.get('access_token'),refresh_token:fragment.get('refresh_token')};history.replaceState(null,'',location.pathname);if(fragment.get('type')==='recovery'){await api('/auth/recovery-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});P('reset');return}M('邮箱验证已完成，请使用邮箱与密码登录。')}
  const me=await fetch('/api/me');if(me.status===401){P('login');return}if(!me.ok)throw Error('账户服务暂不可用，请稍后重试');const user=await me.json();E(user.email||'');P('ready')
 }catch(e){X(e.message);P('error')}}
 React.useEffect(()=>{initialize();const expired=()=>{P('login');W('');M('登录状态已过期，请重新登录。')};window.addEventListener('reader-auth-expired',expired);return()=>window.removeEventListener('reader-auth-expired',expired)},[]);
 async function submit(e){e.preventDefault();B(true);X('');M('');try{
   const route=phase==='reset'?'/api/account/password':phase==='forgot'?'/auth/recover':phase==='register'?'/auth/register':'/auth/login';
   const body=phase==='reset'?{password}:phase==='forgot'?{email}:{email,password};
   const result=await api(route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
   W('');if(phase==='login'||phase==='reset'){const me=await api('/api/me');E(me.email||email);P('ready');}else{M(result.message);P('login')}
 }catch(e){X(e.message)}finally{B(false)}}
 async function resend(){B(true);X('');try{if(!email.trim())throw Error('请先填写注册时的邮箱');const r=await api('/auth/resend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});M(r.message)}catch(e){X(e.message)}finally{B(false)}}
 async function logout(){B(true);try{await api('/auth/logout',{method:'POST'});W('');P('login');M('已退出登录')}catch(e){X(e.message)}finally{B(false)}}
 if(phase==='ready')return h(React.Fragment,null,cloud&&h('div',{className:'account-strip'},h('span',null,email||'私人书房'),h('button',{disabled:busy,onClick:logout},'退出登录')),children);
 return h('main',{className:'auth-page'},h('div',{className:'auth-brand'},'文论伴读'),h('p',{className:'muted'},'读不懂的地方，用白话讲清；理解之后，陪你再想深一步。'),
  phase==='loading'?h('p',{role:'status'},'正在连接私人书房…'):
  phase==='unconfigured'?h('p',{className:'error'},'云端账户连接尚未配置。请打开 /auth/config 查看当前运行实例缺少的变量名称（不会显示密钥）。'):
  phase==='error'?h(React.Fragment,null,h('p',{className:'error'},error),h('button',{onClick:initialize},'重新连接')):
  h(React.Fragment,null,h('h1',null,phase==='register'?'创建私人书房':phase==='forgot'?'找回密码':phase==='reset'?'设置新密码':'登录你的书房'),error&&h('p',{className:'error',role:'alert'},error),message&&h('p',{className:'auth-message',role:'status'},message),
   h('form',{onSubmit:submit},phase!=='reset'&&h('label',null,'邮箱',h('input',{type:'email',required:true,autoComplete:'email',value:email,maxLength:254,onChange:e=>E(e.target.value),placeholder:'你的邮箱地址'})),phase!=='forgot'&&h('label',null,'密码',h('input',{type:'password',required:true,minLength:8,maxLength:128,autoComplete:phase==='login'?'current-password':'new-password',value:password,onChange:e=>W(e.target.value),placeholder:'至少8位，请使用独立密码'})),h('button',{type:'submit',className:'primary',disabled:busy},busy?'请稍候…':phase==='register'?'注册':phase==='forgot'?'发送重置邮件':phase==='reset'?'保存新密码':'登录')),
   phase!=='reset'&&h('div',{className:'auth-links'},h('button',{onClick:()=>{P(phase==='register'?'login':'register');X('');M('');W('')}},phase==='register'?'已有账号，去登录':'没有账号？注册'),h('button',{onClick:()=>{P(phase==='forgot'?'login':'forgot');X('');M('');W('')}},phase==='forgot'?'返回登录':'忘记密码')),
   h('button',{type:'button',disabled:busy,onClick:resend},'重新发送验证邮件'),h('p',{className:'muted'},'注册后请检查验证邮件。原著、笔记与批注仅对你的账号开放。AI 回应需要联网并由平台提供模型额度。')));
}
