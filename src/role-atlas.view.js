// Static reference only: no player identities, resources, or engine writes.
const ROLE_ATLAS=Object.freeze({
 '狼兄':'與普通狼人共同睜眼、共同刀人；不可自爆。狼兄出局後，狼弟會在下一夜獲得復仇刀。',
 '狼弟':'首夜與狼兄互認。狼兄出局後，下一夜獨立使用必須指定目標的復仇刀，再下一夜加入共同狼刀。',
 '狼人':'夜間與所屬狼隊共同選擇刀人目標；符合本板資格與階段時可在白天自爆。',
 '預言家':'每晚查驗一名其他存活玩家，獲得其陣營資訊，而非具體角色。',
 '女巫':'整場各有一瓶解藥與毒藥，每晚最多使用一瓶。自救依開局設定；解藥耗盡後不再得知刀口。',
 '獵人':'符合死亡條件且勝負未定時可開槍。中毒、殉情、連續攝夢或攝夢人死亡牽連等情況不能開槍；每夜由上帝告知槍狀態。',
 '黑市商人':'整場可交易一次，贈予查驗、毒藥或獵槍；交易狼人會失敗並使商人出局。成功當晚只通知，技能依既定時機生效。',
 '平民':'沒有額外主動技能，透過討論與投票尋找狼人。獲贈技能不改變原本的民邊。',
 '機械狼':'整場可學習一名其他玩家，取得其具體身分及對應能力；獵槍當夜生效，其他主動技能次夜起生效。三名普通狼全出局後，下一夜繼承狼刀。',
 '守衛':'每晚可守護一名玩家，可自守、不可連續守同一人。普通守護擋狼刀、不擋毒；同守同救依開局設定。',
 '通靈師':'每晚查驗一名其他存活玩家的具體角色；機械狼的回報依其學習狀態與本局設定。',
 '幸運兒':'黑市交易成功後獲得一次查驗、毒藥或獵槍。查驗／毒隔夜可用，槍隔日生效；獲贈當夜死亡不能直接使用幸運槍。',
 '石像鬼':'獨立查驗其他玩家的具體角色，不與小狼互認、不可自爆或自刀。三小狼全出局後，下一夜在固定狼刀環節繼承狼刀。',
 '守墓人':'夜間取得前一天被放逐玩家的陣營。若前一天沒有放逐，便沒有本次查驗結果；其他死因不算放逐。',
 '白狼王':'與狼隊互認並共同刀人。自爆、放逐或獵人槍殺後，勝負未定時可帶走一名存活玩家；毒殺、騎士決鬥不能帶人。',
 '騎士':'整場可在投票前決鬥一次。目標是狼則狼出局並結束白天；目標是好人則騎士出局，白天繼續。',
 '血月使者':'白天自爆會結束白天並封印下一夜好人技能。作為最後一狼被放逐時，延後死亡並進入最後黑夜；普通放逐本身不封印技能。',
 '獵魔人':'首夜認牌，第二夜起可狩獵；獵到狼使目標出局，獵到好人則自己反噬出局。免疫女巫毒，狩獵不被守護或解藥阻擋。',
 '夢魘':'每夜可獨立恐懼一名玩家，不可連續恐懼同一人，使其當夜能力受限；恐到普通狼人則當夜無狼刀。之後與狼隊共同睜眼。',
 '攝夢人':'每夜可指定夢遊者，保護其當夜免受一般致死行動；連續兩夜指定同一人會使其死亡。攝夢人夜死會牽連當夜夢遊者，被恐懼時無有效攝夢。',
 '盜賊':'首夜從兩張備選牌選一張，立即成為該角色，另一張埋掉。有狼人牌必須選狼，不能放棄。',
 '丘比特':'首夜連結兩位不同玩家為戀人，可包含自己。一人死亡，另一人立即殉情；人狼戀形成丘比特與戀人的第三方陣營。',
 '狼王':'符合條件出局且勝負未定時可開一槍；中毒、自爆不能開槍，殉情也禁止死亡槍。不同於白狼王的帶人能力。',
 '白痴':'首次被放逐可翻牌並保留發言、失去投票權。經典板翻牌後仍存活；丘比特板翻牌算死亡，會觸發戀人殉情。'
});
let atlasRole='',atlasScroll=0,atlasReturnRole='';
function atlasMarkup(){
 if(atlasRole)return `<button class="atlas-back" onclick="returnToAtlas()">← 返回圖鑑</button><article class="atlas-detail"><div class="atlas-art">${portrait(atlasRole)}</div><span class="atlas-label">角色圖鑑</span><h3 tabindex="-1" id="atlas-role-title">${esc(atlasRole)}</h3><p>${esc(ROLE_ATLAS[atlasRole])}</p><small>技能概覽；實際資格與結算依本板家規及開局設定。本圖鑑不顯示本局玩家身分。</small></article>`;
 return `<p class="drawer-sub">24 位角色 · 點選卡片查看大圖與技能</p><div class="atlas-grid">${Object.keys(ROLE_ATLAS).map((role,i)=>`<button class="atlas-card" data-atlas-role="${esc(role)}" onclick="openAtlasRole('${role}')" aria-label="查看${role}圖鑑"><span class="atlas-number">${String(i+1).padStart(2,'0')}</span>${portrait(role)}<strong>${esc(role)}</strong></button>`).join('')}</div>`;
}
function openRoleAtlas(){atlasRole='';atlasScroll=0;openHostDrawer('atlas');Object.keys(ROLE_ATLAS).forEach(r=>warmPortrait(r,1));}
function openAtlasRole(role){if(gDrawer!=='atlas'||!Object.hasOwn(ROLE_ATLAS,role))return;atlasScroll=document.querySelector('.drawer-body')?.scrollTop||0;atlasReturnRole=role;atlasRole=role;drawerNavigation='forward';render();const body=document.querySelector('.drawer-body');if(body)body.scrollTop=0;document.getElementById('atlas-role-title')?.focus({preventScroll:true});}
function returnToAtlas(){if(gDrawer!=='atlas')return;atlasRole='';drawerNavigation='back';render();const body=document.querySelector('.drawer-body');if(body)body.scrollTop=atlasScroll;[...document.querySelectorAll('.atlas-card')].find(el=>el.dataset.atlasRole===atlasReturnRole)?.focus({preventScroll:true});}
