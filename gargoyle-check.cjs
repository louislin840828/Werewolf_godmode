const assert=require('node:assert/strict');const {run,obj,alerts,context:c}=require('./test-support.cjs').createGameTest();let promptValue='';c.prompt=()=>promptValue;
function initial(){run("s=fresh();s.board='gargoyle';ensureStone();gKey='';introStage='';start();hydrateGame()")}
function register(ids){run('g.regs='+JSON.stringify(ids)+';confirmGame();hydrateGame()')}
initial();assert.deepEqual(obj('nightSteps()'),['stoneReg-gargoyle','grave','wolves','stoneKnife','witch','seer','hunter','gargoyle','review']);
register([1]);register([8]);assert.equal(run('stoneModel().actions.length'),0);run('confirmGame()');
register([2,3,4]);assert.equal(run('inheritsIndependentKnife()'),false);run('setChoice(10);confirmGame()');
assert.equal(run('nightSteps()[s.step]'),'stoneKnife');assert.equal(run('stoneModel().actions.length'),0);run('confirmGame()');assert.equal(run('s.draft.kill'),10);
register([6]);run("chooseAction('poison');setChoice(2);confirmGame()");register([5]);run('setChoice(1);confirmGame()');assert.equal(run('revealText(gameModel().actions[0])'),'狼人');run('confirmGame()');
register([7]);run('confirmGame()');assert.equal(run('nightSteps()[s.step]'),'gargoyle');run('setChoice(7);confirmGame()');assert.equal(run('g.reveal'),true);assert.equal(run('stoneCheckResult()'),'獵人');run('confirmGame();confirmGame()');assert.equal(run('s.phase'),'election');
run('setChoice(5);confirmGame();confirmGame();confirmGame();confirmGame()');
for(let turns=0;run('s.phase')==='dawn'&&turns<3;turns++)run('confirmGame()');assert.equal(run('s.phase'),'day');assert.equal(run('player(10).alive'),false);assert.equal(run('player(2).alive'),false);
// Successful execution of a wolf produces exactly one exile record, consumed next night.
run('kill(3,\'放逐\')');assert.equal(run('s.exiles.length'),1);assert.equal(run('s.exiles[0].alignment'),'狼人');run('newNight();gameModel()');assert.equal(run('graveRecord().id'),3);assert.equal(run('revealText(gameModel().actions[0])'),'狼人');
// Next day no execution: older record must not carry forward.
run('s.n=3');assert.equal(run('graveRecord()'),null);
// Other death causes never create a gravekeeper result.
run("s=fresh();s.board='gargoyle';ensureStone();s.players.forEach((p,i)=>p.role=BOARD_TEMPLATES.gargoyle.roles[i]);s.phase='day';kill(2,'自爆');kill(3,'女巫毒');kill(4,'槍擊')");assert.equal(run('s.exiles.length'),0);assert.equal(run('inheritsIndependentKnife()'),false); // Ordinary deaths this round: knife starts next night.
run("newNight();s.step=nightSteps().indexOf('stoneKnife');hydrateGame()");assert.equal(run('inheritsIndependentKnife()'),true);assert(run('stoneModel().actions').some(a=>a.field==='stoneKill'));assert(!run('stoneModel().actions').find(a=>a.field==='stoneKill').targets.includes(1));run("s.step=nightSteps().indexOf('gargoyle')");assert(!run('stoneModel().actions').find(a=>a.field==='stoneCheck').targets.includes(1));
// Gargoyle stays wolf-aligned before and after inheriting knife.
assert.equal(run('roleStatus(1).alignment'),'狼人');assert.equal(run('result(1)'),'狼人');
// Gargoyle cannot self-explode, even if mechanically entered into the dialog.
promptValue='1';const aliveBefore=run('player(1).alive');run('s.phase=\'day\';boom()');assert.equal(run('player(1).alive'),aliveBefore);
// Reject self knife through traditional controls, and reject premature inherited knife.
run("s.phase='night';s.step=nightSteps().indexOf('stoneKnife');s.draft={stoneKill:1};nextNight()");assert(alerts.at(-1).includes('自刀'));run("s.players.find(p=>p.role==='狼人').alive=true;s.draft={stoneKill:9};nextNight()");assert(alerts.at(-1).includes('尚未全數出局'));
// Deliberate no-execution PK produces no record.
run("s=fresh();s.board='gargoyle';ensureStone();s.players.forEach((p,i)=>p.role=BOARD_TEMPLATES.gargoyle.roles[i]);s.phase='day';s.votes=Object.fromEntries(s.players.map(p=>[p.id,0]));s.votes[5]=2;s.votes[6]=3;countVotes(false);s.votes=Object.fromEntries(alive().filter(p=>!s.pk.includes(p.id)).map(p=>[p.id,0]));s.votes[5]=2;s.votes[6]=3;countVotes(false)");assert.equal(run('s.voteDone'),true);assert.equal(run('s.exiles.length'),0);
// Undo restores execution history together with player state.
run("s.votes={};kill(9,'放逐')");assert.equal(run('s.exiles[0].alignment'),'好人');run("s=fresh();s.board='gargoyle';ensureStone();s.players.forEach((p,i)=>p.role=BOARD_TEMPLATES.gargoyle.roles[i]);s.phase='day';mutate(()=>kill(9,'放逐'));undo()");assert.equal(run('s.exiles.length'),0);assert.equal(run('player(9).alive'),true);
console.log('PASS: current gargoyle-last first-night/election/dawn flow, exact role/faction lookup, exile-only and no stale/PK grave result, next-night knife inheritance, self restrictions and undo.');
