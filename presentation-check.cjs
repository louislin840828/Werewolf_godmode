const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/game.js','utf8');
class Element{
 constructor(tag,classes='',attrs={}){this.nodeType=1;this.tagName=tag.toUpperCase();this.attrs={...attrs};if(classes)this.attrs.class=classes;this.childNodes=[];this.parentElement=null;this.value='';this.open=false}
 get id(){return this.attrs.id||''}get classList(){return (this.attrs.class||'').split(' ')}
 get dataset(){return {portraitRole:this.attrs['data-portrait-role']}}
 get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}))}
 get firstChild(){return this.childNodes[0]||null}get nextSibling(){const list=this.parentElement?.childNodes||[];return list[list.indexOf(this)+1]||null}
 getAttribute(n){return this.attrs[n]??null}hasAttribute(n){return n in this.attrs}setAttribute(n,v){this.attrs[n]=v}removeAttribute(n){delete this.attrs[n]}
 matches(selectors){return selectors.split(',').some(s=>s.startsWith('.')?this.classList.includes(s.slice(1)):this.tagName===s.toUpperCase())}
 insertBefore(node,cursor){node.remove();const i=cursor?this.childNodes.indexOf(cursor):this.childNodes.length;this.childNodes.splice(i,0,node);node.parentElement=this}
 append(...nodes){nodes.forEach(n=>this.insertBefore(n,null))}
 remove(){if(this.parentElement){const p=this.parentElement;p.childNodes.splice(p.childNodes.indexOf(this),1);this.parentElement=null}}
}
const context=vm.createContext({document:{activeElement:null}});
vm.runInContext(source.slice(source.indexOf('function presentationNodeKey'),source.indexOf('function presentationMotionAllowed')),context);
const reconcile=(a,b)=>context.reconcilePresentation(a,b);
const root=new Element('div','',{id:'app'}),canvas=new Element('canvas','',{id:'village-canvas'}),seat=new Element('button','village-seat',{'data-seat':'1',style:'left:50%'});
const portrait=new Element('span','portrait-slot',{'data-portrait-role':'女巫'}),image=new Element('img','portrait-image portrait-ready');portrait.append(image);
const details=new Element('details','turn-options');details.open=true;details.attrs.open='';
const input=new Element('textarea','',{id:'note'});input.value='未送出筆記';context.document.activeElement=input;
canvas.attrs.width='780';canvas.attrs.height='660';root.append(canvas,seat,portrait,details,input);
const replacement=new Element('div','',{id:'app'}),newSeat=new Element('button','village-seat chosen',{'data-seat':'1'}),newInput=new Element('textarea','',{id:'note'});
replacement.append(new Element('canvas','',{id:'village-canvas'}),newSeat,new Element('span','portrait-slot',{'data-portrait-role':'女巫'}),new Element('details','turn-options'),newInput);
reconcile(root,replacement);
assert.equal(root.childNodes[0],canvas,'Canvas is retained');assert.equal(canvas.getAttribute('width'),'780','Canvas bitmap width is not cleared');assert.equal(canvas.getAttribute('height'),'660');assert.equal(root.childNodes[1],seat,'seat identity is retained');assert.equal(seat.getAttribute('style'),'left:50%');assert.equal(seat.getAttribute('class'),'village-seat chosen');
assert.equal(root.childNodes[2],portrait);assert.equal(portrait.firstChild,image,'decoded image is retained');assert.equal(details.open,true);assert.equal(details.hasAttribute('open'),true);assert.equal(input.value,'未送出筆記');
// Reordering and deletion must not leave stale role controls.
const reordered=new Element('div','',{id:'app'});reordered.append(new Element('textarea','',{id:'note'}),new Element('button','village-seat',{'data-seat':'1'}));reconcile(root,reordered);assert.deepEqual(root.childNodes,[input,seat]);
// Animation ghosts do not participate in reconciliation; they are inert and independently removed.
const ghost=new Element('canvas','scene-crossfade');root.append(ghost);reconcile(root,reordered);assert.equal(ghost.parentElement,root);
assert.match(source,/ghost\.setAttribute\('inert',''\)/);assert.match(source,/ghost\.setAttribute\('aria-hidden','true'\)/);
assert.match(source,/if\(hidden\)\{cancelAnimationFrame/,'hide path bypasses animated reconciliation');
const village=fs.readFileSync('src/village-render.js','utf8');assert.match(village,/canvas===villageCanvas&&signature===villageSignature\)return/);assert.doesNotMatch(village,/\bs\.players/);
const css=fs.readFileSync('src/mobile.css','utf8');assert.match(css,/\.ritual-intro,\.revelation,\.role-intro,\.game-drawer\{animation:none\}/);assert.match(css,/prefers-reduced-motion:reduce/);
console.log('PASS: persistent canvas/seats/decoded portraits, focused drafts, disclosures, reorder/removal, inert exits, immediate privacy and reduced-motion contracts.');
// Semantic motion: reveal is local; drawer navigation does not re-enter its container.
const calls=[],disclosure={open:true};let reduced=false;
const element=name=>({getAnimations:()=>[],animate:(frames,options)=>calls.push({name,frames,options})});
const motion=vm.createContext({document:{body:{dataset:{}},querySelector:element,querySelectorAll:selector=>selector==='.turn-detail,.turn-options'?[disclosure]:[element(selector)]},window:{matchMedia:()=>({matches:reduced})}});
vm.runInContext(`let sceneStill=false,gDrawer='',introOpen=false,galleryDetail=null;`+source.slice(source.indexOf("let presentationKey="),source.indexOf('function presentationNodeKey'))+source.slice(source.indexOf('function reducedPresentationMotion'),source.indexOf('function updatePresentation'))+source.slice(source.indexOf('function finishPresentation'),source.indexOf('render=function(){')),motion);
const turn='brothers:night:2:1:act:false:-1';motion.finishPresentation(turn,'night');calls.length=0;disclosure.open=true;
motion.finishPresentation(turn.replace('false:-1','true:-1'),'night');assert.equal(disclosure.open,true);assert.equal(calls.length,1);assert.equal(calls[0].name,'.revelation,.dawn-results,.vote-results,.village-heart');assert.equal(calls[0].options.duration,160);
calls.length=0;motion.finishPresentation(turn.replace('false:-1','true:-1'),'night');assert.equal(calls.length,0,'same-turn choices never replay motion');
vm.runInContext('gDrawer="seats"',motion);motion.finishPresentation(turn,'night');assert(calls.some(c=>c.name==='.game-drawer'));
calls.length=0;vm.runInContext('drawerNavigation="forward"',motion);motion.finishPresentation(turn,'night');assert.equal(calls.length,1);assert.equal(calls[0].name,'.drawer-body');assert.equal(calls[0].frames[0].transform,'translateX(6px)');
calls.length=0;vm.runInContext('drawerNavigation="back"',motion);motion.finishPresentation(turn,'night');assert.equal(calls[0].frames[0].transform,'translateX(-6px)');
calls.length=0;vm.runInContext('drawerNavigation="tab"',motion);motion.finishPresentation(turn,'night');assert.equal(calls[0].frames[0].transform,'translateX(0px)');
calls.length=0;reduced=true;vm.runInContext('drawerNavigation="forward"',motion);motion.finishPresentation(turn,'night');assert.equal(calls.length,0);
reduced=false;vm.runInContext('sceneStill=true;drawerNavigation="forward"',motion);motion.finishPresentation(turn,'night');assert.equal(calls.length,1,'static environment retains navigation feedback');
assert(village.includes("villageSignature.split(':')[0]!==signature.split(':')[0]"),'Canvas crossfade is limited to environmental changes');
assert.match(village,/duration:MOTION.scene/);assert.match(source,/function returnToRoster/);assert.match(source,/body.scrollTop=rosterScroll/);
console.log('PASS: semantic stage/result split, no incidental replay, drawer container vs tab/detail motion, paired directions, reduced motion and static navigation.');
