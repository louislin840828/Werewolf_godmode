const fs=require('fs'),vm=require('vm'),assert=require('assert'),nodes={};class MockImage{decode(){return Promise.resolve()}}const c={Image:MockImage,window:{innerWidth:390},console,Date,JSON,Math,setInterval:()=>{},setTimeout:()=>{},clearTimeout:()=>{},cancelAnimationFrame:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:id=>nodes[id]||{innerHTML:''},querySelector:()=>null,body:{dataset:{}}},confirm:()=>true,alert:m=>{throw Error(m)}};vm.createContext(c);const run=x=>vm.runInContext(x,c),obj=x=>JSON.parse(run('JSON.stringify('+x+')'));for(const f of ['app.js','app.view.js','boards.js','mechanical.js','mechanical.view.js','gargoyle.js','gargoyle.view.js','whiteknight.js','whiteknight.view.js','bloodmoon.js','bloodmoon.view.js','dream.js','dream.view.js','cupid.js','cupid.view.js','classic.js','classic.view.js','election.js','election.view.js','rules/role-state.js','role-runtime.js','game-controller.js','victory-forecast.js'])run(fs.readFileSync('src/'+f,'utf8'));run(fs.readFileSync('src/game.js','utf8').replace(/primeRoleImages\(\);render\(\);\s*$/,''));run('render=()=>{hydrateGame()};initVillage=()=>{}');
function reset(board){run(`s=fresh();s.board='${board}';ensureMech();s.players.forEach((p,i)=>p.role=boardDefinition().roles[i]);s.n=2;s.phase='night';gKey='';hydrateGame()`);if(board==='cupid')run("ensureCupid();s.cupid.reserve=['平民','平民'];s.cupid.pick=0;s.cupid.cupidId=2;s.players.forEach((p,i)=>p.role=['平民','丘比特','狼王','狼人','狼人','預言家','女巫','獵人','白痴','平民','平民','平民'][i])")}
for(const [board,count] of [['brothers',3],['mechanical',3],['gargoyle',3],['whiteknight',4],['bloodmoon',4],['dream',4],['cupid',3]]){reset(board);run('s.step=nightSteps().indexOf("wolves");s.draft.kill=10;hydrateGame()');const edges=obj('skillEdges(gameModel())');assert.equal(edges.length,count,board);assert(edges.every(e=>e.target===10));const svg=run('spellTrace(gameModel())');assert.equal((svg.match(/<path /g)||[]).length,count);assert(!svg.includes('NaN'));assert(svg.includes('data-target="10"'));}
reset('cupid');run('s.n=1;s.step=nightSteps().indexOf("cupid");s.draft={loveA:3,loveB:6};hydrateGame()');assert.deepEqual(obj('skillEdges(gameModel()).map(e=>[e.source,e.target])'),[[2,3],[2,6]]);assert.equal((run('spellTrace(gameModel())').match(/<path /g)||[]).length,2);run('s.draft.loveA=2');assert(run('spellTrace(gameModel())').includes(' C'));run('s.draft.loveB=0');assert.equal(obj('skillEdges(gameModel())').length,1);
reset('mechanical');run("s.players.filter(p=>p.role==='狼人').forEach(p=>p.alive=false);s.mech.learned={id:2,role:'狼人',night:1};s.step=0;s.draft={kill:9,extra:10,double:true};hydrateGame()");assert.deepEqual(obj('skillEdges(gameModel()).map(e=>[e.source,e.target])'),[[1,9],[1,10]]);run('s.draft.extra=9');assert.equal(obj('skillEdges(gameModel())').length,2);
// All dawn deaths visually fall together after one reveal click, then settle as a batch.
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){reset(board);run("s.phase='dawn';s.elected=true;s.nightResult={10:['狼隊刀'],11:['女巫毒'],12:['另一死因']};gKey='';hydrateGame()");assert.equal(run('gameModel().confirm'),'天亮 · 公布全部死訊');assert.equal(run('visualAlive(player(10))'),true);run('confirmGame()');assert.equal(run('s.phase'),'dawn');assert.equal(run('g.dawn'),1);for(const id of [10,11,12]){assert.equal(run('visualAlive(player('+id+'))'),false);assert(run('seatHTML(player('+id+'),gameModel())').includes('fallen'))}assert(run('gameModel().line').includes('10 號、11 號、12 號'));const deathCard=run('dawnResultsMarkup(gameModel())');for(const id of [10,11,12])assert(deathCard.includes('<b>'+id+'</b>'));assert(!deathCard.includes('女巫毒'));assert(!run('gameModel().confirm').includes('下一位'));run('confirmGame()');assert.notEqual(run('s.phase'),'dawn');for(const id of [10,11,12])assert.equal(run('player('+id+').alive'),false);}
reset('brothers');run("s.phase='dawn';s.nightResult={};gKey='';hydrateGame();confirmGame()");assert.equal(run('gameModel().title'),'昨夜，平安無事');run('confirmGame()');assert.equal(run('s.phase'),'day');
// Hunter briefing appears and is recorded before dawn on every applicable board.
for(const board of ['brothers','mechanical','gargoyle','dream','cupid']){reset(board);run('s.step=nightSteps().indexOf("hunter");hydrateGame()');assert.equal(run('gameModel().hunterStatus.available'),true);assert.equal(run('gameModel().confirm'),'已告知獵人 · 請閉眼');assert(run('hunterStatusMarkup(gameModel().hunterStatus)').includes('可以開槍'));assert(run('nightUI()').includes('明早技能狀態'));run('confirmGame()');assert.equal(run('s.draft.hunterBriefing.available'),true);assert(run('s.logs.at(-1).text').includes('已告知獵人'));run('undo()');assert.equal(run('s.draft.hunterBriefing'),undefined);const id=run('role("獵人").id');run('s.draft.poison='+id);assert.equal(run('gameModel().hunterStatus.available'),false);assert.equal(run('gameModel().hunterStatus.reason'),'當夜中毒');run('confirmGame()');assert.equal(run('s.draft.hunterBriefing.available'),false);}
reset('dream');run('s.step=5;s.draft={fear:7,kill:7};hydrateGame()');assert.equal(run('gameModel().hunterStatus.reason'),'當夜被恐懼');assert.equal(run('gameModel().hunterStatus.available'),false);run('s.draft={dream:7};s.dream.lastTarget=7');assert.equal(run('gameModel().hunterStatus.available'),false);run('s.draft={dream:7,poison:7};s.dream.lastTarget=0');assert.equal(run('gameModel().hunterStatus.available'),true);
reset('cupid');run('s.step=nightSteps().indexOf("hunter");s.cupid.lovers=[8,10];s.draft={kill:10};hydrateGame()');assert.equal(run('gameModel().hunterStatus.available'),false);assert.equal(run('gameModel().hunterStatus.reason'),'當夜為殉情者');run('s.draft={kill:8}');assert.equal(run('gameModel().hunterStatus.available'),true);
// Dawn with a hunter still stops for his queued skill after the batch announcement.
reset('brothers');run("s.phase='dawn';s.nightResult={7:['狼隊刀'],10:['女巫毒']};gKey='';hydrateGame();confirmGame();confirmGame()");assert.equal(run('gameModel().kind'),'shot');assert.equal(run('s.pending[0].id'),7);
console.log('PASS: multi-source lines on all seven boards, two Cupid targets/self link, mechanical dual knife, simultaneous dawn announcement/fallen seats/batch settlement/peaceful night, no public causes, hunter nightly card/acknowledgment/log/undo on five boards, poison/fear/heartbreak/protected hunter states, and death-skill queue preservation.');
// Verify production markup places the cards in the actual scene and role popup.
const code=fs.readFileSync('src/game.js','utf8'),start=code.indexOf('render=function(){'),end=code.indexOf('\nconst ROLE_ART=',start);run(code.slice(start,end));const prod=run('render');c.document.querySelectorAll=()=>[];nodes.app={innerHTML:''};nodes['begin-role']={focus:()=>{}};reset('brothers');run('s.step=nightSteps().indexOf("hunter");hydrateGame()');prod();assert(nodes.app.innerHTML.includes('明早技能狀態'));assert(nodes.app.innerHTML.includes('已告知獵人'));reset('brothers');run("s.phase='dawn';s.nightResult={10:['狼隊刀'],11:['女巫毒']};gKey='';hydrateGame();g.dawn=1");prod();assert(nodes.app.innerHTML.includes('dawn-results'));assert(nodes.app.innerHTML.includes('<b>10</b>'));assert(nodes.app.innerHTML.includes('<b>11</b>'));assert(!nodes.app.innerHTML.includes('揭曉下一位'));
console.log('PASS: production scene renders the batch death panel and nightly hunter status card. Browser QA not performed.');
// Mobile presentation keeps every selected target visible, including the inactive skill.
reset('cupid');run('s.n=1;s.step=nightSteps().indexOf("cupid");s.draft={loveA:3,loveB:6};hydrateGame()');
for(const id of [3,6]){const html=run(`seatHTML(player(${id}),gameModel())`);assert(html.includes('targeted'));assert(html.includes('seat-selected'));assert(html.includes('aria-pressed="true"'));}
assert(run('seatHTML(player(2),gameModel())').includes('seat-actor'));
assert(!run('seatHTML(player(10),gameModel())').includes('class="seat-selected"'));
prod();assert(nodes.app.innerHTML.includes('dock-body'));assert(nodes.app.innerHTML.includes('dock-footer'));assert(nodes.app.innerHTML.includes('撤回已確認操作'));assert(nodes.app.innerHTML.includes('→ 3 號'));assert(nodes.app.innerHTML.includes('→ 6 號'));
reset('mechanical');run('s.n=1;s.players.forEach(p=>p.role="未確認");s.step=0;gKey="";hydrateGame();g.regs=[2]');
assert(run('selectionSummary(gameModel())').includes('2 號'));
console.log('PASS: all selected targets/actor markers, mobile footer, explicit undo and registration receipts.');
// Gallery browsing stays local until explicit confirmation; all templates still start normally.
c.requestAnimationFrame=()=>{};nodes['board-track']={addEventListener:()=>{}};
for(const id of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid','classic']){
 assert(run(`boardPortraitRoles('${id}').includes('平民')`));
 assert(run(`BOARD_TEMPLATES['${id}'].roles.every(r=>boardPortraitRoles('${id}').includes(r))`));
 run(`s=fresh();s.phase='setup';setupBoardFocus='${id}';gDrawer='';gKey='';hydrateGame()`);
 const before=run('JSON.stringify(s)');run('renderBoardGallery()');assert.equal(run('JSON.stringify(s)'),before);
 assert.equal((nodes.app.innerHTML.match(/class="board-slide"/g)||[]).length,8);
 assert(!nodes.app.innerHTML.includes('onclick="galleryConfirm()"'));run(`galleryDetail='${id}'`);const detail=run('galleryDetailMarkup()');assert(detail.includes('確認使用'));assert(detail.includes('角色配置'));if(id==='cupid')assert(detail.includes('14 張牌，12 人入席'));
 run('galleryConfirm()');assert.equal(run('s.board'),id);assert.equal(run('s.phase'),'night');assert(run('s.players.every(p=>p.role==="未確認")'));
}
console.log('PASS: eight-card gallery, browsing leaves game state intact, explicit confirmation starts each board with unknown identities.');

assert.equal(run('galleryGestureAxis(5,4)'), '');assert.equal(run('galleryGestureAxis(30,8)'), 'x');assert.equal(run('galleryGestureAxis(8,30)'), 'y');assert.equal(run('galleryGestureAxis(15,14)'), '');
// A vertical-first drag cannot turn into a horizontal swipe; a horizontal drag suppresses click.
const handlers={};nodes['board-track']={scrollLeft:0,clientWidth:390,addEventListener:(type,fn)=>handlers[type]=fn,classList:{add:()=>{},remove:()=>{}},setPointerCapture:()=>{},hasPointerCapture:()=>false};
run('setupBoardFocus="brothers";bindGalleryGestures(document.getElementById("board-track"))');
const event=(x,y)=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y,cancelable:true,preventDefault:()=>{}});
handlers.pointerdown(event(0,0));handlers.pointermove(event(5,30));handlers.pointermove(event(70,35));assert.equal(nodes['board-track'].scrollLeft,0);handlers.pointerup(event(70,35));
handlers.pointerdown(event(100,0));handlers.pointermove(event(60,3));assert.equal(nodes['board-track'].scrollLeft,40);assert(run('gallerySuppressClickUntil>Date.now()'));
console.log('PASS: details-only confirmation, direction threshold, vertical direction lock, horizontal drag and click suppression.');

// Phone gestures must remain browser-owned, including the pointercancel sent on scroll takeover.
let cancelled=false,captured=false;nodes['board-track'].scrollLeft=0;nodes['board-track'].setPointerCapture=()=>{captured=true};
const touch=(x,y,type='pointermove')=>({...event(x,y),type,pointerType:'touch',preventDefault:()=>{cancelled=true}});
handlers.pointerdown(touch(100,0,'pointerdown'));handlers.pointermove(touch(40,3));assert.equal(nodes['board-track'].scrollLeft,0);assert.equal(cancelled,false);assert.equal(captured,false);handlers.pointercancel(touch(40,3,'pointercancel'));
assert(run('gallerySuppressClickUntil>Date.now()'));assert(fs.readFileSync('src/game.css','utf8').includes('touch-action:pan-x pinch-zoom'));
console.log('PASS: touch swipe does not prevent default, capture pointers, write scroll position, or snap back on browser takeover; drag click suppression retained.');
// Later-night role presentation is nonblocking; important confirmations still open in full.
run('render=()=>{hydrateGame()}');
let transitionCallback=null,transitionTimers=0;const originalTimeout=c.setTimeout;c.setTimeout=fn=>{transitionTimers++;transitionCallback=fn;return transitionTimers};
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){
 reset(board);run('s.step=nightSteps().indexOf("wolves");introStage="";hydrateGame();gameModel()');
 const before=run('JSON.stringify(s)');run('refreshIntro(gameModel())');assert.equal(run('introOpen'),false,board);assert(run('roleTransitionMarkup()').includes('role-transition'));assert.equal(run('JSON.stringify(s)'),before);
 const timers=transitionTimers;run('refreshIntro(gameModel())');assert.equal(transitionTimers,timers);transitionCallback();assert.equal(run('roleTransition'),null);assert.equal(run('JSON.stringify(s)'),before);
 run('openRoleIntro()');assert.equal(run('introOpen'),true);run('dismissIntro()');assert.equal(run('introOpen'),false);
 run('s.n=1;introStage="";refreshIntro(gameModel())');assert.equal(run('introOpen'),true);
}
reset('mechanical');run('s.step=nightSteps().indexOf("hunter");introStage="";hydrateGame();refreshIntro(gameModel())');assert.equal(run('introOpen'),true);assert.equal(run('roleTransition'),null);
run('s.step=nightSteps().indexOf("review");hydrateGame();refreshIntro(gameModel())');assert.equal(run('introOpen'),true);
c.setTimeout=originalTimeout;
// Vote receipts and edits keep the existing auto-advance, eligibility and tally rules.
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){
 reset(board);run('s.phase="day";s.elected=true;s.voteDone=false;s.votes={};beginDayVote();gKey="";hydrateGame();syncVotePresentation(gameModel())');
 assert.equal(run('gameModel().kind'),'vote',board);assert.equal(run('voteComplete(gameModel())'),false);
 run('refreshIntro(gameModel())');assert.equal(run('introOpen'),false);
 run('sceneSeatChoice(12);syncVotePresentation(gameModel())');assert.equal(run('s.votes[1]'),12);assert.equal(run('g.voter'),2);assert(run('voteReceiptMarkup(gameModel())').includes('1 號 → 12 號'));
 run('selectVoteVoter(1);sceneSeatChoice(11);syncVotePresentation(gameModel())');assert.equal(run('s.votes[1]'),11);assert.equal(run('g.voter'),2);
 run('sceneAbstainVote();syncVotePresentation(gameModel())');assert.equal(run('s.votes[2]'),0);assert.equal(run('g.voter'),3);assert(run('voteReceiptMarkup(gameModel())').includes('2 號 → 棄票'));
 run('while(!voteComplete(gameModel()))sceneSeatChoice(12)');assert.equal(run('voteComplete(gameModel())'),true);assert(run('voteFocusMarkup(gameModel())').includes('全部票已記錄'));
 prod();assert(nodes.app.innerHTML.includes('voting-dock'));assert(nodes.app.innerHTML.includes('vote-focus'));assert(nodes.app.innerHTML.includes('修改這一票'));assert(!nodes.app.innerHTML.includes('onclick="confirmGame()" disabled'));
 run('s.voteRound=2;s.pk=[11,12];s.votes={};gKey="";hydrateGame();syncVotePresentation(gameModel())');assert.equal(run('lastVoteReceipt'),null);assert.equal(run('voteComplete(gameModel())'),false);
 prod();assert(nodes.app.innerHTML.includes('onclick="confirmGame()" disabled'));
 run('render=()=>{hydrateGame()}');
}
console.log('PASS: first-night/full critical popups, nonblocking once-only later-night transitions and manual reopen; seven-board vote record/abstain/edit/auto-advance/completion/round reset and production markup.');
// Role dossiers read the shared snapshot and never mutate a board.
run('render=()=>hydrateGame()');
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){
 reset(board);run('gameModel()');const before=run('JSON.stringify(s)');
 for(let id=1;id<=12;id++){const card=run(`roleDetailMarkup(${id})`);assert(card.includes('身分與資格'));assert(!card.includes('[object Object]'));assert(!card.includes('undefined'));assert(!card.includes('Infinity'));}
 assert.equal(run('JSON.stringify(s)'),before);assert.equal((run('hostRosterMarkup()').match(/onclick="openRoleDetail\(/g)||[]).length,12);
}
run('s=fresh();ensureMech()');const unknown=run('roleDetailMarkup(1)');assert(unknown.includes('等待第一夜'));assert(!unknown.includes('勝利陣營'));assert(!unknown.includes('villager'));
reset('mechanical');run('s.mech.learned={id:6,role:"女巫",night:2};s.mech.poisonUsed=true');const mechanical=run('roleDetailMarkup(1)');assert(mechanical.includes('學習・毒藥'));assert(mechanical.includes('剩餘 0 次'));assert(mechanical.includes('第 3 夜起生效'));
reset('cupid');run('s.cupid.lovers=[8,3];s.cupid.cupidId=2;s.cupid.third=true;kill(8,"殉情")');const dead=run('roleDetailMarkup(8)');assert(dead.includes('第三方'));assert(dead.includes('神邊'));assert(dead.includes('殉情'));assert(dead.includes('戀人'));
reset('dream');run('s.draft.fear=7');assert(run('roleDetailMarkup(7)').includes('恐懼'));
run('s.logs=[{period:"第 1 夜",at:"10:00",text:"夜間測試"},{period:"第 1 天",at:"10:30",text:"白天測試"}];hostLogPeriod="第 1 夜"');const filtered=run('hostLogMarkup()');assert(filtered.includes('夜間測試'));assert(!filtered.includes('白天測試'));assert(filtered.includes('匯出完整紀錄'));
run('hostNoteDraft="<b>保留筆記</b>"');assert(run('hostLogMarkup()').includes('&lt;b&gt;保留筆記&lt;/b&gt;'));
nodes['engine-slot']={append:()=>{}};run('gDrawer="engine";tab="play"');prod();assert(nodes.app.innerHTML.includes('對局管理'));assert(nodes.app.innerHTML.includes('本回合操作與修正'));assert.equal((nodes.app.innerHTML.match(/id="timer"/g)||[]).length,1);
run('gDrawer="seats";detailPlayerId=7');prod();assert(nodes.app.innerHTML.includes('player-profile'));assert(nodes.app.innerHTML.includes('onclick="sceneSeatChoice(7)"'));
console.log('PASS: read-only dossiers on seven boards, unknown identities, learned resources/timing, third-party edge/death/relationship, fear, log filtering/escaping, and production manager/roster/unique live timer.');

// Badge mode is presentation-only until the existing confirmation action runs.
reset('mechanical');run("s.phase='day';s.sheriff=7;player(7).alive=false;s.pending=[];s.badge=true;gKey='';hydrateGame()");
nodes.badge={value:'0'};const badgeBefore=run('JSON.stringify(s)');
assert(run('actionTray(gameModel())').includes('移交警徽'));assert(run('actionTray(gameModel())').includes('撕毀警徽'));
assert(run('selectionSummary(gameModel())').includes('尚未選擇'));
run("chooseBadgeMode('destroy')");assert.equal(run('JSON.stringify(s)'),badgeBefore);assert.equal(run('ritualButton(gameModel())'),'確認撕毀警徽');
assert(run('selectionSummary(gameModel())').includes('撕毀警徽'));
run('sceneSeatChoice(9)');assert.equal(run('g.badgeMode'),'transfer');assert.equal(run('g.badge'),9);assert.equal(run('s.badge'),true);
run('confirmBadgeChoice()');assert.equal(run('s.sheriff'),9);assert.equal(run('s.badge'),false);
run("undo();chooseBadgeMode('destroy');confirmBadgeChoice()");assert.equal(run('s.sheriff'),0);assert.equal(run('s.badge'),false);
run('undo()');assert.equal(run('s.sheriff'),7);assert.equal(run('s.badge'),true);
console.log('PASS: visible badge options, selection-only mode changes, seat reselect, existing transfer/destroy confirmation and undo.');

// Merchant target and gift are independent persisted choices, not three target actions.
reset('brothers');run('s.step=nightSteps().indexOf("merchant");hydrateGame()');
assert.equal(run('gameModel().actions.length'),1);assert.equal(run('s.draft.gift'),undefined);
run('sceneSeatChoice(9)');assert.equal(run('s.draft.trade'),9);assert.equal(run('s.draft.gift'),undefined);
assert(run('merchantChoiceHint(gameModel())').includes('贈送技能'));
const merchantStep=run('s.step');run('confirmGame()');assert.equal(run('s.step'),merchantStep);
for(const gift of ['查驗','毒藥','獵槍']){run(`chooseMerchantGift('${gift}')`);assert.equal(run('s.draft.trade'),9);assert.equal(run('s.draft.gift'),gift);assert.equal(obj('skillEdges(gameModel())').length,1);assert(run('seatHTML(player(9),gameModel())').includes('aria-pressed="true"'));}
run('sceneSeatChoice(10)');assert.equal(run('s.draft.gift'),'獵槍');assert.equal(run('s.draft.trade'),10);
assert.equal(run('s.trade'),null);assert.equal(run('s.history.length'),0);
assert.equal(run('GameEngine.choose("gift","非法技能")'),false);
assert.equal(run('GameEngine.choose("trade",8)'),false);
run('player(11).alive=false');assert.equal(run('GameEngine.choose("trade",11)'),false);
prod();assert(nodes.app.innerHTML.includes('aria-label="贈送技能"'));assert(nodes.app.innerHTML.includes('交易對象'));assert(nodes.app.innerHTML.includes('贈送技能'));assert(!nodes.app.innerHTML.includes("chooseAction('gift"));
run('gKey="";hydrateGame()');assert.equal(run('s.draft.trade'),10);assert.equal(run('s.draft.gift'),'獵槍');
run('clearChoice()');assert.equal(run('s.draft.gift'),'獵槍');assert.equal(run('s.draft.trade'),0);
assert(run('merchantChoiceHint(gameModel())').includes('交易對象'));
run('sceneSeatChoice(9);confirmGame()');assert.equal(run('s.step'),merchantStep+1);run('undo()');assert.equal(run('s.step'),merchantStep);assert.equal(run('s.draft.trade'),9);assert.equal(run('s.draft.gift'),'獵槍');
run('skipTurn()');assert.equal(run('s.draft.trade'),0);assert.equal(run('s.draft.gift'),undefined);
reset('brothers');run('s.step=nightSteps().indexOf("merchant");hydrateGame();chooseAction("gift1")');assert.equal(run('s.draft.gift'),'毒藥');assert.equal(run('s.draft.trade'),undefined);run('sceneSeatChoice(9)');assert.equal(run('s.draft.gift'),'毒藥');
run('s.trade={id:9,gift:"查驗",success:true,night:1};save()');assert.equal(run('GameEngine.choose("gift","獵槍")'),false);
console.log('PASS: independent merchant target/gift in either order, persistent reselect, one trace, validation, incomplete confirmation, skip and undo.');

// A lost transient receipt never implies that the persisted votes disappeared.
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){
 reset(board);run('s.phase="day";s.elected=true;s.voteDone=false;s.votes={};beginDayVote();gKey="";hydrateGame();syncVotePresentation(gameModel())');
 assert(run('voteReceiptMarkup(gameModel())').includes('尚未記錄投票'));
 run('sceneSeatChoice(12);sceneAbstainVote();s=JSON.parse(JSON.stringify(s));gKey="";votePresentationKey="";lastVoteReceipt=null;hydrateGame();syncVotePresentation(gameModel())');
 assert.equal(run('s.votes[1]'),12);assert.equal(run('s.votes[2]'),0);
 assert(run('voteReceiptMarkup(gameModel())').includes('已恢復 2／12 票'));
 assert(!run('voteReceiptMarkup(gameModel())').includes('尚未記錄投票'));
 run('while(!voteComplete(gameModel()))sceneSeatChoice(12);lastVoteReceipt=null');assert(run('voteReceiptMarkup(gameModel())').includes('可以揭曉票數'));
 run('s.voteRound=2;s.pk=[11,12];s.votes={};gKey="";hydrateGame();syncVotePresentation(gameModel())');assert(run('voteReceiptMarkup(gameModel())').includes('尚未記錄投票'));
}
console.log('PASS: restored receipt counts include abstentions on seven boards, complete tally prompt and round reset.');

// Cancelling new game leaves both the game and management UI untouched.
reset('brothers');run('gDrawer="engine";detailPlayerId=7;g.shot=9');
const resetBefore=run('JSON.stringify(s)'),resetUI=run('JSON.stringify(g)');const originalConfirm=c.confirm;c.confirm=()=>false;
run('resetFromManagement()');assert.equal(run('JSON.stringify(s)'),resetBefore);assert.equal(run('JSON.stringify(g)'),resetUI);assert.equal(run('gDrawer'),'engine');assert.equal(run('detailPlayerId'),7);
assert(run('hostManagementMarkup()').includes('onclick="resetFromManagement()"'));
c.confirm=()=>true;run('resetFromManagement()');assert.equal(run('s.phase'),'setup');assert.equal(run('gDrawer'),'');assert.equal(run('detailPlayerId'),0);assert.equal(run('g.shot'),undefined);c.confirm=originalConfirm;
console.log('PASS: cancelled new game preserves state/drawer/selection; confirmed new game clears presentation.');

// Shot mode changes are presentation-only; the production footer confirms existing engine actions.
for(const board of ['brothers','mechanical','gargoyle','dream','cupid']){
 reset(board);run('s.phase="day";s.elected=true;kill(role("獵人").id,"放逐");gKey="";hydrateGame()');nodes.shot={value:'0'};
 assert.equal(run('gameModel().kind'),'shot');const shotBefore=run('JSON.stringify(s)');
 assert(run('actionTray(gameModel())').includes('選擇開槍'));assert(run('actionTray(gameModel())').includes('放棄開槍'));
 run('chooseShotMode("skip")');assert.equal(run('JSON.stringify(s)'),shotBefore);assert.equal(run('ritualButton(gameModel())'),'確認放棄開槍');assert(run('selectionSummary(gameModel())').includes('放棄開槍'));
 run('sceneSeatChoice(9)');assert.equal(run('g.shotMode'),'shoot');assert.equal(run('g.shot'),9);assert.equal(run('JSON.stringify(s)'),shotBefore);
 prod();assert(nodes.app.innerHTML.includes('onclick="confirmShotChoice()"'));
 run('render=()=>hydrateGame();confirmShotChoice()');assert.equal(run('player(9).alive'),false);
 run('undo();chooseShotMode("skip");confirmShotChoice()');assert.equal(run('player(9).alive'),true);assert.equal(run('s.pending.length'),0);
 run('undo()');assert.equal(run('gameModel().kind'),'shot');assert.equal(run('s.pending.length'),1);
}
// During skill resolution the vote panel defers to keep the seat selection visible.
run('render=()=>{hydrateGame()}');reset('brothers');run('s.phase="day";s.elected=true;gKey="";hydrateGame()');
run('alive().forEach((p,i)=>s.votes[p.id]=i<4?7:i<6?12:0);countVotes(false)');
assert.equal(run('player(7).alive'),false);assert.equal(run('gameModel().kind'),'shot');assert.equal(run('voteResultMarkup()'),'');
run('chooseShotMode("shoot");g.shot=9;confirmShotChoice()');assert.equal(run('gameModel().kind'),'daydone');assert(run('voteResultMarkup()').includes('放逐結果'));
assert(run('voteResultMarkup()').includes('本次出局 · 2 人'));assert(run('voteResultMarkup()').includes('7 號'));assert(run('voteResultMarkup()').includes('放逐'));assert(run('voteResultMarkup()').includes('9 號'));assert(run('voteResultMarkup()').includes('槍擊'));
run('undo();undo()');assert.equal(run('s.voteResult'),undefined);
console.log('PASS: vote result defers during skill targeting, then lists exile and gun deaths with causes.');
// A lover's automatic death belongs to the same exile batch, even without a gun.
reset('cupid');run("s.phase='day';s.elected=true;s.cupid.lovers=[8,10];updateCupidFaction();s.votes={};alive().forEach(p=>s.votes[p.id]=10);countVotes(false)");
assert.equal(run('player(10).alive'),false);assert.equal(run('player(8).alive'),false);assert.equal(run('s.pending.length'),0);
const loverResult=run('voteResultMarkup()');assert(loverResult.includes('本次出局 · 2 人'));assert(loverResult.includes('10 號'));assert(loverResult.includes('8 號'));assert(loverResult.includes('殉情'));
// A gun target who is the sheriff must pass the badge before the final panel.
reset('brothers');run('s.phase="day";s.elected=true;s.sheriff=9;alive().forEach(p=>s.votes[p.id]=7);countVotes(false)');
assert.equal(run('gameModel().kind'),'shot');assert.equal(run('voteResultMarkup()'),'');
run('shoot(9)');assert.equal(run('gameModel().kind'),'badge');assert.equal(run('voteResultMarkup()'),'');
nodes.badge={value:'10'};run('badge()');assert.equal(run('gameModel().kind'),'daydone');assert(run('voteResultMarkup()').includes('本次出局 · 2 人'));
console.log('PASS: lover collateral, shot and badge completion all contribute to the final day result.');
// A dreamer exiled by day does not kill the linked sleeper: that rule is night-only.
reset('dream');run("ensureDream();s.phase='day';s.elected=true;s.dream.linkTarget=9;s.dream.linkNight=s.n;alive().forEach(p=>s.votes[p.id]=8);countVotes(false)");
assert.equal(run('player(8).alive'),false);assert.equal(run('player(9).alive'),true);assert(run('voteResultMarkup()').includes('本次出局 · 1 人'));assert(!run('voteResultMarkup()').includes('攝夢牽連'));
console.log('PASS: daytime dreamer exile does not invent night-only collateral.');

// Exile conclusions open a consolidated result window; PK rounds keep the prior tally in view.
reset('brothers');run('s.phase="day";s.elected=true;gKey="";hydrateGame()');
run('alive().forEach((p,i)=>s.votes[p.id]=i<4?9:i<6?12:0);countVotes(false)');
assert.equal(run('s.voteResult.elect'),false);assert.equal(run('s.voteResult.outcome'),'exiled');assert.equal(run('s.voteResult.target'),9);assert.equal(run('s.voteResult.n'),run('s.n'));assert.equal(run('player(9).alive'),false);
assert(run('voteResultMarkup()').includes('放逐結果'));assert(run('voteResultMarkup()').includes('9 號被放逐'));assert(run('voteResultMarkup()').includes('9 號 4 票'));assert(run('voteResultMarkup()').includes('棄 6 票'));
assert.equal(run('gameModel().kind'),'daydone');
prod();assert(nodes.app.innerHTML.includes('vote-results'));assert(nodes.app.innerHTML.includes('9 號被放逐'));assert(nodes.app.innerHTML.includes('result-heart'));
run('undo()');assert.equal(run('s.voteResult'),undefined);assert.equal(run('player(9).alive'),true);assert.equal(run('gameModel().kind'),'vote');
reset('brothers');run('s.phase="day";s.elected=true;gKey="";hydrateGame()');
run('alive().forEach((p,i)=>s.votes[p.id]=i<3?9:i<6?12:0);countVotes(false)');
assert.equal(run('s.voteResult.outcome'),'pk');assert.deepEqual(obj('s.voteResult.pk'),[9,12]);assert.equal(run('s.voteDone'),false);assert.equal(run('voteResultMarkup()'),'');
assert(run('voteTrayMarkup(gameModel())').includes('上一輪投票'));assert(run('voteTrayMarkup(gameModel())').includes('9 號 3 票'));
run('alive().filter(p=>!s.pk.includes(p.id)).forEach((p,i)=>s.votes[p.id]=i<6?9:12);countVotes(false)');
assert.equal(run('s.voteResult.outcome'),'exiled');assert.equal(run('s.voteResult.round'),2);assert.equal(run('s.voteResult.target'),9);assert(run('voteResultMarkup()').includes('第 2 輪'));assert(run('voteResultMarkup()').includes('9 號 6 票'));
prod();assert(nodes.app.innerHTML.includes('第 2 輪'));assert(!nodes.app.innerHTML.includes('上一輪投票'));
run('mutate(newNight)');assert.equal(run('s.phase'),'night');assert.equal(run('voteResultMarkup()'),'');assert.equal(run('votePriorRoundMarkup()'),'');
console.log('PASS: exile result panel, prior-round tally, day freshness across nights and undo.');
