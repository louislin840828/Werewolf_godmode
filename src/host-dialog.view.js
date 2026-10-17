// Presentation service: callbacks invoke controller intents, never write game state.
var HostDialogs=(()=>{
 let active=null;
 function open(kind,message,done){
  if(active)return false;
  const focus=document.activeElement,dialog=document.createElement('dialog');
  dialog.className='host-dialog';dialog.setAttribute('aria-labelledby','host-dialog-title');
  dialog.innerHTML=`<form method="dialog"><header><span>主持確認</span><h2 id="host-dialog-title">${kind==='alert'?'操作提示':kind==='prompt'?'輸入座號':'確認操作'}</h2></header><p>${esc(message)}</p>${kind==='prompt'?'<label for="host-dialog-input">狼人座號</label><input id="host-dialog-input" name="answer" type="text" inputmode="numeric" autocomplete="off">':''}<footer>${kind==='alert'?'':'<button type="button" data-cancel>取消</button>'}<button class="primary" type="submit">${kind==='alert'?'知道了':'確認'}</button></footer></form>`;
  let closed=false;active=dialog;document.body.append(dialog);
  const finish=value=>{if(closed)return;closed=true;active=null;dialog.close();dialog.remove();if(focus?.isConnected)focus.focus({preventScroll:true});done?.(value);};
  dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();finish(kind==='prompt'?dialog.querySelector('input').value:true);});
  dialog.querySelector('[data-cancel]')?.addEventListener('click',()=>finish(kind==='prompt'?null:false));
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish(kind==='prompt'?null:false);});
  dialog.showModal();(kind==='prompt'?dialog.querySelector('input'):dialog.querySelector('[data-cancel]')||dialog.querySelector('button')).focus();
  return false;
 }
 return Object.freeze({available:typeof window!=='undefined'&&typeof window.HTMLDialogElement==='function',confirm:(message,done)=>open('confirm',message,done),prompt:(message,done)=>open('prompt',message,done),alert:message=>open('alert',message)});
})();
