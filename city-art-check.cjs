const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createGameTest}=require('./test-support.cjs');
async function main(){
 const created=[];
 class ImageMock{
  constructor(){this.naturalWidth=1086;this.naturalHeight=1448;this.decodes=0;created.push(this)}
  async decode(){this.decodes++;if(this.failDecode)throw Error('decode failed')}
 }
 const context=vm.createContext({Image:ImageMock});vm.runInContext(fs.readFileSync('src/city-render.js','utf8'),context);
 const run=s=>vm.runInContext(s,context);
 const pending=run("prepareGraphicCity('night')");assert.equal(created.length,1);
 assert.equal(run("prepareGraphicCity('eclipse')"),pending,'same art shares in-flight promise');
 created[0].onload();assert.equal(await pending,created[0]);assert.equal(created[0].decodes,1);
 assert.equal(await run("prepareGraphicCity('night')"),created[0]);assert.equal(created.length,1,'redraw/new game does not load again');
 const calls=[],gradient={addColorStop(){}};
 context.ctx=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{o[k]=v;return true}});
 for(const [w,h] of [[320,340],[390,371],[430,410],[800,300],[1280,550]]){
  calls.length=0;run(`drawGraphicCity(ctx,${w},${h},'night')`);
  const [,im,x,y,dw,dh]=calls.find(c=>c[0]==='drawImage');
  assert.equal(im,created[0]);assert(Math.abs(dw/dh-1086/1448)<1e-10,'cover preserves aspect ratio');
  assert(x<=0&&y<=0&&x+dw>=w&&y+dh>=h,'no uncovered edges');
 }
 const failed=run("prepareGraphicCity('day')");created[1].onerror();assert.equal(await failed,null);
 const retry=run("prepareGraphicCity('day')");assert.equal(created.length,3,'failed art can retry on next scene');created[2].failDecode=true;created[2].onload();assert.equal(await retry,null);
 const day=run("prepareGraphicCity('dawn')");assert.equal(created.length,4);created[3].onload();assert.equal(await day,created[3]);
 assert.equal(await run("prepareGraphicCity('day')"),created[3]);
 assert.equal(run('cityArtwork.size'),2,'only shared day/night art retained');
 // Verify built resources are served in full and with correct MIME; no listener.
 const {handler}=require('./scripts/dev-server.cjs');
 for(const file of ['scenes/city-night-v1.webp','scenes/city-day-v1.webp','ui/ink-surface-v1.webp','ui/power-frame-v1.svg','ui/medium-edge-v1.svg']){
  const source=fs.readFileSync('src/assets/'+file),built=fs.readFileSync('dist/assets/'+file);assert(source.equals(built),file+' must be copied byte-for-byte');
  const response={headers:{},setHeader(k,v){this.headers[k]=v},writeHead(s){this.status=s},end(b){this.body=b}};
  handler({url:'/assets/'+file,method:'GET'},response);assert.equal(response.status,200);assert(response.body.equals(source));
  assert.equal(response.headers['Content-Type'],file.endsWith('.svg')?'image/svg+xml':'image/webp');
 }
 // Number and role label share a stable button. Use the same geometry as lines.
 const game=createGameTest();
 for(const count of [10,12])for(const [w,h] of [[320,360],[390,371],[430,410]]){
  const positions=game.obj(`Array.from({length:${count}},(_,i)=>seatPosition(i,${w},${h},${count}))`);
  for(let i=0;i<count;i++){
   const x=positions[i].x*w/100,y=positions[i].y*h/100;
   assert(x-22>=0&&x+22<=w&&y-30>=0&&y+46<=h,'marker and death label stay inside scene');
   for(let j=i+1;j<count;j++){
    const dx=Math.abs(positions[i].x-positions[j].x)*w/100,dy=Math.abs(positions[i].y-positions[j].y)*h/100;
    assert(dx>=44||dy>=60,'mobile marker buttons must not overlap');
   }
  }
 }
 // Exercise the real async scene callback: late night art must not repaint day.
 const paints=[],resolvers={},promises={};let phase='night';
 const canvas={isConnected:true,width:390,height:371,getContext:()=>({setTransform(){}})};
 const world={closest:()=>true,getBoundingClientRect:()=>({width:390,height:371})};canvas.parentElement=world;
 const scene=vm.createContext({
  clearTimeout(){},setTimeout(){},cityArtwork:new Map(),cityArtKey:p=>p,
  sceneStill:true,sceneFrame:0,sceneResize:null,window:{devicePixelRatio:1,matchMedia:()=>({matches:false})},
  document:{getElementById:()=>canvas,querySelectorAll:()=>[]},viewState:()=>({players:[]}),visualAlive:()=>true,
  scenePhase:()=>phase,cancelAnimationFrame(){},performance:{now:()=>0},ResizeObserver:class{observe(){}disconnect(){}},
  drawGraphicCity:(_ctx,_w,_h,p)=>paints.push(p),
  prepareGraphicCity:p=>promises[p]||(promises[p]=new Promise(resolve=>{resolvers[p]=resolve})),
 });
 vm.runInContext(fs.readFileSync('src/village-render.js','utf8'),scene);
 vm.runInContext('initVillage()',scene);phase='day';vm.runInContext('initVillage()',scene);
 const beforeLate=paints.length;resolvers.night({});await Promise.resolve();assert.equal(paints.length,beforeLate,'stale night callback cannot repaint day');
 resolvers.day({});await Promise.resolve();assert.equal(paints.length,beforeLate+1);assert.equal(paints.at(-1),'day');
 const village=fs.readFileSync('src/village-render.js','utf8');
 assert(village.includes('villageCanvas===canvas&&villageSignature===signature&&canvas.isConnected!==false'));
 console.log('PASS: shared art load/decode cache, failure/retry, proportional cover, intact built/served assets, stale-callback guard and non-overlapping 10/12-seat mobile geometry. Node/VM only; browser visual QA remains pending.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
