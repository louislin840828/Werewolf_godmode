const assert=require('node:assert/strict');const {createGameTest}=require('./test-support.cjs');const {run,obj,saved}=createGameTest();
function reset(board='brothers',ids=[3,4,5,9],done=true){run(`s=fresh();s.board=${JSON.stringify(board)};s.players.forEach((p,i)=>{p.role=boardDefinition().roles[i];p.alive=${JSON.stringify(ids)}.includes(p.id)});s.n=3;s.phase='day';s.elected=true;s.voteDone=${done};s.heal=false;s.poison=false;ensureRoleSystem();s.trade={id:10,gift:'查驗',success:true,used:true,night:1};`);}
const predict=()=>obj('calculateVictoryForecast(s,{maxNodes:100000,maxMs:5000})');
reset();assert.equal(predict().status,'proven');
reset('brothers',[3,4,5,9],false);assert.equal(predict().status,'proven');
// Good sheriff is recalculated; losing one wolf still leaves an unavoidable edge.
run('s.sheriff=5');assert.equal(predict().status,'proven');
reset('brothers',[3,5,9],false);run('s.sheriff=5');assert.equal(predict().status,'unproven');
// Guards must be guessed before the knife: a possible correct guard is sufficient.
reset('whiteknight',[2,3,7,9]);assert.equal(predict().status,'unproven');
reset('whiteknight',[2,3,7,9]);run('s.guardLast=9');assert.equal(predict().status,'proven');
// Witch's remaining heal can save the last villager, but cannot self-save by default.
reset('brothers',[3,4,6,9]);run('s.heal=true');assert.equal(predict().status,'proven');
run("s.rules.self='yes'");assert.equal(predict().status,'unproven');
// Knight can kill the last wolf before any vote/night; do not predict a win.
reset('whiteknight',[2,8,9],false);assert.equal(predict().status,'unproven');
// Nightmare may block the healer; dream protection and repeat death use real rules.
reset('dream',[2,3,5,8,9,10]);assert.equal(predict().status,'unproven');
reset('dream',[1,2,8,9]);assert.equal(predict().status,'proven');
// Independent wolf gets the next night's knife, but hidden allies aren't coordinated.
reset('gargoyle',[1,5,9]);assert.equal(predict().status,'proven');
reset('gargoyle',[1,2,5,9],false);assert.equal(predict().status,'unknown');
// An existing gun / unresolved badge / unknown identity blocks the prompt.
reset();run('s.pending=[{id:7,guns:1}]');assert.equal(predict().status,'unknown');
reset();run('s.badge=true');assert.equal(predict().status,'unknown');
reset();run("player(9).role='未確認'");assert.equal(predict().status,'unknown');
// Search has absolutely no effect on draft, resources, journal, selection, history or storage.
reset();run('save()');const before=obj('s'),beforeSaved=saved(),beforeUI=obj('g');predict();assert.deepEqual(obj('s'),before);assert.equal(saved(),beforeSaved);assert.deepEqual(obj('g'),beforeUI);
assert.equal(obj('calculateVictoryForecast(s,{maxNodes:0,maxMs:5000})').status,'unknown');
// Advisory can be ignored, accepted later, and undone as a normal transaction.
assert.equal(run('GameEngine.forecast().status'),'proven');run('GameEngine.dismissForecast()');assert.equal(run('s.phase'),'day');assert.equal(run('GameEngine.forecast().dismissed'),true);
run('GameEngine.acceptForecast()');assert.equal(run('s.winner'),'狼人陣營獲勝');assert(run("s.roleSystem.events.some(e=>e.type==='forecastVictory')"));run('undo()');assert.equal(run('s.winner'),'');assert.equal(run('s.phase'),'day');assert.equal(run('GameEngine.forecast().dismissed'),true);
// A previously proven result cannot be accepted after an authoritative state change.
reset();assert.equal(run('GameEngine.forecast().status'),'proven');run('s.pending=[{id:7,guns:1}];GameEngine.acceptForecast()');assert.equal(run('s.winner'),'');
console.log('PASS bounded forecast: coalition ballots, sheriff, guards, witch self-save, knight, fear/dream, inheritance, side-effect isolation, budgets, dismiss/accept/undo and stale result rejection');

// Production mobile markup exposes explicit opt-out and an accessible advisory.
reset();assert(run('victoryForecastMarkup()').includes('略過 · 繼續遊戲'));assert(run('victoryForecastMarkup()').includes('宣告狼人勝利'));run('GameEngine.dismissForecast()');assert(run('victoryForecastMarkup()').includes('<details'));assert(run('victoryForecastMarkup()').includes('已略過必勝提示'));
// Ended actual results remain stable after the batch context is consumed.
reset('brothers',[3,5,9]);run("s.phase='dawn';s.nightResult={3:['女巫毒'],9:['狼隊刀']};settle()");assert.equal(run('winner()'),'狼人陣營獲勝');

// Completed ballots are retained for the journal; they must not block prediction.
// Reproduce the reported younger-wolf / hunter ending through production voting.
reset('brothers',[2,3,5,7,9],false);run('s.revenge=3;alive().forEach(p=>s.votes[p.id]=5);countVotes(false)');
assert.equal(run('s.voteDone'),true);assert.equal(run('player(5).alive'),false);assert.equal(run('Object.keys(s.votes).length'),5);
assert.equal(run('GameEngine.forecast().status'),'proven');assert(run('victoryForecastMarkup()').includes('宣告狼人勝利'));
// Second-round exile keeps both the PK roster and the ballot receipt.
reset('brothers',[2,3,5,7,9],false);run('s.revenge=3;s.voteRound=2;s.pk=[5,9];alive().filter(p=>!s.pk.includes(p.id)).forEach(p=>s.votes[p.id]=5);countVotes(false)');
assert.equal(run('s.voteDone'),true);assert.equal(run('s.voteRound'),2);assert.deepEqual(obj('s.pk'),[5,9]);assert.equal(run('GameEngine.forecast().status'),'proven');
// A completed double tie also forecasts the next night, while an active PK does not.
reset('brothers',[2,3,7,9],false);run('s.revenge=3;s.voteRound=2;s.pk=[2,3];s.votes={7:2,9:3}');assert.equal(run('GameEngine.forecast().status'),'unknown');
run('countVotes(false)');assert.equal(run('s.voteDone'),true);assert.equal(run('GameEngine.forecast().status'),'proven');
// Ongoing first-round voting remains ineligible.
reset('brothers',[2,3,5,7,9],false);run('s.revenge=3;s.votes={2:5}');assert.equal(run('GameEngine.forecast().status'),'unknown');
