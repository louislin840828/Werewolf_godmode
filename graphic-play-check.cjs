const assert=require('node:assert/strict'),fs=require('node:fs'),{createGameTest}=require('./test-support.cjs');
const {run,obj}=createGameTest();
run("s=fresh();s.board='classic';s.players.forEach((p,i)=>p.role=BOARD_TEMPLATES.classic.roles[i]);s.n=2;s.phase='night';s.elected=true;gKey='';hydrateGame();s.step=0");
assert.equal(run('graphicPlayMode(gameModel())'),true);
const pos=obj('s.players.map((p,i)=>seatPosition(i,390,330))');
run('setChoice(9)');assert.equal(run('player(9).alive'),true);assert.equal(run('s.history.length'),0);
assert.equal(obj('skillEdges(gameModel())').length,4);assert(run('seatHTML(player(9),gameModel())').includes('fate-marker'));assert(run('seatHTML(player(9),gameModel())').includes('seat-selected'));
run('clearChoice()');assert.equal(run('s.draft.kill'),0);
run("s.phase='day';s.players[8].alive=false;gKey='';hydrateGame()");assert(run('seatHTML(player(9),gameModel())').includes('seat-out'));assert.deepEqual(obj('s.players.map((p,i)=>seatPosition(i,390,330))'),pos);
run('s.players[8].alive=true;beginDayVote();recordVote(1,9)');assert.equal(run('s.votes[1]'),9);assert(run('seatHTML(player(9),gameModel())').includes('✓'));
run('g.voter=2;abstainVote()');assert.equal(run('s.votes[2]'),0);run('recordVote(1,10)');assert.equal(run('s.votes[1]'),10);assert.equal(run('player(10).alive'),true);
for(const phase of ['election','dawn','end']){run(`s.phase='${phase}'`);assert.equal(run("graphicPlayMode({kind:'review'})"),true);}
run("s.phase='night'");assert(run("introMarkup({kind:'review',title:'夜間結算',eyebrow:'NIGHT',line:'確認',actions:[],symbol:'moon'})").includes('role-intro graphic-play'));
run("s.phase='setup'");assert.equal(run('graphicPlayMode(gameModel())'),false);
// Painter executes without authoritative game data. Exercise both day/night and prove it is deterministic.
const calls=[];const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>{calls.push([k,v]);o[k]=v;return true;}});
const vm=require('node:vm'),c=vm.createContext({});vm.runInContext(fs.readFileSync('src/city-render.js','utf8'),c);c.ctx=ctx;
vm.runInContext("drawGraphicCity(ctx,390,330,'night')",c);const first=JSON.stringify(calls);calls.length=0;vm.runInContext("drawGraphicCity(ctx,390,330,'night')",c);assert.equal(JSON.stringify(calls),first);calls.length=0;vm.runInContext("drawGraphicCity(ctx,390,330,'day')",c);assert(calls.length>0);assert.notEqual(JSON.stringify(calls),first);
const css=fs.readFileSync('src/graphic-play.css','utf8');assert(!/:root|body\s*\{|html\s*\{/.test(css));assert(css.includes('.graphic-play[data-interaction=vote]'));assert(css.includes('--gn-power:#e5b861'));assert(css.includes('--gn-vote:#b5c9d3'));assert(css.includes('prefers-reduced-motion'));assert(css.includes('path.venom{stroke:var(--gn-power)'));assert(css.includes('height:48px;min-height:48px;max-height:48px'));
for(const selector of ['.reserve-slots select','.thief-card','.withdrawal-card','.vote-prior','.victory-forecast','.role-transition','.forecast-actions .primary','.graphic-play.role-intro'])assert(css.includes(selector),selector);
const village=fs.readFileSync('src/village-render.js','utf8');assert(village.includes("!!world.closest?.('.graphic-play')].join(':')"));
assert(css.includes('.seat-role{flex-shrink:0;'));
assert(css.includes('max-width:68px;height:16px;font-size:11px;line-height:16px'));
assert(css.includes('.voter{min-height:48px;height:48px;'));
assert(css.includes('.abstain-btn{white-space:nowrap;'));
assert(css.includes('.graphic-play>.dock-footer .ritual-commit{background:transparent}'));
const painter=fs.readFileSync('src/city-render.js','utf8');assert(!/\b(s\.|GameEngine|localStorage|player\(|Math.random)/.test(painter));
console.log('PASS: phase-scoped graphic theme, fixed markers/death label, multi-source selection/cancel and vote/abstain/edit preserve engine behavior, isolated day/night fallback painter, neutral vote/power tokens/stable receipt/reduced-motion contracts. Browser/RWD QA not performed.');
