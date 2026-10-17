const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
async function main(){
 let phase='night',reduced=false,nextId=0;const timers=new Map(),resolvers={},paints=[],animations=[],ghosts=[];
 const canvas={isConnected:true,width:390,height:400,getContext:()=>({setTransform(){}})};
 const world={closest:()=>true,getBoundingClientRect:()=>({width:390,height:400}),querySelectorAll:()=>ghosts.filter(g=>!g.removed),append:g=>ghosts.push(g)};canvas.parentElement=world;
 const context=vm.createContext({sceneStill:false,sceneFrame:0,sceneResize:null,MOTION:{scene:400},cityArtwork:new Map(),cityArtKey:p=>p,scenePhase:()=>phase,
  window:{matchMedia:()=>({matches:reduced})},presentationMotionAllowed:()=>!reduced,
  document:{getElementById:()=>canvas,querySelectorAll:()=>[],createElement:()=>({getContext:()=>({drawImage(){}}),setAttribute(){},remove(){this.removed=true},getAnimations:()=>[],animate(frames,options){animations.push({frames,options});return {}}})},
  viewState:()=>({players:[]}),visualAlive:()=>true,ResizeObserver:class{observe(){}disconnect(){}},performance:{now:()=>0},cancelAnimationFrame(){},
  setTimeout:fn=>{timers.set(++nextId,fn);return nextId},clearTimeout:id=>timers.delete(id),drawGraphicCity:(_c,_w,_h,p)=>paints.push(p),
  prepareGraphicCity:p=>new Promise(resolve=>resolvers[p]=resolve)});
 vm.runInContext(fs.readFileSync('src/village-render.js','utf8'),context);
 const init=()=>vm.runInContext('initVillage()',context);
 init();phase='day';init();assert.equal(ghosts.length,1);assert.equal(animations.length,0,'fallback does not immediately replace old city');
 resolvers.day({});await Promise.resolve();assert.equal(animations.length,1);assert.equal(animations[0].options.duration,400);assert.equal(timers.size,0);
 phase='night';init();assert.equal(ghosts[0].removed,true);assert.equal(timers.size,1);[...timers.values()][0]();assert.equal(animations.length,2,'bounded hold fades even on slow art');
 const before=paints.length;phase='day';init();resolvers.night({});await Promise.resolve();assert.equal(paints.length,before+1,'late art does not repaint new scene');
 reduced=true;phase='night';init();assert(ghosts.every(g=>g.removed),'reduced motion removes pending scene layers');
 const css=fs.readFileSync('src/graphic-play.css','utf8');assert(css.includes('@keyframes ink-role-pass'));assert(css.includes('13%,87%'));assert(css.includes('body[data-scene-motion=still] .graphic-play .role-transition{animation:none}'));
 console.log('PASS: art-ready scene handoff, bounded fallback hold, stale callback/crossfade cleanup, reduced motion and compact role hint fade. Node/VM only.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
