const assert=require('node:assert/strict'),{createGameTest}=require('./test-support.cjs');
const boards=['classic','brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid'];
function setup(board,variant='standard12'){
 const t=createGameTest();t.run(`render=()=>hydrateGame();toast=()=>{};s=fresh();s.board='${board}';s.variant='${variant}';s.players=boardDefinition().roles.map((role,i)=>({id:i+1,name:'',role,alive:true}));s.phase='day';s.elected=true;ensureRoleSystem();gKey='';hydrateGame()`);
 if(board==='cupid')t.run(`s.players.forEach((p,i)=>p.role=['丘比特','平民','狼王','狼人','狼人','預言家','女巫','獵人','白痴','平民','平民','平民'][i]);s.cupid.lovers=[];updateCupidFaction();save()`);
 return t;
}
function unchanged(t,operation,label){const before=t.run('JSON.stringify(s)');t.run(operation);assert.equal(t.run('JSON.stringify(s)'),before,label);}
for(const board of boards){
 let t=setup(board);assert.equal(t.run('gameModel().kind'),'discussion',board);
 assert.equal(t.run('explosionTimingAllowed()'),true,board);
 t.run('beginDayVote()');assert.equal(t.run('gameModel().kind'),'vote',board);
 unchanged(t,'boom()',board+' zero ballots');
 t.run('recordVote(gameModel().voters[0].id,gameModel().targets[0])');unchanged(t,'boom()',board+' recorded exile vote');
 t.run('s=JSON.parse(JSON.stringify(s));gKey="";hydrateGame()');unchanged(t,'boom()',board+' reload');
 // Existing saves with no new dayVoting field must still lock ballots, abstentions and PK.
 for(const legacy of ['s.votes={9:3}','s.votes={9:0}','s.votes={};s.pk=[9,10];s.voteRound=2']){
  t=setup(board);t.run('delete s.dayVoting;'+legacy);unchanged(t,'boom()',board+' legacy '+legacy);
 }
 // Sheriff vote locks at the start, including PK speeches even after ballots clear.
 t=setup(board);t.run(`s.phase='election';s.elected=false;s.candidates=[9,10];s.election={stage:'withdraw',registered:[9,10],withdrawn:[],action:false,target:0};beginSheriffVote()`);
 assert.equal(t.run('sheriffCanExplode()'),false,board);
 unchanged(t,'boom();openElectionExplosion()',board+' sheriff zero ballots');
 t.run('recordVote(gameModel().voters[0].id,9)');unchanged(t,'boom();openElectionExplosion()',board+' sheriff ballot');
 t.run('s.votes={};s.pk=[9,10];s.voteRound=2;s.election.stage="pkSpeeches";setSheriffVoting(false)');unchanged(t,'boom();openElectionExplosion()',board+' PK');
 // A previously opened action cannot execute after voting starts (even direct resolver call).
 t=setup(board);t.run(`s.phase='election';s.elected=false;s.election={stage:'speeches',registered:[],withdrawn:[],action:false,target:0};openElectionExplosion();setSheriffExploder(sheriffExploders()[0].id);s.election.stage='vote'`);
 unchanged(t,'resolveElectionExplosion()',board+' stale sheriff action');
 const action={whiteknight:['openWhiteAction("ordinary")','s.white.action.target=alive().find(p=>p.role==="狼人").id','resolveWhiteAction()'],bloodmoon:['openBloodAction("blood")','','resolveBloodAction()'],dream:['openDreamAction()','s.dream.action.target=alive().find(p=>p.role==="狼人").id','resolveDreamAction()'],cupid:['openCupidAction()','s.cupid.action.target=alive().find(p=>p.role==="狼人").id','resolveCupidAction()']}[board];
 if(action){t=setup(board);t.run(action[0]+';'+action[1]+';s.dayVoting=true');unchanged(t,action[2],board+' stale board resolver');}
 // Start-vote undo returns to the pre-vote contract; next night/day clears only current-day lock.
 t=setup(board);t.run('beginDayVote();undo()');assert.equal(t.run('gameModel().kind'),'discussion',board);
 t.run('beginDayVote();newNight();s.nightResult={};settle()');assert.equal(t.run('explosionTimingAllowed()'),true,board+' next day');
}
// Legacy ordinary-wolf prompt continuation must reject a vote begun while the dialog was open.
for(const board of ['classic','brothers','mechanical','gargoyle']){
 const t=setup(board);t.run(`let pending;HostDialogs={available:true,prompt:(m,done)=>pending=done,confirm:(m,done)=>pending=done,alert:()=>{}};const id=alive().find(p=>p.role==='狼人').id;sheriffBase.boom();pending(String(id));beginDayVote()`);
 unchanged(t,'pending(true)',board+' deferred confirmation');
}
const t=setup('brothers','wolfking10');t.run('beginDayVote()');unchanged(t,'boom()','10-seat wolf king');
console.log('PASS: eight-board zero/recorded/abstention/legacy/PK voting locks, direct and stale explosion rejection, sheriff voting, reload, undo and next-day reset; 10-seat variant. VM only.');
