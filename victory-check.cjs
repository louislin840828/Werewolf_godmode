const assert=require('node:assert/strict');
const {createGameTest}=require('./test-support.cjs');const {run,obj}=createGameTest();
function reset(board='brothers',ids=[3,4,5,9],phase='day'){
 run(`s=fresh();s.board=${JSON.stringify(board)};s.players.forEach((p,i)=>{p.role=boardDefinition().roles[i];p.alive=${JSON.stringify(ids)}.includes(p.id)});s.phase=${JSON.stringify(phase)};s.n=3;s.elected=true;s.heal=false;s.poison=false;ensureRoleSystem();s.trade={id:10,gift:'查驗',success:true,used:true,night:1};`);
}
// Simultaneous night deaths: edge takes priority, independent of source or order.
for(const batch of ["{9:['狼隊刀'],3:['女巫毒']}","{3:['女巫毒'],9:['連續攝夢']}","{3:['女巫毒'],9:['女巫毒']}"]){reset('brothers',[3,5,9],'dawn');run(`s.nightResult=${batch};settle()`);assert.equal(run('s.winner'),'狼人陣營獲勝');}
// Last hunter/gift gun cannot overturn an already-completed edge.
reset('brothers',[3,7,9],'dawn');run("s.trade={id:7,gift:'獵槍',success:true,used:false,night:1};s.nightResult={7:['狼隊刀']};settle()");assert.equal(run('s.winner'),'狼人陣營獲勝');assert.equal(run('s.pending.length'),0);
// No edge: elimination of last wolf settles good victory before a hunter gun.
reset('brothers',[3,5,7,9],'dawn');run("s.nightResult={3:['女巫毒'],7:['狼隊刀']};settle()");assert.equal(run('s.winner'),'好人陣營獲勝');assert.equal(run('s.pending.length'),0);
// A still-unsettled night permits a gun; a bad shot can lose the last villager.
reset('brothers',[3,5,7,9],'dawn');run("s.nightResult={7:['狼隊刀']};settle()");assert.equal(run('s.winner'),'');run('shoot(9)');assert.equal(run('s.winner'),'狼人陣營獲勝');
// Undo restores the entire batch, pending powers and winner.
run('undo()');assert.equal(run('s.winner'),'');assert.equal(run('player(9).alive'),true);assert.equal(run('s.pending[0].id'),7);
// Blood final night: dying to poison does not cancel a simultaneous good edge.
reset('bloodmoon',[1,5,9],'dawn');run("s.blood.lastWolf=1;s.blood.lastNight=3;s.nightResult={1:['女巫毒'],9:['狼隊刀']};settle()");assert.equal(run('s.winner'),'狼人陣營獲勝');
reset('bloodmoon',[1,5,9],'dawn');run("s.blood.lastWolf=1;s.blood.lastNight=3;s.nightResult={};settle()");assert.equal(run('s.winner'),'好人陣營獲勝');assert.equal(run('s.blood.sealedNight'),0);
function cupid(ids){reset('cupid',ids);run("s.players.forEach((p,i)=>p.role=['平民','丘比特','狼王','狼人','狼人','預言家','女巫','獵人','白痴','平民','平民','平民'][i]);s.cupid.cupidId=2;s.cupid.lovers=[3,6];s.cupid.third=true;");}
cupid([2,3,6,10]);run("s.phase='dawn';s.nightResult={10:['狼隊刀']};settle()");assert.equal(run('s.winner'),'第三方陣營獲勝');
cupid([2,3,4,6,10]);run("s.phase='dawn';s.nightResult={10:['狼隊刀']};settle()");assert.equal(run('s.winner'),'狼人陣營獲勝');
cupid([2,3,6,10]);run("mutate(()=>{kill(3,'放逐');checkWin()})");assert.equal(run('s.winner'),'好人陣營獲勝');assert.equal(run('s.pending.length'),0);
cupid([2,3,6,10]);run("s.phase='dawn';s.nightResult={3:['女巫毒']};settle()");assert.equal(run('s.winner'),'好人陣營獲勝');
// A mixed lover wolf cannot claim original-team edge victory with outsiders alive.
cupid([2,3,6,10,11]);run("s.phase='dawn';s.nightResult={10:['狼隊刀'],11:['女巫毒']};settle()");assert.equal(run('s.winner'),'第三方陣營獲勝');
cupid([2,3,6,7,10]);run("s.phase='dawn';s.nightResult={10:['狼隊刀']};settle()");assert.equal(run('s.winner'),'');
console.log('PASS victory checkpoints: complete night batches, all damage sources, pending gun priority, final blood night, true faction allegiance, lovers and undo');

// A pre-update save paused at an already-terminal night gun adopts the new rule.
reset('brothers',[3,7,9],'day');run("player(7).alive=false;s.pending=[{id:7,guns:1}];s.roleSystem.deaths[7]={round:3,phase:'night',factors:[{code:'knife',label:'狼隊刀'}]};reconcileVictoryOnLoad()");assert.equal(run('s.winner'),'狼人陣營獲勝');assert.equal(run('s.pending.length'),0);
