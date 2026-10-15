const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('src/game.js','utf8');
const requests=[];
class ImageMock {set src(value){this.url=value;if(!requests.includes(this))requests.push(this)}getAttribute(name){return name==='src'?this.url:null}decode(){this.decodeCalls=(this.decodeCalls||0)+1;if(this.decoded)return Promise.resolve();return new Promise((resolve,reject)=>{this.resolve=()=>{this.decoded=true;resolve()};this.reject=reject})}}
let confirmed=0;
const timers=new Map();let timerId=0;
const ctx={Image:ImageMock,console,setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id),esc:s=>s,viewState:()=>({phase:'setup',board:'demo'}),BOARD_TEMPLATES:{demo:{roles:['狼','神','民']}},galleryDetail:'demo',setupBoardFocus:'demo',galleryConfirm:()=>confirmed++};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('const portraitNodes='),source.indexOf('function portraitsFor(')).replace(/function roleImageSource\(role\)\{[^\n]+/,"function roleImageSource(role){return role+'.webp'}"),ctx);
const run=s=>vm.runInContext(s,ctx),flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
let finished=false;process.on('beforeExit',()=>{if(!finished){console.error('Unresolved preparation');process.exitCode=1}});
(async()=>{
 run("warmPortrait('a',1);warmPortrait('b',1);warmPortrait('c',1);warmPortrait('later',0);warmPortrait('urgent',3)");
 assert.equal(requests.length,3);assert.strictEqual(run("warmPortrait('a')"),run("warmPortrait('a')"));
 requests[0].resolve();await flush();assert.equal(requests[3].url,'urgent.webp');
 for(const r of requests)r.resolve();await flush();for(const r of requests)r.resolve();await flush();
 const button={disabled:false,setAttribute(){}};ctx.button=button;
 const preparation=run('prepareGalleryGame(button)');assert(button.disabled);assert.equal(confirmed,0);
 for(let i=0;i<16;i++){for(const r of requests)r.resolve();await flush()}await preparation;assert.equal(confirmed,1);assert(button.textContent.includes('4／4'));
 // The second game reuses prepared nodes and does not decode/download again.
 const preparedCount=requests.length,decodeCount=requests.reduce((n,r)=>n+(r.decodeCalls||0),0);
 ctx.button={disabled:false,setAttribute(){}};await run('prepareGalleryGame(button)');assert.equal(confirmed,2);
 assert.equal(requests.length,preparedCount);assert.equal(requests.reduce((n,r)=>n+(r.decodeCalls||0),0),decodeCount);
 // A decode/network failure uses the silhouette and still allows starting play.
 run("portraitPreload.clear()");const retryButton={disabled:false,setAttribute(){}};ctx.button=retryButton;
 const failed=run('prepareGalleryGame(button)');const pending=requests.slice(-3);pending[0].onerror();pending[0].reject();pending.slice(1).forEach(r=>r.resolve());await flush();for(let i=0;i<16;i++){requests.forEach(r=>r.resolve?.());await flush()}await failed;
 assert.equal(confirmed,3);assert(!run("portraitPreload.has('狼.webp')"));
 ctx.button={disabled:false,setAttribute(){}};
 const retry=run('prepareGalleryGame(button)');for(let i=0;i<16;i++){requests.forEach(r=>r.resolve?.());await flush()}await retry;assert.equal(confirmed,4);
 run('portraitPreload.clear()');ctx.button={disabled:false,setAttribute(){}};const cancelled=run('prepareGalleryGame(button)');run('portraitPreparation++;galleryDetail=null');for(let i=0;i<16;i++){requests.forEach(r=>r.resolve());await flush()}await cancelled;assert.equal(confirmed,4);
 assert(requests.some(r=>r.url==='平民.webp'));assert(run("portraitNodes.get('平民:0').decoded && portraitNodes.get('平民:1').decoded"));
 // Keep the silhouette wrapper mounted, including custom layout classes.
 const markup=run("portrait('loading','custom')");assert(markup.includes('portrait-slot role-portrait custom'));
 const slots=[{dataset:{portraitRole:'loading'},append(img){this.image=img}}];
 ctx.document={querySelectorAll:()=>slots};run('primeRoleImages=()=>{};mountPortraits()');
 const slot=slots[0];assert(slot.image);assert.equal(slot.image.className,'portrait-image');
 const preload=run("portraitPreload.get('loading.webp').image");preload.resolve();await flush();
 assert.equal(slot.image.className,'portrait-image'); // still hidden until its own decode completes
 slot.image.resolve();await flush();assert.equal(slot.image.className,'portrait-image portrait-ready');
 slot.image.onerror();assert.equal(slot.image.className,'portrait-image');assert(!slot.image.portraitReady);
 // A later mount retries a failed display image rather than treating matching src as success.
 run('mountPortraits()');run("portraitPreload.get('loading.webp').image").resolve();await flush();
 slot.image.resolve();await flush();assert(slot.image.portraitReady);
 const cachedDecodes=slot.image.decodeCalls;run('mountPortraits()');await flush();assert.equal(slot.image.decodeCalls,cachedDecodes);
 // Display decode failures leave the silhouette in place and remain retryable.
 const display=run("preparePortraitNode('broken',0)");const broken=run("portraitNodes.get('broken:0')");
 broken.reject();await flush();assert.equal(await display,false);assert.equal(broken.className,'portrait-image');
 // The total opening wait is bounded even when network/decode promises never settle.
 ctx.galleryDetail='demo';ctx.button={disabled:false,setAttribute(){}};run('portraitPreload.clear();preparedPortraits.clear()');
 const stalled=run('prepareGalleryGame(button)');
 for(const [id,fn] of [...timers]){timers.delete(id);fn()}await flush();await stalled;assert.equal(confirmed,5);
 // Late completion after the deadline must not update the detached opening button or start twice.
 const text=ctx.button.textContent;for(let i=0;i<16;i++){requests.forEach(r=>r.resolve?.());await flush()}
 assert.equal(confirmed,5);assert.equal(ctx.button.textContent,text);
 // Closing/changing boards during a stalled wait still cancels the opening intent.
 ctx.button={disabled:false,setAttribute(){}};run('portraitPreload.clear();preparedPortraits.clear()');
 const stalledCancel=run('prepareGalleryGame(button)');run('portraitPreparation++;galleryDetail=null');
 for(const [id,fn] of [...timers]){timers.delete(id);fn()}await flush();await stalledCancel;assert.equal(confirmed,5);
 assert(fs.readFileSync('src/game.css','utf8').includes('data:image/svg+xml'));assert.equal(run('PORTRAIT_WAIT_MS'),8000);
 finished=true;console.log('PASS: priority/deduplication, cached decode reuse, silhouette lifecycle, display failure/retry, failed-image opening, bounded wait and cancellation.');
})().catch(e=>{console.error(e);process.exitCode=1});
