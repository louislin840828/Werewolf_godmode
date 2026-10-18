const assert=require('node:assert/strict'),{createGameTest}=require('./test-support.cjs');
function setup(board,variant='standard12'){
 const t=createGameTest();t.run(`render=()=>hydrateGame();toast=()=>{};s=fresh();s.board='${board}';s.variant='${variant}';s.players=boardDefinition().roles.map((role,i)=>({id:i+1,name:'',role,alive:true}));s.phase='day';s.elected=true;ensureRoleSystem();gKey='';hydrateGame();let prompts=0;HostDialogs={available:true,prompt:()=>prompts++,confirm:(message,done)=>done(true),alert:()=>{}}`);return t;
}
for(const board of ['classic','brothers','mechanical','gargoyle']){
 let t=setup(board);assert(t.run('actionTray(gameModel())').includes('event-wolf')&&t.run('actionTray(gameModel())').includes('onclick="boom()"'),board);
 const before=t.run('JSON.stringify(s)');t.run('boom()');assert.equal(t.run('gameModel().kind'),'dayExplosion');assert.equal(t.run('prompts'),0);
 t.run('refreshIntro(gameModel())');assert.equal(t.run('introOpen'),false,'card goes straight to seats');
 assert(t.run('actionTray(gameModel())').includes('取消自爆'));
 t.run('confirmGame()');assert.equal(t.run('JSON.stringify(s)'),before,'missing target never executes');
 t.run('sceneSeatChoice(alive().find(p=>p.role==="平民").id)');assert.equal(t.run('draftValue(gameModel().actions[0])'),0,'villager forbidden');
 if(board==='brothers'){t.run('sceneSeatChoice(role("狼兄").id)');assert.equal(t.run('draftValue(gameModel().actions[0])'),0);}
 if(board==='gargoyle'){t.run('sceneSeatChoice(role("石像鬼").id)');assert.equal(t.run('draftValue(gameModel().actions[0])'),0);}
 if(board==='mechanical'){t.run('sceneSeatChoice(role("機械狼").id)');assert.equal(t.run('draftValue(gameModel().actions[0])'),0);}
 t.run('const id=eligibleExploders()[0].id;sceneSeatChoice(id)');assert.equal(t.run('JSON.stringify(s)'),before,'selection remains UI-only');assert(t.run('actionPanel(gameModel())').includes(String(t.run('id')).padStart(2,'0')));
 t.run('cancelDayExplosion();refreshIntro(gameModel())');assert.equal(t.run('introOpen'),false,'cancel returns without another intro');assert.equal(t.run('gameModel().kind'),'discussion');assert.equal(t.run('JSON.stringify(s)'),before);
 t.run('boom();sceneSeatChoice(id);confirmGame()');assert.equal(t.run('player(id).alive'),false);assert.equal(t.run('s.phase'),'night');assert.equal(t.run('prompts'),0);
 t.run('undo()');assert.equal(t.run('player(id).alive'),true);assert.equal(t.run('gameModel().kind'),'discussion');
 t.run('boom();sceneSeatChoice(id);beginDayVote()');const voting=t.run('JSON.stringify(s)');t.run('resolveDayExplosion()');assert.equal(t.run('JSON.stringify(s)'),voting,'stale UI cannot bypass vote lock');assert.equal(t.run('gameModel().kind'),'vote');
}
let t=setup('mechanical');t.run('s.rules.mechBoom=true;boom();sceneSeatChoice(role("機械狼").id)');assert.equal(t.run('draftValue(gameModel().actions[0])'),1);t.run('confirmGame()');assert.equal(t.run('player(1).alive'),false);
t=setup('brothers','wolfking10');t.run('boom();sceneSeatChoice(role("狼王").id);confirmGame()');assert.equal(t.run('role("狼王").alive'),false);assert.equal(t.run('s.pending.length'),0,'wolf king self-explosion never grants a gun');
t=setup('classic');t.run('s.sheriff=1;boom();sceneSeatChoice(1);confirmGame()');assert.equal(t.run('s.badge'),true);assert.equal(t.run('gameModel().kind'),'badge','badge transfer preserved');
t=setup('classic');t.run("s.phase='election';s.elected=false;ensureElection()");assert(t.run('actionTray(gameModel())').includes('day-power'),'sheriff nomination uses a skill card');assert(!t.run('actionTray(gameModel())').includes('<select'),'no manual explosion picker');
t.run('openElectionExplosion()');assert(t.run('actionTray(gameModel())').includes('action-panel'));assert(t.run('actionTray(gameModel())').includes('取消自爆'));
t.run("const e=ensureElection();e.action=false;e.stage='vote'");assert(!t.run('actionTray(gameModel())').includes('狼人自爆'),'sheriff vote hides explosion');
for(const board of ['bloodmoon','dream','cupid','whiteknight']){const b=setup(board);b.run("s.phase='election';s.elected=false;ensureElection()");assert(b.run('actionTray(gameModel())').includes('day-power'),board+' sheriff card');b.run("ensureElection().stage='pkSpeeches'");assert(!b.run('actionTray(gameModel())').includes('自爆'),board+' locked speech has no explosion card');}
console.log('PASS: visible explosion skill card, no prompts, legal seat selection, cancel/missing target, explicit execution, vote lock, undo, mechanical option, 10-seat wolf king and badge continuation. VM only.');
