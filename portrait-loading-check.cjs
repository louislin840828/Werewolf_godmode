const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('src/game.js','utf8');
const requests=[];
class ImageMock {set src(value){this.url=value;if(!requests.includes(this))requests.push(this)}getAttribute(name){return name==='src'?this.url:null}decode(){this.decodeCalls=(this.decodeCalls||0)+1;if(this.decoded)return Promise.resolve();return new Promise((resolve,reject)=>{this.resolve=()=>{this.decoded=true;resolve()};this.reject=reject})}}
let confirmed=0;
const ctx={Image:ImageMock,console,viewState:()=>({phase:'setup',board:'demo'}),BOARD_TEMPLATES:{demo:{roles:['狼','神','民']}},galleryDetail:'demo',setupBoardFocus:'demo',galleryConfirm:()=>confirmed++};vm.createContext(ctx);
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
 // A decode/network failure returns a retryable result instead of starting play.
 run("portraitPreload.clear()");const retryButton={disabled:false,setAttribute(){}};ctx.button=retryButton;
 const failed=run('prepareGalleryGame(button)');const pending=requests.slice(-3);pending[0].onerror();pending[0].reject();pending.slice(1).forEach(r=>r.resolve());await flush();for(let i=0;i<16;i++){requests.forEach(r=>r.resolve?.());await flush()}await failed;
 assert.equal(confirmed,2);assert.equal(retryButton.disabled,false);assert(retryButton.textContent.includes('重試'));
 const retry=run('prepareGalleryGame(button)');for(let i=0;i<16;i++){requests.forEach(r=>r.resolve?.());await flush()}await retry;assert.equal(confirmed,3);
 run('portraitPreload.clear()');ctx.button={disabled:false,setAttribute(){}};const cancelled=run('prepareGalleryGame(button)');run('portraitPreparation++;galleryDetail=null');for(let i=0;i<16;i++){requests.forEach(r=>r.resolve());await flush()}await cancelled;assert.equal(confirmed,3);
 assert(requests.some(r=>r.url==='平民.webp'));assert(run("portraitNodes.get('平民:0').decoded && portraitNodes.get('平民:1').decoded"));
 finished=true;console.log('PASS: three-request limit, queue priority, deduplication, decode gate/progress, failed-image retry and cancellation.');
})().catch(e=>{console.error(e);process.exitCode=1});
