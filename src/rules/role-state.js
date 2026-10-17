// Pure shared role rules. No browser, UI, storage, or global game dependencies.
const RoleSystem=(()=>{
 const VERSION=1,UNKNOWN='未確認';
 const wolves=new Set(['狼兄','狼弟','狼人','機械狼','石像鬼','白狼王','血月使者','夢魘','狼王']);
 const gods=new Set(['預言家','通靈師','女巫','守衛','獵人','黑市商人','守墓人','騎士','獵魔人','攝夢人','白痴']);
 const roleSkills={狼人:['knife'],狼兄:['knife'],狼弟:['revenge','knife'],預言家:['inspectAlignment'],通靈師:['inspectRole'],女巫:['heal','poison'],守衛:['guard'],獵人:['shoot'],黑市商人:['trade'],機械狼:['learn','knife'],石像鬼:['inspectRole','knife'],守墓人:['inspectExile'],白狼王:['knife','take'],騎士:['duel'],血月使者:['knife','bloodSeal','lastNight'],獵魔人:['hunt'],夢魘:['fear','knife'],攝夢人:['dream'],盜賊:['swap'],丘比特:['link'],狼王:['knife','shoot'],白痴:['reveal'],平民:[]};
 const at=q=>({round:q.n,phase:q.phase,step:q.step});
 const clone=x=>JSON.parse(JSON.stringify(x));
 const player=(q,id)=>q.players.find(p=>p.id===+id);
 const isWolf=p=>!!p&&wolves.has(p.role);
 const causes=reason=>[...new Set((Array.isArray(reason)?reason:String(reason||'').split(/[＋+]/)).filter(Boolean))];
 const factorCode=c=>c.includes('毒')?'poison':c==='殉情'?'heartbreak':c==='連續攝夢'?'dreamRepeat':c==='攝夢牽連'?'dreamLink':c==='自爆'?'explode':c==='放逐'?'exile':c==='槍擊'?'shot':c.includes('刀')||c==='同守同救'?'knife':'other';
 const factors=reason=>causes(reason).map(label=>({code:factorCode(label),label}));
 const isNightDeath=(q,reason)=>q.phase==='night'||q.phase==='dawn'||!!q.dream?.nightResolving&&!causes(reason).some(c=>['放逐','自爆'].includes(c));
 function normalizeDeaths(q,input){
  const out={};for(const [id,c] of Object.entries(input||{}))out[id]=causes(c);
  if(q.board==='cupid'&&q.cupid?.lovers?.length===2){const [a,b]=q.cupid.lovers,aa=out[a]||[],bb=out[b]||[],direct=x=>x.some(c=>c!=='殉情');
   // Both direct casualties also carry heartbreak; original-only victim does not.
   if(direct(aa)&&direct(bb)){out[a]=causes([...aa,'殉情']);out[b]=causes([...bb,'殉情']);}
   else if(aa.length&&!bb.length)out[b]=['殉情'];else if(bb.length&&!aa.length)out[a]=['殉情'];
  }
  return out;
 }
 function gunEligibility(q,id,reason,night=true){
  const ff=factors(reason),blocked=ff.find(f=>['poison','heartbreak','dreamRepeat','dreamLink','explode'].includes(f.code));
  if(blocked)return {available:false,reason:({poison:'中毒',heartbreak:'殉情',dreamRepeat:'連續攝夢致死',dreamLink:'攝夢牽連致死',explode:'自爆'})[blocked.code],factors:ff};
  if(night&&q.board==='dream'&&q.draft?.fear===+id)return {available:false,reason:'當夜被恐懼',factors:ff};
  return {available:true,reason:'未受禁止開槍的因素影響',factors:ff};
 }
 function thirdMembers(q){return q.board==='cupid'&&q.cupid?.third?[...new Set([q.cupid.cupidId,...q.cupid.lovers].filter(Boolean))]:[];}
 function independentKnife(q){
  const ordinary=q.players.filter(p=>p.role==='狼人');if(ordinary.length!==3||ordinary.some(p=>p.alive))return false;
  const times=ordinary.map(p=>q.roleSystem?.deaths?.[p.id]).filter(d=>d&&(!d.legacy||!d.factors.some(f=>f.label.includes('未知')))).map(d=>d.round).filter(Number.isFinite);
  return !times.length||q.n>Math.max(...times);
 }
 function effects(q,id){
  const p=player(q,id),d=q.draft||{},out=[],add=(kind,source,targets,extra={})=>out.push({kind,source,targets,starts:{round:q.n,phase:'night'},expires:{round:q.n,phase:'nightSettlement'},...extra});
  const nightly=q.phase==='night'||q.phase==='dawn'||!!q.dream?.nightResolving;
  if(nightly&&q.board==='dream'){
   if(d.fear===+id)add('fear',q.players.find(x=>x.role==='夢魘')?.id,[+id]);
   const dreamer=q.players.find(x=>x.role==='攝夢人'),target=d.fear===dreamer?.id?0:d.dream;
   if(target===+id)add('dream',dreamer.id,[+id],{repeat:q.dream?.resolvedNight===q.n?q.dream.priorTarget===+id:q.dream?.lastTarget===+id});
  }
  if(nightly&&d.guard===+id)add('guard',q.players.find(x=>x.role==='守衛')?.id,[+id],{blocks:['knife']});
  if(nightly&&d.mechShield===+id)add('mechanicalGuard',q.players.find(x=>x.role==='機械狼')?.id,[+id],{blocks:['knife','poison']});
  if(nightly&&q.board==='bloodmoon'&&q.blood?.sealedNight===q.n&&!isWolf(p))add('seal',q.players.find(x=>x.role==='血月使者')?.id,[+id]);
  return out;
 }
 function relationships(q,id){
  const out=[],add=(kind,targets,source=null)=>out.push({kind,source,targets});
  if(q.board==='cupid'&&q.cupid?.lovers.includes(+id))add('lovers',q.cupid.lovers.filter(x=>x!==+id),q.cupid.cupidId);
  if(q.board==='brothers'&&['狼兄','狼弟'].includes(player(q,id)?.role))add('siblings',q.players.filter(p=>['狼兄','狼弟'].includes(p.role)&&p.id!==+id).map(p=>p.id));
  if(q.board==='dream'&&q.dream?.linkNight===q.n&&q.dream.linkTarget){const source=q.players.find(p=>p.role==='攝夢人')?.id;if(source===+id)add('dreamLink',[q.dream.linkTarget],source);else if(q.dream.linkTarget===+id)add('dreamLink',[source],source);}
  return out;
 }
 function skills(q,p){
  const d=q.draft||{},rs=q.rules||{},m=q.mech||{},out=[];
  const add=(id,remaining=null,from=q.n,extra={})=>out.push({id,remaining,availableFrom:from,enabled:p.alive&&q.n>=from&&(remaining===null||remaining>0),...extra});
  for(const id of roleSkills[p.role]||[]){
   if(id==='heal')add(id,q.heal===false?0:1);
   else if(id==='poison')add(id,q.poison===false?0:1);
   else if(id==='trade')add(id,q.trade?0:1);
   else if(id==='duel')add(id,q.white?.duelUsed?0:1);
   else if(id==='learn')add(id,m.learned||d.learn?0:1);
   else if(id==='swap')add(id,q.cupid?.pick>=0?0:1,1);
   else if(id==='link')add(id,q.cupid?.lovers.length===2?0:1,1);
   else if(id==='reveal'&&q.board==='classic')add(id,p.idiotRevealed?0:1);
   else if(id==='hunt')add(id,null,2);
   else if(id==='knife'&&['機械狼','石像鬼'].includes(p.role))add(id,null,q.n,{enabled:p.alive&&independentKnife(q),requires:'ordinaryWolvesGoneBeforeNight'});
   else if(id==='knife'&&p.role==='狼弟')add(id,null,q.revenge?q.revenge+1:Infinity,{enabled:p.alive&&!!q.revenge&&q.n>q.revenge});
   else if(id==='revenge')add(id,q.revenge&&q.n<=q.revenge?1:0,q.revenge||Infinity,{enabled:p.alive&&q.revenge===q.n});
   else add(id);
  }
  if(p.role==='機械狼'){
   const l=m.learned||(d.learn?{id:d.learn,role:player(q,d.learn)?.role,night:q.n}:null);
   if(l){const from=l.night+1;
    if(l.role==='通靈師')add('learnedInspectRole',null,from);
    if(l.role==='女巫')add('learnedPoison',m.poisonUsed?0:1,from);
    if(l.role==='守衛')add('learnedGuard',rs.shieldOnce===false?null:m.shieldUsed?0:1,from);
    if(l.role==='獵人')add('learnedShoot',m.gunUsed?0:1,l.night);
    if(l.role==='狼人')add('doubleKnife',m.doubleUsed?0:1,from,{enabled:p.alive&&q.n>=from&&!m.doubleUsed&&independentKnife(q)});
   }
  }
  const t=q.trade;if(t?.success&&t.id===p.id)add('gift'+t.gift,t.used?0:1,t.night+1,{gift:t.gift,availablePhase:t.gift==='獵槍'?'day':'night'});
  const ee=effects(q,p.id);for(const skill of out){skill.previousTarget=skill.id==='guard'?q.guardLast||0:skill.id==='learnedGuard'?m.lastShield||0:skill.id==='fear'?q.dream?.lastFear||0:skill.id==='dream'?q.dream?.lastTarget||0:0;skill.blockedBy=ee.filter(e=>['fear','seal'].includes(e.kind)).map(e=>e.kind);if(skill.blockedBy.length)skill.enabled=false;}
  return out;
 }
 function state(q,id){
  const p=player(q,id);if(!p)return null;
  const registered=p.role!==UNKNOWN,base=registered?(isWolf(p)?'狼人':'好人'):'未知',third=thirdMembers(q).includes(p.id);
  const original=q.cupid?.thiefId===p.id?'盜賊':q.roleSystem?.identities?.[p.id]||p.role;
  const death=q.roleSystem?.deaths?.[p.id]||null;
  const delayed=p.alive&&q.board==='bloodmoon'&&q.blood?.lastWolf===p.id&&q.blood.lastNight&&!q.blood.finalResolved;
  const e=q.election||{},elect=q.phase==='election',excluded=q.voteRound===1?(e.registered||q.candidates):q.candidates;
  const r=p.role==='狼弟'?q.revenge&&q.n===q.revenge?'revenge':q.revenge&&q.n>q.revenge?'joined':'waiting':null;
  const learned=p.role==='機械狼'?(q.mech?.learned||(q.draft?.learn?{role:player(q,q.draft.learn)?.role,night:q.n,id:q.draft.learn}:null)):null;
  return {id:p.id,registered,originalRole:original,currentRole:p.role,originalAlignment:base,alignment:third?'第三方':base,edge:!registered?'unknown':isWolf(p)?'wolf':p.role==='平民'?'villager':gods.has(p.role)?'god':'other',alive:p.alive,life:delayed?'delayedDeath':p.alive?'alive':'dead',death,
   canSpeak:p.alive||!!q.cupid?.speakers.includes(p.id),canVote:p.alive&&!(q.board==='classic'&&p.idiotRevealed)&&!(elect&&excluded.includes(p.id))&&!(q.phase==='day'&&q.pk?.includes(p.id)),canAct:p.alive&&registered&&!effects(q,p.id).some(e=>['fear','seal'].includes(e.kind)),
   pendingAbilities:(q.pending||[]).filter(h=>h.id===p.id).map(h=>({id:h.type==='whiteTake'?'take':'shoot',remaining:h.guns})),skills:skills(q,p),effects:effects(q,p.id),relationships:relationships(q,p.id),progression:r,learned,inspectionRole:p.role==='機械狼'?(learned?.role||q.rules.rawMech||'機械狼'):p.role,lover:!!q.cupid?.lovers.includes(p.id),originalThief:q.cupid?.thiefId===p.id,
   knowledge:(q.roleSystem?.information?.[p.id]||[]).map(clone)};
 }
 function victoryContext(q,kind){
  const third=thirdMembers(q);
  return {kind,wolfTeamPresent:q.players.some(p=>p.alive&&isWolf(p)&&!third.includes(p.id))};
 }
 function winner(q,context=q.victoryContext){
  const living=q.players.filter(p=>p.alive);if(living.some(p=>p.role===UNKNOWN))return '';
  const third=thirdMembers(q),wolfTeam=p=>isWolf(p)&&!third.includes(p.id);
  if(third.length&&living.length&&living.every(p=>third.includes(p.id)))return '第三方陣營獲勝';
  const edge=!living.some(p=>p.role==='平民')||!living.some(p=>gods.has(p.role));
  // All effective night casualties (including automatic links) resolve together.
  // A wolf who joined the lovers does not qualify for original wolf-team victory.
  if(context?.kind==='night'&&context.wolfTeamPresent&&edge)return '狼人陣營獲勝';
  if(!living.some(isWolf))return '好人陣營獲勝';
  if(edge&&living.some(wolfTeam))return '狼人陣營獲勝';
  return '';
 }
 function migrate(q){
  const previous=q.roleSystem?.schemaVersion;if(previous>VERSION)throw Error('此存檔來自較新的角色系統版本');
  q.roleSystem??={schemaVersion:VERSION,identities:{},deaths:{},events:[],information:{},nextEventId:1};const r=q.roleSystem;r.schemaVersion=VERSION;r.identities??={};r.deaths??={};r.events??=[];r.information??={};r.nextEventId??=1;
  for(const p of q.players){if(p.role!==UNKNOWN&&!r.identities[p.id])r.identities[p.id]=q.cupid?.thiefId===p.id?'盜賊':p.role;
   if(!p.alive&&!r.deaths[p.id]){const record=[...(q.logs||[])].reverse().find(l=>String(l.text).startsWith(p.id+' 號')&&String(l.text).includes('出局：'));const labels=record?record.text.split('出局：').slice(1).join('出局：'):'未知（舊存檔）';r.deaths[p.id]={round:record?Number(record.period.match(/\d+/)?.[0])||q.n:q.n,phase:record?.period.includes('夜')?'night':'day',factors:factors(labels),legacy:true};}
  }
  if(q.cupid?.thiefId)r.identities[q.cupid.thiefId]='盜賊';
  if(q.board==='cupid'&&q.cupid?.lovers?.length===2){const [a,b]=q.cupid.lovers,da=r.deaths[a],db=r.deaths[b];
   const directDraft=q.draft&&[q.draft.kill,q.draft.poison].includes(a)&&[q.draft.kill,q.draft.poison].includes(b);
   if(da&&db&&da.round===db.round&&(da.phase==='night'&&db.phase==='night'||directDraft)&&da.factors.some(f=>f.code!=='heartbreak')&&db.factors.some(f=>f.code!=='heartbreak')){
    for(const death of [da,db])if(!death.factors.some(f=>f.code==='heartbreak'))death.factors.push({code:'heartbreak',label:'殉情'});
   }
  }
  if(q.nightResult)q.nightResult=normalizeDeaths(q,q.nightResult);
  return q;
 }
 function event(q,type,data={}){migrate(q);const r=q.roleSystem;const entry={id:r.nextEventId++,...at(q),type,...clone(data)};r.events.push(entry);if(type==='information')(r.information[entry.recipient]??=[]).push(entry);if(r.events.length>2048)r.events.splice(0,r.events.length-2048);}
 return Object.freeze({VERSION,roleSkills,isWolf,causes,factors,isNightDeath,normalizeDeaths,gunEligibility,thirdMembers,independentKnife,state,victoryContext,winner,migrate,event});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=RoleSystem;
