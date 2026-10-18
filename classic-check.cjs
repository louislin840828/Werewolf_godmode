const assert=require('node:assert/strict');
const {createGameTest}=require('./test-support.cjs');
const t=createGameTest(),{run,obj,alerts}=t;
function reset(phase='day'){run(`s=fresh();s.board='classic';s.players.forEach((p,i)=>p.role=boardDefinition().roles[i]);s.phase='${phase}';s.n=2;s.elected=true;gKey='';ensureRoleSystem();hydrateGame()`);}
function register(ids){run(`GameEngine.register(${JSON.stringify(ids)})`);}
run("s=fresh();changeBoard('classic');start();hydrateGame()");
assert.deepEqual(obj('nightSteps()'),['wolves','witch','seer','hunter','idiot','review']);
assert(run("s.players.every(p=>p.role==='未確認')"));
register([1,1,2,3]);assert(run("s.players.every(p=>p.role==='未確認')"));alerts.length=0;
register([1,2,3,4]);assert.deepEqual(obj('actorIds()'),[1,2,3,4]);
run('setChoice(9);confirmGame()');register([6]);run("chooseAction('save');setChoice(9);confirmGame()");
register([5]);run('setChoice(1);confirmGame()');assert.equal(run('g.reveal'),true);run('confirmGame()');
register([7]);run('confirmGame()');assert.equal(run("player(9).role"),'未確認');register([8]);
assert.equal(run("s.players.filter(p=>p.role==='平民').length"),4);run('confirmGame();confirmGame()');
assert.equal(run('s.phase'),'election');assert.equal(run('s.heal'),false);assert.deepEqual(obj('s.nightResult'),{});assert.equal(alerts.length,0);
run('noSheriff();settle()');assert.equal(run('s.phase'),'day');
assert(run('setupUI()').includes('仍存活'));assert(!run('setupUI()').includes('復仇刀'));
// Flip is not a death, does not trigger badge transfer or victory, and revokes voting.
reset();run('s.sheriff=8;s.votes=Object.fromEntries(alive().map(p=>[p.id,8]));countVotes(false)');
assert.equal(run('player(8).alive'),true);assert.equal(run('player(8).idiotRevealed'),true);
assert.equal(run('s.badge'),false);assert.equal(run('s.voteDone'),true);assert.equal(run('roleStatus(8).canVote'),false);
assert.equal(run('roleStatus(8).canSpeak'),true);assert.equal(run('roleStatus(8).edge'),'god');assert.equal(run('roleStatus(8).death'),null);
assert.equal(run("roleStatus(8).skills.find(x=>x.id==='reveal').remaining"),0);
assert(run('voteResultMarkup()').includes('白痴翻牌 · 仍存活'));
assert(run("s.roleSystem.events.some(e=>e.type==='roleStateChanged'&&e.changes.idiotRevealed.includes(8))"));
run('save()');t.context.persisted=t.saved();run('s=JSON.parse(persisted);ensureRoleSystem();undo()');assert.equal(run('player(8).idiotRevealed'),undefined);assert.equal(run('roleStatus(8).canVote'),true);
run("mutate(()=>kill(8,'放逐'));newNight();s.phase='day';s.voteDone=false;beginDayVote()");assert(!obj('dayModel().voters').some(p=>p.id===8));
run('recordVote(8,1)');assert.equal(run('s.votes[8]'),undefined);
run("s.phase='election';s.elected=false;s.candidates=[1,2];s.election={stage:'vote',registered:[1,2],withdrawn:[]}");assert(!obj('sheriffVoters()').some(p=>p.id===8));
for(const cause of ['狼隊刀','女巫毒','槍擊']){reset();run(`mutate(()=>kill(8,'放逐'));mutate(()=>kill(8,'${cause}'))`);assert.equal(run('player(8).alive'),false);assert.equal(run('roleStatus(8).canSpeak'),false);assert(run('roleStatus(8).death.factors.length>0'));}
reset();run("[5,6,7].forEach(id=>kill(id,'女巫毒'));kill(8,'放逐');checkWin()");assert.equal(run('s.winner'),'');run("kill(8,'狼隊刀');checkWin()");assert.equal(run('s.winner'),'狼人陣營獲勝');
for(const cause of ['狼隊刀','放逐','女巫毒']){reset();run(`kill(7,'${cause}')`);assert.equal(run('s.pending.length'),cause==='女巫毒'?0:1);}
// Standard reveal is a production countermeasure; forecast must not change the live state.
reset();run("s.players.forEach(p=>p.alive=[1,7,8,9].includes(p.id));s.heal=false;s.poison=false");const before=obj('s');
const f=obj('calculateVictoryForecast(s,{maxNodes:100000,maxMs:5000})');assert.equal(f.status,'unproven');assert.deepEqual(obj('s'),before);
run("player(8).idiotRevealed=true");const flipped=obj('calculateVictoryForecast(s,{maxNodes:100000,maxMs:5000})');assert.notEqual(flipped.status,'unknown');
reset('dawn');run("s.players.forEach(p=>p.alive=[1,8,9].includes(p.id));s.nightResult={1:['女巫毒'],9:['狼隊刀']};settle()");assert.equal(run('s.winner'),'狼人陣營獲勝');
// Existing Cupid exile house rule still counts its idiot as dead.
run("s=fresh();s.board='cupid';s.players.forEach((p,i)=>p.role=['丘比特','狼人','狼人','狼王','預言家','女巫','獵人','白痴','平民','平民','平民','平民'][i]);s.phase='day';ensureRoleSystem();kill(8,'放逐')");assert.equal(run('player(8).alive'),false);assert(run('s.cupid.speakers.includes(8)'));
console.log('PASS: classic 12-seat recognition/night/resources, standard idiot reveal/life/votes/edge, result UI, journal/reload/undo, lethal causes/hunter guns, night victory priority, forecast countermeasure/isolation, unchanged Cupid house rule.');
