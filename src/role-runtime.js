// Compatibility adapters: existing seven boards write their established fields;
// all consumers query one role schema and one death / victory policy.
const roleRuntimeBase={save,mutate,log,kill,outcomes,gunOK,winner,shoot,badge};
let roleRevision=0,roleViewCache=null,roleViewOwner=null;
function restoreRoleCheckpoint(snapshot,current=s){
 const out=clone(snapshot),cursor=out.roleSystem?.snapshotCursor;
 if(cursor===undefined)return out;
 out.roleSystem.events=clone((current.roleSystem?.events||[]).filter(e=>e.id<=cursor));
 out.roleSystem.information={};for(const [id,list] of Object.entries(current.roleSystem?.information||{}))out.roleSystem.information[id]=clone(list.filter(e=>e.id<=cursor));
 delete out.roleSystem.snapshotCursor;return out;
}
checkpoint=function(){
 ensureRoleSystem();const meta={...s.roleSystem,events:[],information:{},snapshotCursor:s.roleSystem.nextEventId-1};
 const x=clone({...s,history:undefined,roleSystem:meta});s.history.push(x);if(s.history.length>100)s.history.shift();
};
function ensureRoleSystem(){s.variant??='standard12';ensureMech();if(isStone())ensureStone();if(isWhiteKnight())ensureWhite();if(isBloodMoon())ensureBlood();if(isDream())ensureDream();if(isCupid())ensureCupid();if(s.phase==='election')ensureElection();RoleSystem.migrate(s);}
function pushRoleEvent(type,data){RoleSystem.event(s,type,data);}
function roleResources(q){return {heal:q.heal,poison:q.poison,trade:q.trade,revenge:q.revenge,guardLast:q.guardLast,mechanical:q.mech,white:q.white,blood:q.blood,dream:q.dream,cupid:q.cupid,idiotRevealed:q.players.filter(p=>p.idiotRevealed).map(p=>p.id),election:q.election};}
function recordRoleChanges(before){
 for(const p of s.players){const old=before.players.find(x=>x.id===p.id);if(!old)continue;
  if(old.role!==p.role){if(p.role==='未確認')delete s.roleSystem.identities[p.id];else if(!s.roleSystem.identities[p.id])s.roleSystem.identities[p.id]=p.role;pushRoleEvent(old.role==='未確認'?'identityConfirmed':'roleChanged',{player:p.id,from:old.role,to:p.role});}
 }
 if(s.cupid?.thiefId)s.roleSystem.identities[s.cupid.thiefId]='盜賊';
 const prev=roleResources(before),next=roleResources(s),changes={};for(const [key,value] of Object.entries(next)){if(JSON.stringify(prev[key])!==JSON.stringify(value))changes[key]=value;}if(Object.keys(changes).length)pushRoleEvent('roleStateChanged',{changes});
 if(before.phase!==s.phase||before.n!==s.n||before.step!==s.step)pushRoleEvent('phaseChanged',{from:{phase:before.phase,round:before.n,step:before.step},to:{phase:s.phase,round:s.n,step:s.step}});
 if(before.board==='cupid'&&before.phase==='night'&&before.n===1&&before.step===3&&s.step!==before.step){for(const recipient of s.cupid.lovers)pushRoleEvent('information',{recipient,kind:'loverSeat',result:s.cupid.lovers.find(id=>id!==recipient)});}
 const st=s.draft?.hunterBriefing;if(st&&JSON.stringify(st)!==JSON.stringify(before.draft?.hunterBriefing))pushRoleEvent('information',{recipient:st.id,kind:'gunStatus',result:{available:st.available,reason:st.reason}});
}
save=function(){ensureRoleSystem();roleRevision++;roleViewCache=null;roleRuntimeBase.save();};
mutate=function(fn){ensureRoleSystem();const before=clone(s);delete before.history;return roleRuntimeBase.mutate(()=>{delete s.victoryContext;fn();ensureRoleSystem();recordRoleChanges(before);});};
log=function(text){roleRuntimeBase.log(text);pushRoleEvent('log',{text});};
outcomes=function(){return RoleSystem.normalizeDeaths(s,roleRuntimeBase.outcomes());};
function currentDeathFactors(id,reason){const batch=s.cupid?.deathBatch||s.nightResult;return RoleSystem.causes([...RoleSystem.causes(reason),...(batch?.[id]||[])]);}
kill=function(id,reason){
 ensureRoleSystem();const p=player(id);if(!p?.alive)return;
 const labels=currentDeathFactors(id,reason),night=RoleSystem.isNightDeath(s,labels),first=s.pending.length;
 if(!s.victoryContext||night&&s.victoryContext.kind!=='night')s.victoryContext=RoleSystem.victoryContext(s,night?'night':'day');
 roleRuntimeBase.kill(id,labels.join('＋'));
 if(!p.alive){const death={round:s.n,phase:night?'night':'day',factors:RoleSystem.factors(labels)};s.roleSystem.deaths[p.id]=death;pushRoleEvent('death',{player:p.id,...death});
  const allowed=RoleSystem.gunEligibility(s,p.id,labels,night);if(!allowed.available){s.pending=s.pending.filter((h,i)=>i<first||h.id!==p.id||h.type==='whiteTake');}
 }
};
gunOK=function(id){return RoleSystem.gunEligibility(s,+id,outcomes()[id]||[],true).available;};
roleStatus=function(id){return RoleSystem.state(s,+id);};
inheritsIndependentKnife=function(){return ['mechanical','gargoyle'].includes(s.board)&&RoleSystem.independentKnife(s);};
inheritsKnife=function(){return isMech()&&RoleSystem.independentKnife(s);};
hunterWakeState=function(){
 const p=role('獵人');if(!p)return {id:0,available:false,reason:'本局獵人未在場',note:'保留固定口令與相同停頓。'};
 if(!p.alive)return {id:p.id,available:false,reason:'獵人已出局',note:'保留固定口令與相同停頓。'};
 const status=RoleSystem.gunEligibility(s,p.id,outcomes()[p.id]||[],true);
 const reason=status.available?'未中毒且無牽連死亡，技能可用':status.reason==='中毒'?'當夜中毒':status.reason==='殉情'?'當夜為殉情者':status.reason;
 return {id:p.id,available:status.available,reason,note:status.available?'明早符合出局條件時可開槍。':'明早因本夜出局時不能開槍。'};
};
winner=function(){if(s.winner)return s.winner;if(isBloodMoon()&&s.blood?.forcedWinner)return s.blood.forcedWinner;return RoleSystem.winner(s);};
checkWin=function(){
 if(s.winner)return;
 // Check the complete casualty batch before any optional death power or final-night expiry.
 let result=winner();
 if(!result&&isBloodMoon()&&s.blood?.finalResolution){finishBloodFinalNight();result=winner();}
 if(result){s.winner=result;s.pending=[];s.badge=false;s.afterBoom=false;log(result);s.phase='end';pushRoleEvent('victory',{winner:result,context:s.victoryContext||null});}
 delete s.victoryContext;
 if(isDream()&&!s.pending.length)s.dream.nightResolving=false;
};
function deepFreezeRoleView(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreezeRoleView);Object.freeze(value);}return value;}
function viewState(){return deepFreezeRoleView(clone({...s,history:undefined,roleSystem:undefined,canUndo:s.history.length>0}));}
function pruneLegacyDeathSkills(){
 for(const h of [...s.pending]){if(h.type==='whiteTake')continue;const death=s.roleSystem.deaths[h.id];if(death&&!RoleSystem.gunEligibility(s,h.id,death.factors.map(f=>f.label),death.phase==='night').available)s.pending=s.pending.filter(x=>x!==h);}
}
function reconcileVictoryOnLoad(){
 if(s.winner||s.phase!=='day'||(!s.pending.length&&!s.badge))return;
 const before=s.history[s.history.length-1];
 if(before?.phase==='dawn'&&before.n===s.n&&before.nightResult)s.victoryContext=RoleSystem.victoryContext(before,'night');
 else if(s.pending.length&&s.pending.every(h=>s.roleSystem.deaths[h.id]?.phase==='night'&&s.roleSystem.deaths[h.id]?.round===s.n)){
  const third=RoleSystem.thirdMembers(s);
  s.victoryContext={kind:'night',wolfTeamPresent:s.players.some(p=>RoleSystem.isWolf(p)&&!third.includes(p.id)&&(p.alive||s.roleSystem.deaths[p.id]?.phase==='night'&&s.roleSystem.deaths[p.id]?.round===s.n))};
 }
 checkWin();if(s.winner)save();
}
ensureRoleSystem();pruneLegacyDeathSkills();reconcileVictoryOnLoad();
// Stable boundary used by controllers; visual modules only receive frozen data.
const GameEngine=Object.freeze({
 configure:(board,variant)=>setBoardConfiguration(board,variant),
 read:viewState,
 role:id=>deepFreezeRoleView(clone(RoleSystem.state(s,id))),
 roles:()=>deepFreezeRoleView(clone(s.players.map(p=>RoleSystem.state(s,p.id)))),
 events:()=>deepFreezeRoleView(clone(s.roleSystem.events)),
 choose:(field,value,options={})=>commitDraftChoice(field,value,options),
 register:ids=>{const rs=currentReg();if(!rs||!Array.isArray(ids)||ids.length!==rs.length||ids.some(id=>!Number.isInteger(id)||!player(id)?.alive)||new Set(ids).size!==ids.length)return;const k=nightSteps()[s.step];if(isClassic())return classicRegister(k,ids);if(isCupid())return cupidRegister(k,ids);if(isDream())return dreamRegister(k,ids);if(isBloodMoon())return bloodRegister(k,ids);if(isWhiteKnight())return whiteRegister(k,ids);if(isStone())return stoneRegister(k,ids);if(isMech())return mRegister(k,ids);return registerRoles(ids);},
 advance:()=>nextNight(),settle:()=>settle(),back:()=>backNight(),undo:()=>undo(),
 recordInformation:(recipients,kind,target,result)=>mutate(()=>{for(const recipient of recipients)pushRoleEvent('information',{recipient,kind,target,result});}),
 clearFlowNotice:()=>{if(s.flowNotice){delete s.flowNotice;save();}},
 note:text=>{if(text.trim())mutate(()=>log('備註：'+text.trim()));},
 setPlayerName:(id,name)=>{if(s.phase!=='setup'||!player(id))return;player(id).name=String(name);save();},
 setRule:(field,value)=>{if(s.phase!=='setup'||!Object.hasOwn(s.rules,field))return;s.rules[field]=value;save();},
 forecast:()=>deepFreezeRoleView(clone(victoryForecast())),
 dismissForecast:()=>dismissVictoryForecast(),
 acceptForecast:()=>acceptVictoryForecast(),
 inspect:()=>({schemaVersion:RoleSystem.VERSION,revision:roleRevision})
});
