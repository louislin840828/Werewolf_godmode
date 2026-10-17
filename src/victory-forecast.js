// Bounded adversarial search. Uses the live rules on isolated, synchronous copies.
// No save/render, player information, resource or undo mutation escapes the sandbox.
const FORECAST_POLICY='one-cycle-v4';
let forecastCache={key:'',value:null};
function forecastKey(q=s){return JSON.stringify([FORECAST_POLICY,q.board,q.variant,q.phase,q.n,q.step,q.players,q.rules,q.sheriff,q.elected,q.voteDone,q.voteRound,q.pk,q.votes,q.pending,q.badge,q.heal,q.poison,q.trade,q.revenge,q.guardLast,q.mech,q.stone,q.white,q.blood,q.dream,q.cupid,q.draft,q.winner,q.roleSystem?.deaths]);}
function forecastSandbox(q,fn){
 const live=s,liveMutate=mutate;try{s=clone(q);s.history=[];s.logs=[];if(s.roleSystem){s.roleSystem.events=[];s.roleSystem.information={};}mutate=fn=>fn();return fn();}finally{s=live;mutate=liveMutate;}
}
function calculateVictoryForecast(q,{maxNodes=10000,maxMs=180}={}){
 const unknown=reason=>({status:'unknown',reason}),WIN='狼人陣營獲勝';
 const currentNight=q.phase==='night';
 if(!['day','night'].includes(q.phase)||q.winner||q.pending.length||q.badge||!q.elected)return unknown('等待死訊、出局技能及警徽處理完畢');
 if(currentNight&&!['kill','stoneKill','revenge'].some(k=>q.draft?.[k]&&q.players.some(p=>p.id===+q.draft[k]&&p.alive)))return unknown('等待狼刀目標確認');
 if(q.players.some(p=>p.alive&&p.role==='未確認'))return unknown('尚有未確認身分');
 if(!currentNight&&!q.voteDone&&(q.voteRound!==1||q.pk.length||Object.keys(q.votes).length))return unknown('投票已進行，待本輪結算');
 if(['white','blood','dream','cupid'].some(k=>q[k]?.action))return unknown('白天技能尚未處理完畢');
 // Hidden allies and competing lovers cannot be assumed to coordinate as one pack.
 if(RoleSystem.thirdMembers(q).length)return unknown('人狼戀涉及獨立勝利目標，本版保留由上帝判斷');
 if(q.players.some(p=>p.alive&&['機械狼','石像鬼'].includes(p.role))&&q.players.some(p=>p.alive&&p.role==='狼人'))return unknown('獨立狼與小狼尚未互認，不假設合作');
 if(q.players.filter(p=>p.alive).length>6)return unknown('超過本版六人殘局推算範圍');
 let nodes=0;const started=Date.now(),stop={};
 const tick=()=>{if(++nodes>maxNodes||Date.now()-started>maxMs)throw stop;};
 const memo=new Map();let nightWitness=null,voteWitness=null;
 const all=(items,fn)=>{for(const x of items){tick();if(!fn(x))return false;}return true;};
 const any=(items,fn)=>{for(const x of items){tick();if(fn(x))return true;}return false;};
 const isTeam=(state,id)=>RoleSystem.isWolf(state.players.find(p=>p.id===id));
 function powers(state,after){
  tick();if(state.winner)return state.winner===WIN;
  if(!state.pending.length){
   if(state.badge){const heirs=[0,...state.players.filter(p=>p.alive).map(p=>p.id)];return (isTeam(state,state.sheriff)?any:all)(heirs,id=>after({...state,badge:false,sheriff:id}));}
   return after(state);
  }
  const h=state.pending[0],targets=[0,...state.players.filter(p=>p.alive).map(p=>p.id)];
  return (isTeam(state,h.id)?any:all)(targets,id=>forecastSandbox(state,()=>{s.afterBoom=false;if(h.type==='whiteTake')resolveWhiteTake(id);else shoot(id);return powers(clone(s),after);}));
 }
 const informative=new Set(['check','spiritCheck','mechCheck','stoneCheck','luckyCheck','graveResult','stoneResult','learnResult']);
 const supported=new Set(['kill','stoneKill','revenge','extra','learn','mechPoison','mechShield','fear','dream','guard','save','healTarget','poison','hunt','trade','luckyPoison']);
 function choices(actions,draft,locks={}){
  const fields=[...new Set(actions.filter(a=>!a.readonly).map(a=>a.field))];let list=[clone(draft)];
  for(const field of fields){
   const aa=actions.filter(a=>a.field===field&&!a.readonly);
   if(informative.has(field)){for(const d of list)if(aa[0].targets.length)d[field]=aa[0].targets[0];continue;}
   if(!supported.has(field))throw stop;
   let options=aa.flatMap(a=>a.targets.filter(id=>locks[field]===undefined||+locks[field]===id).map(id=>({id,gift:a.gift})));
   if(aa.every(a=>a.optional)&&locks[field]===undefined)options.unshift({id:0});
   list=list.flatMap(d=>options.map(o=>{
    tick();const next={...d,[field]:field==='save'?!!o.id:o.id};
    if(o.gift)next.gift=o.gift;if(field==='extra')next.double=!!o.id;
    if(field==='stoneKill')next.kill=o.id;
    return next;
   })).filter(d=>!(d.poison&&(d.save||d.healTarget))&&!(d.extra&&!d.kill));
  }
  return list;
 }
 function night(state){
  tick();const key=forecastKey(state);if(memo.has(key))return memo.get(key);
  const committed=state.phase==='night';
  const locked=committed?Object.fromEntries(['kill','stoneKill','revenge','extra'].filter(k=>state.draft?.[k]).map(k=>[k,+state.draft[k]])):{};
  const initial=forecastSandbox(state,()=>{s.badge=false;s.afterBoom=false;if(!committed)newNight();delete s.victoryContext;return clone(s);});
  // First commit a complete wolf plan, then test every good response against it.
  // In particular, a wolf never changes its knife after seeing a guard/dream choice.
  function plan(q,step){
   return forecastSandbox(q,()=>{
    tick();s.step=step;const order=nightSteps();
    if(order[step]==='review'){const draft=clone(s.draft),ok=defend({...initial,draft},committed?initial.step:0);if(ok)nightWitness=draft;return ok;}
    const model=roleNightModel(),actors=actorIds();
    const owned=actors.length&&actors.every(id=>isTeam(s,id));
    if(!owned)return plan(clone(s),step+1);
    const base=clone(s);
    // No public role-claim model exists. An uncommitted knife must win for every
    // non-wolf target, rather than picking a hidden villager using host knowledge.
    const knifeFields=new Set(model.actions.filter(a=>['kill','stoneKill','revenge','extra'].includes(a.field)).map(a=>a.field));
    const drafts=choices(model.actions,s.draft,locked);
    if(!knifeFields.size)return any(drafts,d=>plan({...base,draft:d},step+1));
    const groups=new Map();
    for(const d of drafts){
     if([...knifeFields].some(f=>!d[f]||isTeam(base,d[f])))continue;
     const key=JSON.stringify(Object.entries(d).filter(([f])=>!knifeFields.has(f)&&!(knifeFields.has('stoneKill')&&f==='kill')&&!(knifeFields.has('extra')&&f==='double')));
     if(!groups.has(key))groups.set(key,[]);groups.get(key).push(d);
    }
    return any([...groups.values()],ds=>all(ds,d=>plan({...base,draft:d},step+1)));
   });
  }
  function defend(q,step){
   return forecastSandbox(q,()=>{
    tick();s.step=step;const order=nightSteps();
    if(order[step]==='review'){
     // Production review commits resources and dream links; production settlement
     // applies all deaths and the same victory checkpoints used by the real game.
     nextNight();if(s.phase!=='dawn')throw stop;settle();
     return powers(clone(s),()=>false);
    }
    const model=roleNightModel(),actors=actorIds();
    if(actors.length&&actors.every(id=>isTeam(s,id)))return defend(clone(s),step+1);
    const base=clone(s);return all(choices(model.actions,s.draft,locked),d=>defend({...base,draft:d},step+1));
   });
  }
  // Confirmed wolf choices remain fixed. Good defenses are enumerated even if
  // already entered: a hidden missed guard/dream must not become host-only proof.
  // Future wolf actions are universal too; no helpful future choice is assumed.
  const result=plan(initial,committed?initial.step:0);memo.set(key,result);return result;
 }
 function afterExile(state,id){
  return forecastSandbox(state,()=>{delete s.victoryContext;if(id)kill(id,'放逐');s.voteDone=true;checkWin();return powers(clone(s),night);});
 }
 function vote(state,targets,round){
  // Coalition ballots are one legal strategy. Opposing ballots include abstention
  // and split votes. PK candidates lose their vote exactly as in countVotes().
  const voters=state.players.filter(p=>p.alive&&!(state.board==='classic'&&p.idiotRevealed)&&(round===1||!targets.includes(p.id)));
  const pack=voters.filter(RoleSystem.isWolf),others=voters.filter(p=>!RoleSystem.isWolf(p));
  const options=[0,...targets];
  return any(options,packTarget=>{
   const tally={};if(packTarget)tally[packTarget]=pack.reduce((n,p)=>n+(p.id===state.sheriff?1.5:1),0);
   function oppose(i){
    tick();if(i<others.length){const p=others[i],weight=p.id===state.sheriff?1.5:1;return all(options,t=>{if(t)tally[t]=(tally[t]||0)+weight;const ok=oppose(i+1);if(t)tally[t]-=weight;return ok;});}
    const max=Math.max(0,...Object.values(tally)),top=targets.filter(id=>max>0&&tally[id]===max);
    if(top.length===1)return afterExile(state,top[0]);
    if(top.length>1&&round===1)return vote(state,top,2);
    return afterExile(state,0);
   }
   const ok=oppose(0);if(ok&&round===1)voteWitness=packTarget;return ok;
  });
 }
 function day(state,allowDuel=true){
  tick();if(state.winner)return state.winner===WIN;
  if(state.voteDone)return night(state);
  const knight=state.players.find(p=>p.alive&&p.role==='騎士');
  if(allowDuel&&knight&&!state.white?.duelUsed&&!state.white?.voting){
   const targets=state.players.filter(p=>p.alive&&p.id!==knight.id);
   if(!all(targets,target=>forecastSandbox(state,()=>{
    s.white.duelUsed=true;delete s.victoryContext;kill(RoleSystem.isWolf(target)?target.id:knight.id,RoleSystem.isWolf(target)?'騎士決鬥':'決鬥失敗');checkWin();
    if(RoleSystem.isWolf(target))s.voteDone=true;
    return powers(clone(s),q=>day(q,false));
   })))return false;
  }
  return vote(state,state.players.filter(p=>p.alive).map(p=>p.id),1);
 }
 try{
  const proved=currentNight?night(clone(q)):day(clone(q));
  return proved?{status:'proven',winner:WIN,nodes,horizon:currentNight?'currentNight':'nextNight',reasons:[currentNight?'推算範圍：本夜狼刀已確認，只推算本夜剩餘行動與完整死亡批次。':q.voteDone?'推算範圍：今日投票已結束，只推算接下來的一夜。':`推算範圍：從今日投票到下一夜結算，包含平票後的第二輪投票。${q.sheriff?'警長為 '+q.sheriff+' 號，其投票按 1.5 票計算。':'目前沒有警徽。'}`,currentNight?`已確認狼刀：${q.draft.kill||q.draft.stoneKill||q.draft.revenge} 號；不假設狼人事先知道目標身分，也不更改刀口。`:q.voteDone?`狼方策略摘要：${[['恐懼',nightWitness?.fear],['狼刀',nightWitness?.kill],['第二刀',nightWitness?.extra],['復仇刀',nightWitness?.revenge],['機械毒',nightWitness?.mechPoison]].filter(x=>x[1]).map(([label,id])=>label+'選 '+id+' 號').join('、')||'配合現有技能完成夜間結算'}。`:`狼方策略摘要：首輪狼隊一致${voteWitness?'投給 '+voteWitness+' 號':'棄票'}，後續依公開的投票結果選擇行動。`,currentNight?'為何可判必勝：固定已確認刀口，並已檢查本夜其餘合法行動及出局後技能；不因主持人知悉隱藏身分而挑選目標。':q.voteDone?'為何可判必勝：已考慮好人下一夜可用的技能與出局後可發動的技能；狼方不能偷看尚未公開的夜間選擇，再更改行動。':'為何可判必勝：已考慮好人的合法投票與現有可用技能；狼方不能偷看尚未公開的夜間選擇，再更改行動。',currentNight?'推算結論：已確認刀口在所有剩餘合法行動下均達成狼人勝利；有效防禦與自動牽連先結算，夜間屠邊優先，未分勝負才處理槍／帶人。':'推算結論：狼方有一套能讓好人無法阻止的策略，最遲於下一夜結算時獲勝；不代表狼方隨意操作都會贏。']}:{status:'unproven',reason:'存在續命／反制分支，或本輪未找到可證明必勝的策略',nodes};
 }catch(error){if(error!==stop)throw error;return unknown('本次推算超過範圍或計算上限，繼續正常遊戲');}
}
function victoryForecast(){
 const key=forecastKey();if(forecastCache.key!==key){forecastCache={key,value:calculateVictoryForecast(s)};}
 return {...forecastCache.value,key,dismissed:s.forecastDismissed===key};
}
function dismissVictoryForecast(){const f=victoryForecast();if(f.status!=='proven')return;mutate(()=>{s.forecastDismissed=f.key;log('上帝略過綁票必勝提示，繼續對局');});}
function acceptVictoryForecast(){const f=victoryForecast();if(f.status!=='proven'||!['day','night'].includes(s.phase)||s.winner)return;mutate(()=>{s.winner=f.winner;s.phase='end';s.pending=[];s.badge=false;log('上帝依綁票預測宣告：'+f.winner);pushRoleEvent('forecastVictory',{winner:f.winner,policy:FORECAST_POLICY,reasons:f.reasons});});}
