const assert=require('node:assert/strict');
const {run,obj}=require('./test-support.cjs').createGameTest();

// Exercise current scene -> controller -> engine interactions, not removed DOM selects.
run("s=fresh();gKey='';start();hydrateGame();sceneSeatChoice(2)");
assert.deepEqual(obj('g.regs'),[2,0]);assert.equal(run('g.slot'),1);
run('sceneSeatChoice(2)');assert.deepEqual(obj('g.regs'),[0,0]);
run('sceneSeatChoice(2);sceneSeatChoice(3);confirmGame()');
assert.equal(run('player(2).role'),'狼兄');assert.equal(run('player(3).role'),'狼弟');
run('confirmGame();sceneSeatChoice(2)');assert(!obj('g.regs').includes(2));
run('sceneSeatChoice(8);confirmGame()');assert.equal(run('player(8).role'),'黑市商人');

run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='day';kill(7,'槍擊');gKey='';hydrateGame()");
assert.equal(run('gameModel().kind'),'shot');run('sceneSeatChoice(7)');assert(!run('g.shot'));
run('sceneSeatChoice(9)');assert.equal(run('g.shot'),9);

for(const [phase,light] of [['setup','dusk'],['night','night'],['election','day'],['day','day']]){
 run(`s.phase='${phase}'`);assert.equal(run('scenePhase()'),light);
}
run("s.phase='dawn';g.dawn=-1");assert.equal(run('scenePhase()'),'night');
run('g.dawn=1');assert.equal(run('scenePhase()'),'day');
run("s.phase='end';s.winner='狼人陣營獲勝'");assert.equal(run('scenePhase()'),'eclipse');
run("s.winner='好人陣營獲勝'");assert.equal(run('scenePhase()'),'dawn');
run("s=fresh();s.board='bloodmoon';ensureBlood();s.phase='night';s.n=2;s.blood.sealedNight=2");assert.equal(run('scenePhase()'),'eclipse');

run("s=fresh();s.phase='night';s.players.forEach((p,i)=>p.role=ROLES[i]);s.step=nightSteps().indexOf('wolves');hydrateGame()");
assert.deepEqual(obj('actorIds()'),[1,3,4]);
run("s=fresh();s.board='mechanical';ensureMech();s.phase='night';s.players.forEach((p,i)=>p.role=MECH_ROLES[i]);s.step=nightSteps().indexOf('wolves');gKey='';hydrateGame()");
assert.deepEqual(obj('actorIds()'),[2,3,4]);
run('sceneSeatChoice(9)');assert.equal(run('s.draft.kill'),9);
assert(run('seatHTML(player(9),gameModel())').includes('aria-pressed="true"'));

// Geometry checks do not claim browser layout or native gesture validation.
for(const width of [320,375,390,430,650]){
 const positions=obj(`Array.from({length:12},(_,i)=>seatPosition(i,${width},700))`);
 assert.equal(new Set(positions.map(p=>`${p.x}:${p.y}`)).size,12);
 assert(positions.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100));
}
console.log('PASS: current scene seat selection/undo-selection, occupied/dead guards, eligible shot/knife, lighting including election/dawn/seal, wolf actor isolation, and 12-seat mobile orbit geometry. Browser QA not performed.');
