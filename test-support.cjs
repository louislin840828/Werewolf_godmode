// Node/VM test support, not a browser or a layout emulator.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
function sourceModules(){
 const build=fs.readFileSync(path.join(root,'build.cjs'),'utf8');
 const match=build.match(/const sources=(\[[^;]+\]);/);
 assert(match,'Build source order must be discoverable');
 return JSON.parse(match[1].replace(/'/g,'"'));
}
function loadGame(context){
 const run=code=>vm.runInContext(code,context);
 for(const file of sourceModules()){
  let code=fs.readFileSync(path.join(root,'src',file),'utf8');
  if(file==='game.js'){
   assert(/primeRoleImages\(\);render\(\);\s*$/.test(code),'Expected production boot marker');
   code=code.replace(/primeRoleImages\(\);render\(\);\s*$/,'');
  }
  run(code);
 }
 run('render=()=>hydrateGame();initVillage=()=>{}');
 return run;
}
function installRenderDOM(context,nodes){
 context.requestAnimationFrame=()=>1;
 context.document.querySelectorAll=()=>[];
 nodes['board-track']={addEventListener(){}};
 nodes.app??={innerHTML:''};
 nodes['begin-role']={focus(){}};
}
function createGameTest(){
 const nodes={},alerts=[];let saved=null;
 class ImageMock {decode(){return Promise.resolve()}}
 const context={Image:ImageMock,console,Date,JSON,Math,window:{innerWidth:390},
  setInterval:()=>{},setTimeout:()=>{},clearTimeout:()=>{},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{},
  localStorage:{getItem:()=>null,setItem:(key,value)=>saved=value},
  document:{getElementById:id=>nodes[id]||{innerHTML:''},querySelector:()=>null,querySelectorAll:()=>[],body:{dataset:{}}},
  confirm:()=>true,prompt:()=>'',alert:message=>alerts.push(message)};
 vm.createContext(context);const run=loadGame(context);installRenderDOM(context,nodes);
 return {context,nodes,alerts,run,obj:code=>JSON.parse(run('JSON.stringify('+code+')')),saved:()=>saved};
}
module.exports={sourceModules,loadGame,installRenderDOM,createGameTest};
