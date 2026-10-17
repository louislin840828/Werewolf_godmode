const BOARD_TEMPLATES={
 classic:{label:'預女獵白／四小狼',title:'預女獵白',subtitle:'四小狼',symbol:'person',roles:['狼人','狼人','狼人','狼人','預言家','女巫','獵人','白痴','平民','平民','平民','平民']},
 brothers:{label:'狼兄狼弟／黑市商人',title:'狼兄狼弟',subtitle:'黑市商人',symbol:'claw',roles:ROLES},
 mechanical:{label:'機械狼／通靈師',title:'機械狼',subtitle:'通靈師',symbol:'gear',roles:['機械狼','狼人','狼人','狼人','通靈師','女巫','獵人','守衛','平民','平民','平民','平民']},
 cupid:{label:'盜賊／丘比特',title:'盜賊',subtitle:'丘比特',symbol:'crown',roles:['預言家','女巫','獵人','白痴','平民','平民','平民','平民','平民','狼王','狼人','狼人','盜賊','丘比特']},
 dream:{label:'夢魘／攝夢人',title:'夢魘',subtitle:'攝夢人',symbol:'moon',roles:['夢魘','狼人','狼人','狼人','預言家','女巫','獵人','攝夢人','平民','平民','平民','平民']},
 bloodmoon:{label:'血月使者／獵魔人',title:'血月使者',subtitle:'獵魔人',symbol:'moon',roles:['血月使者','狼人','狼人','狼人','預言家','女巫','守衛','獵魔人','平民','平民','平民','平民']},
 whiteknight:{label:'白狼王／騎士',title:'白狼王',subtitle:'騎士',symbol:'shield',roles:['白狼王','狼人','狼人','狼人','預言家','女巫','守衛','騎士','平民','平民','平民','平民']},
 gargoyle:{label:'石像鬼／守墓人',title:'石像鬼',subtitle:'守墓人',symbol:'eye',roles:['石像鬼','狼人','狼人','狼人','預言家','女巫','獵人','守墓人','平民','平民','平民','平民']}
};
const BROTHERS_TEN={id:'wolfking10',label:'10 人狼王版',playerCount:10,roles:['狼兄','狼弟','狼王','預言家','女巫','獵人','黑市商人','平民','平民','平民']};
function boardConfiguration(board=s.board,variant=s.variant){const t=BOARD_TEMPLATES[board]||BOARD_TEMPLATES.brothers;return board==='brothers'&&variant==='wolfking10'?BROTHERS_TEN:{id:'standard12',label:'12 人標準版',playerCount:12,roles:t.roles};}
const isBrothersTen=()=>s.board==='brothers'&&s.variant==='wolfking10';
const boardDefinition=()=>({... (BOARD_TEMPLATES[s.board]||BOARD_TEMPLATES.brothers),roles:boardConfiguration().roles});
const boardLabel=()=>boardDefinition().label+(isBrothersTen()?' · 10 人狼王版':'');
function brotherReg(k){return isBrothersTen()&&k==='wolves'?['狼王']:REG[k];}
function setBoardConfiguration(board,variant='standard12',after){
 if(s.phase!=='setup'||!Object.hasOwn(BOARD_TEMPLATES,board)||!['standard12','wolfking10'].includes(variant)||variant==='wolfking10'&&board!=='brothers')return false;
 const count=boardConfiguration(board,variant).playerCount;
 const apply=()=>{mutate(()=>{s.board=board;s.variant=variant;s.players=Array.from({length:count},(_,i)=>({id:i+1,name:s.players[i]?.name||'',role:'未確認',alive:true}));ensureMech();});after?.();return true;};
 if(s.players.slice(count).some(p=>p.name))return requestHostConfirmation('縮編會移除多出的座位暱稱，確定切換？',apply,()=>render());
 return apply();
}
const isStone=()=>s.board==='gargoyle';
function roleStatus(id){const p=player(id);if(!p)return null;return {id:p.id,originalRole:p.role,alignment:wolf(p)?'狼人':'好人',alive:p.alive};}
function ordinaryWolvesGone(){return s.players.filter(p=>p.role==='狼人').length===3&&!alive().some(p=>p.role==='狼人');}
function inheritsIndependentKnife(){return ['mechanical','gargoyle'].includes(s.board)&&ordinaryWolvesGone();}

const isWhiteKnight=()=>s.board==='whiteknight';

const isBloodMoon=()=>s.board==='bloodmoon';

const isDream=()=>s.board==='dream';

const isCupid=()=>s.board==='cupid';
const isClassic=()=>s.board==='classic';

// Shared night briefing, computed from the same effective outcomes as settlement.
function hunterWakeState(){const p=role('獵人');if(!p)return {id:0,available:false,reason:'本局獵人未在場',note:'保留固定口令與相同停頓。'};if(!p.alive)return {id:p.id,available:false,reason:'獵人已出局',note:'保留固定口令與相同停頓。'};const causes=outcomes()[p.id]||[];let reason='未中毒，技能可用';if(isDream()&&dreamFeared(p.id))reason='當夜被恐懼';else if(causes.some(c=>c.includes('毒')))reason='當夜中毒';else if(causes.includes('殉情'))reason='當夜為殉情者';const available=gunOK(p.id);return {id:p.id,available,reason,note:available?'明早符合出局條件時可開槍。':'明早因本夜出局時不能開槍。'};}
function recordHunterBriefing(){if(s.phase!=='night'||nightSteps()[s.step]!=='hunter'||!role('獵人')?.alive)return;const st=hunterWakeState();s.draft.hunterBriefing={night:s.n,id:st.id,available:st.available,reason:st.reason};log(`已告知獵人 ${who(st.id)}：明早${st.available?'可以':'不可以'}開槍（${st.reason}）`);}

// Human-readable rules shared by the diary and text export.
function rulesText(r=s.rules,board=s.board,variant=s.variant){
 const parts=['女巫自救：'+({no:'全程不可自救',first:'僅首夜可自救',yes:'全程可自救'}[r.self]||'全程不可自救'), '警徽：'+(r.double===false?'單爆吞警徽':'雙爆吞警徽')];
 if(board==='brothers'&&variant==='wolfking10')parts.push('普通狼王：非中毒、非自爆死亡且勝負未定時可開一槍；不設夜間報槍環節');
 if(board==='classic')parts.push('白痴：首次放逐翻牌仍存活、無投票權，仍計入神邊；刀毒槍正常致死');
 if(board==='brothers')parts.push('狼兄自刀：'+(r.broSelf?'允許':'禁止'),'狼弟復仇刀：'+(r.revengeSave?'可被女巫解藥救回':'不可被女巫解藥救回'));
 if(['mechanical','whiteknight','bloodmoon'].includes(board))parts.push('守衛與女巫同守同救：'+(r.guardSaveDies===false?'刀口存活':'刀口死亡'));
 if(board==='mechanical')parts.push('未學習機械狼的查驗結果：'+(r.rawMech||'機械狼'),'機械守護：'+(r.shieldOnce===false?'每晚可用，不可連守':'整場僅一次'),'雙刀同目標：'+(r.doubleShieldPierce===false?'不穿透機械守護':'穿透機械守護'),'機械狼自爆：'+(r.mechBoom?'允許':'禁止'));
 return parts.join('；');
}
function logText(entry){
 const text=String(entry.text??'');
 const match=text.match(/^規則[：:]\s*(\{[\s\S]*\})\s*$/);
 if(!match)return text;
 try{const r=JSON.parse(match[1]);if(r&&typeof r==='object'&&!Array.isArray(r))return '規則：'+rulesText(r);}catch(e){}
 return '規則：舊紀錄格式不完整，請參照本局上帝手冊。';
}
function exportText(){return ['Aurawolf｜全知之人 · 狼人殺復盤','模板：'+boardLabel(),...s.players.map(p=>`${who(p.id)}：${p.role}`),'規則：'+rulesText(),'',...s.logs.map(l=>`[${l.period} ${l.at}] ${logText(l)}`)].join('\n');}
