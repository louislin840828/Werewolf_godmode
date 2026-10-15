const assert=require('assert');const fixture=require('./test-support.cjs').createGameTest();const c=fixture.context,run=fixture.run;let app={innerHTML:''};
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='night';s.draft={kill:5,save:true,revenge:5};");assert.deepEqual(JSON.parse(run('JSON.stringify(outcomes())')),{'5':['復仇刀']});
run("s.rules.revengeSave=true");assert.equal(run('Object.keys(outcomes()).length'),0);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='night';s.draft={trade:2,gift:'查驗'}");assert.equal(run('tradeNow().success'),false);assert.equal(run('outcomes()[8][0]'),'交易失敗');assert.equal(run('result(2)'),'好人');
run("s.phase='dawn';kill(1,'女巫毒');s.n=2");assert.equal(run('s.revenge'),2);assert.equal(run('result(2)'),'狼人');
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='dawn';s.trade={id:9,gift:'獵槍',night:1,success:true,used:false};kill(9,'狼隊刀')");assert.equal(run('s.pending.length'),0);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='dawn';s.n=2;s.trade={id:9,gift:'獵槍',night:1,success:true,used:false};kill(9,'狼隊刀')");assert.equal(run('s.pending.length'),1);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='dawn';kill(7,'狼隊刀＋女巫毒')");assert.equal(run('s.pending.length'),0);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='day';s.sheriff=5;s.votes=Object.fromEntries(s.players.map(p=>[p.id,0]));s.votes[5]=1;s.votes[6]=2;countVotes(false)");assert.equal(run('player(1).alive'),false);assert.equal(run('s.revenge'),2);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='day';s.votes=Object.fromEntries(s.players.map(p=>[p.id,0]));s.votes[5]=1;s.votes[6]=2;countVotes(false)");assert.equal(run('s.pk.length'),2);assert.equal(run('s.voteRound'),2);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);s.phase='night';s.step=4;s.draft={kill:4,save:true,poison:2,check:5};backNight()");assert.equal(run('s.draft.check'),undefined);
run("s=fresh();s.players.forEach((p,i)=>p.role=ROLES[i]);start();s.players.forEach((p,i)=>p.role=ROLES[i]);while(s.phase==='night'){let k=nightSteps()[s.step];if(k==='seer')s.draft.check=1;nextNight()}s.candidates=[5];confirmGame();confirmGame();confirmGame();confirmGame();settle();");assert.equal(run('s.phase'),'day');assert.equal(run('s.sheriff'),5);
console.log('PASS: 10 state-transition scenarios, including full first-night/election/dawn flow.');

run("s=fresh();start()");assert.equal(run("s.players.filter(p=>p.role==='未確認').length"),12);assert.equal(run("registrationNeeded('meet')"),true);
let fields={};c.document.getElementById=id=>fields[id]||app;
function register(values){fields=Object.fromEntries(values.map((value,i)=>['reg'+i,{value}]));run('registerRoles()')}
register([3,7]);assert.equal(run("role('狼兄').id"),3);run('nextNight()');register([9]);run("s.draft.trade=4;s.draft.gift='查驗';nextNight()");register([4,10]);assert.equal(run('tradeNow().success'),false);run("nextNight();nextNight()");register([1]);run('nextNight()');register([2]);run("s.draft.check=7;nextNight();nextNight();nextNight()");register([5]);assert.equal(run("s.players.filter(p=>p.role==='平民').length"),4);assert.equal(run("s.players.filter(p=>p.role==='未確認').length"),0);run('nextNight();nextNight()');assert.equal(run('s.phase'),'election');assert.equal(run('s.trade.success'),false);console.log('PASS: unknown-role opening and complete first-night registration, including delayed failed trade.');

function mech(){run("s=fresh();s.board='mechanical';ensureMech();s.players.forEach((p,i)=>p.role=MECH_ROLES[i]);s.phase='night'")}
mech();run("s.draft={learn:7,kill:1};s.step=nightSteps().indexOf('review');nextNight();s.elected=true;s.phase='dawn';settle()");assert.equal(run('s.pending[0].id'),1);
mech();run("s.draft={learn:7,poison:1};s.step=nightSteps().indexOf('review');nextNight();s.phase='dawn';settle()");assert.equal(run('s.pending.length'),0);
mech();run("s.draft={learn:6};");assert.equal(run('spiritResult(1)'),'女巫');assert(!run('mechanicalUI()').includes('機械毒藥</label>'));
mech();assert.equal(run('spiritResult(1)'),'機械狼');run("s.rules.rawMech='狼人'");assert.equal(run('spiritResult(1)'),'狼人');
mech();run("s.n=2;s.mech.learned={id:6,role:'女巫',night:1}");assert(run('mechanicalUI()').includes('機械毒藥'));run('s.mech.poisonUsed=true');assert(!run('mechanicalUI()').includes('機械毒藥</label>'));
mech();assert.equal(run('inheritsKnife()'),false);run("s.players.filter(p=>p.role==='狼人').forEach(p=>p.alive=false)");assert.equal(run('inheritsKnife()'),true);
mech();run('s.draft={kill:9,extra:9,double:true,guard:9,healTarget:9,mechShield:9}');assert.equal(run('outcomes()[9][0]'),'雙刀同人強制擊殺');run('s.rules.doubleShieldPierce=false');assert.equal(run('Object.keys(outcomes()).length'),0);
mech();run('s.draft={kill:9,extra:10,double:true,guard:9,healTarget:10}');assert.equal(run('Object.keys(outcomes()).length'),0);
mech();run('s.draft={kill:9,guard:9,healTarget:9}');assert.equal(run('outcomes()[9][0]'),'同守同救');run('s.rules.guardSaveDies=false');assert.equal(run('Object.keys(outcomes()).length'),0);
mech();run('s.draft={kill:9,poison:9,mechPoison:9,mechShield:9}');assert.equal(run('Object.keys(outcomes()).length'),0);run('s.draft.mechShield=0;s.draft.guard=9');assert.equal(run('outcomes()[9].length'),2);
mech();run("s.n=2;s.mech.learned={id:8,role:'守衛',night:1};s.draft={mechShield:9};s.step=nightSteps().indexOf('review');nextNight()");assert.equal(run('s.mech.shieldUsed'),true);
mech();run("s.n=2;s.mech.learned={id:2,role:'狼人',night:1};s.players.filter(p=>p.role==='狼人').forEach(p=>p.alive=false);s.draft={kill:9,extra:10,double:true};s.step=nightSteps().indexOf('review');nextNight()");assert.equal(run('s.mech.doubleUsed'),true);
// Full first-night registration followed by learn/spirit lookup, election and settlement.
run("s=fresh();s.board='mechanical';start()");
for(let turns=0;run('s.phase')==='night'&&turns<40;turns++){
 const rs=fixture.obj('currentReg()');
 if(rs){const used=new Set();const ids=rs.map(role=>{const p=fixture.obj('s.players').find(p=>!used.has(p.id)&&p.role==='未確認'&&run('MECH_ROLES['+(p.id-1)+']')===role);assert(p,'Unregistered seat for '+role);used.add(p.id);return p.id});run('g.regs='+JSON.stringify(ids)+';confirmGame()');continue;}
 const k=run('nightSteps()[s.step]');if(k==='mechanical'&&!run('s.draft.learn'))run('setChoice(7)');if(k==='wolves'&&!run('s.draft.kill'))run('setChoice(9)');if(k==='spirit'&&!run('s.draft.spiritCheck'))run('setChoice(1)');run('confirmGame()');
}
assert.equal(run('s.phase'),'election');assert.equal(run("s.players.filter(p=>p.role==='平民').length"),4);
run("s.candidates=[5];confirmGame();confirmGame();confirmGame();confirmGame();settle()");assert.equal(run('player(9).alive'),false);assert.equal(run('s.phase'),'day');assert.equal(run('s.mech.learned.role'),'獵人');
run("newNight();nightUI()");assert.equal(run('nightSteps()[0]'),'mechanical');assert(!run('nightSteps()').some(x=>x.startsWith('reg')));
console.log('PASS: 14 mechanical scenarios including full registration/action/day flow, six learning identities and defensive interactions.');
mech();run("s.n=3;s.mech.learned={id:5,role:'通靈師',night:1};s.draft.mechCheck=2");assert(run('mechanicalUI()').includes('查驗結果：狼人'));run('s.draft.mechCheck=0');assert(run('mechanicalUI()').includes('通靈查驗（每晚一次）'));
mech();run("s.draft.learn=9");assert.equal(run('learnedNow().role'),'平民');assert(run('mechanicalUI()').includes('第二次睜眼時才告知結果'));assert.equal(run('spiritResult(1)'),'平民');
mech();run("s.n=2;s.mech.learned={id:8,role:'守衛',night:1};s.rules.shieldOnce=false;s.mech.lastShield=9");assert(!run('mechanicalUI()').includes('value="9"'));
mech();run("s.n=2;s.mech.learned={id:6,role:'女巫',night:1};s.draft={mechPoison:9};s.step=nightSteps().indexOf('review');nextNight();undo()");assert.equal(run('s.mech.poisonUsed'),false);assert.equal(run('s.phase'),'night');
console.log('PASS: recurring spirit lookup, civilian learning, repeat-shield restriction and undo restores skill inventory.');
