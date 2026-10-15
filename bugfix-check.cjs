const fs=require('fs'),vm=require('vm'),assert=require('assert'),nodes={};
const c={window:{innerWidth:390},console,Date,JSON,Math,setInterval:()=>{},setTimeout:()=>{},clearTimeout:()=>{},cancelAnimationFrame:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:id=>nodes[id]||(nodes[id]={value:'0',innerHTML:''}),querySelector:()=>null,body:{dataset:{}}},confirm:()=>true,alert:m=>{throw Error(m)}};
vm.createContext(c);const run=x=>vm.runInContext(x,c),obj=x=>JSON.parse(run('JSON.stringify('+x+')'));
for(const f of ['app.js','app.view.js','boards.js','mechanical.js','mechanical.view.js','gargoyle.js','gargoyle.view.js','whiteknight.js','whiteknight.view.js','bloodmoon.js','bloodmoon.view.js','dream.js','dream.view.js','cupid.js','cupid.view.js','election.js','election.view.js','rules/role-state.js','role-runtime.js','game-controller.js','victory-forecast.js'])run(fs.readFileSync('src/'+f,'utf8'));
run(fs.readFileSync('src/game.js','utf8').replace(/primeRoleImages\(\);render\(\);\s*$/,''));run('render=()=>hydrateGame()');
// New logs, legacy saved JSON and export share readable, board-scoped rules.
for(const board of ['brothers','mechanical','gargoyle','whiteknight','bloodmoon','dream','cupid']){
 run(`s=fresh();s.board='${board}';ensureMech();gKey='';start()`);
 assert(!run('s.logs.map(l=>l.text).join(" ")').includes('{"self"'));
 run('s.logs.push({period:"第 1 夜",at:"12:00",text:"規則："+JSON.stringify(s.rules)})');
 const diary=run('logsUI()'),out=run('exportText()');assert(diary.includes('女巫自救：'));assert(out.includes('警徽：雙爆吞警徽'));assert(!out.includes('"shieldOnce"'));
 if(board!=='mechanical')assert(!out.includes('機械守護：'));
 if(board!=='brothers')assert(!out.includes('狼兄自刀：'));
 run("gDrawer='log'");assert(!run('showDrawer()').includes('&quot;self&quot;'));
}
run("s.rules.self='first';s.rules.double=false;s.rules.shieldOnce=false;s.rules.guardSaveDies=false;s.rules.mechBoom=true;s.board='mechanical'");assert(run('rulesText()').includes('僅首夜可自救'));assert(run('rulesText()').includes('單爆吞警徽'));assert(run('rulesText()').includes('每晚可用，不可連守'));assert(run('rulesText()').includes('刀口存活'));assert(run('rulesText()').includes('機械狼自爆：允許'));
assert.equal(run('logText({text:\'筆記：{"self":"no"}\'})'),'筆記：{"self":"no"}');
// Cancel unconfirmed selections, including a previously auto-advanced slot.
run("s=fresh();s.board='brothers';start();gKey='';hydrateGame();setChoice(1);setChoice(2)");assert.deepEqual(obj('g.regs'),[1,2]);run('setChoice(1)');assert.deepEqual(obj('g.regs'),[0,2]);assert.equal(run('g.slot'),0);run('clearChoice()');assert.deepEqual(obj('g.regs'),[0,0]);assert.equal(run('player(1).role'),'未確認');
// One current-turn rollback clears the registered roles, skill targets and logs,
// keeps earlier roles, and permits selecting different seats on every board.
for(const [board,stage,ids] of [['brothers','merchant',[3]],['mechanical','mechanical',[1]],['gargoyle','grave',[8]],['whiteknight','guard',[8]],['bloodmoon','guard',[8]],['dream','fear',[1]],['cupid','cupid',[2]]]){
 run(`s=fresh();s.board='${board}';ensureMech();start();s.step=nightSteps().indexOf('${stage}');player(12).role='平民';gKey='';hydrateGame()`);
 const before=obj('s.players'),logs=run('s.logs.length');
 for(const [i,id] of ids.entries())run(`g.slot=${i};setChoice(${id})`);
 run('confirmGame()');assert.equal(run('gameModel().kind'),'night',board);
 const a=run('gameModel().actions[0]?.field');if(a)run(`setChoice(9)`);
 assert(run('currentRegistrationCheckpoint()')>=0,board);
 run('retractRoleStep()');assert.deepEqual(obj('s.players'),before,board);assert.equal(run('s.logs.length'),logs);assert.equal(run('gameModel().kind'),'register');assert(obj('g.regs').every(x=>x===0));assert.equal(run('s.draft.'+ (a||'kill')),undefined);
 run('setChoice(10);confirmGame()');assert.notEqual(run('player(10).role'),'未確認');assert.equal(run('player('+ids[0]+').role'),'未確認');
 run('undo()');assert.equal(run('gameModel().kind'),'register');assert(obj('g.regs').every(x=>x===0));
}
// A same-stage undo invalidates UI-only selections even if the phase key is unchanged.
run("s=fresh();start();gKey='';hydrateGame();mutate(()=>log('筆記'));setChoice(1);undo()");assert(obj('g.regs').every(x=>x===0));
// Last god registration automatically fills villagers; rollback restores all inferred roles.
run("s=fresh();s.board='dream';start();s.step=nightSteps().indexOf('hunter');s.players.forEach((p,i)=>p.role=i===6||i>=8?'未確認':boardDefinition().roles[i]);gKey='';hydrateGame();setChoice(7);confirmGame()");assert.equal(run('s.players.filter(p=>p.role===\'平民\').length'),4);run('retractRoleStep()');assert.equal(run('s.players.filter(p=>p.role===\'未確認\').length'),5);
console.log('PASS: seven-board readable new/legacy diary/export rules; board filtering and option values; role toggle/clear; current-turn registration + skill rollback, preservation/reselection on seven boards; same-stage undo invalidation; inferred villagers rollback.');
