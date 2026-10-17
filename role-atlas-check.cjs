const assert=require('node:assert/strict'),fs=require('node:fs'),{createGameTest}=require('./test-support.cjs');
const t=createGameTest(),{run,obj,nodes}=t;
assert.deepEqual(obj('Object.keys(ROLE_ATLAS)'),obj('Object.keys(ROLE_ART)'));
for(const [role,text] of Object.entries(obj('ROLE_ATLAS'))){assert(text.length>20,role);assert(!text.includes('undefined'));}
run('const beforeAtlas=clone(s);const beforeChoice=JSON.stringify(g);openRoleAtlas()');assert.equal(run('gDrawer'),'atlas');assert.equal(run('atlasRole'),'');assert.deepEqual(obj('s'),obj('beforeAtlas'));assert.equal(run('JSON.stringify(g)'),run('beforeChoice'));
const cards=run('atlasMarkup()');assert.equal((cards.match(/class="atlas-card"/g)||[]).length,24);assert(!cards.includes('data-seat'));assert(!cards.includes('篩選'));
nodes['atlas-role-title']={focus(){}};run("openAtlasRole('白痴')");assert.equal(run('atlasRole'),'白痴');const detail=run('atlasMarkup()');assert(detail.includes('atlas-art'));assert(detail.includes('仍存活'));assert(detail.includes('丘比特板'));run('returnToAtlas()');assert.equal(run('atlasRole'),'');assert.deepEqual(obj('s'),obj('beforeAtlas'));
run("openAtlasRole('無效角色')");assert.equal(run('atlasRole'),'');run("openAtlasRole('狼王');closeHostDrawer()");assert.equal(run('gDrawer'),'');assert.deepEqual(obj('s'),obj('beforeAtlas'));
const code=fs.readFileSync('src/game.js','utf8');assert(code.includes('onclick="openRoleAtlas()" aria-label="開啟角色圖鑑"'));assert(!code.includes('aria-label="隱藏身分"'));
assert(run("ROLE_ATLAS['血月使者']").includes('普通放逐本身不封印'));assert(run("ROLE_ATLAS['機械狼']").includes('下一夜繼承'));assert(run("ROLE_ATLAS['狼王']").includes('自爆不能開槍'));
console.log('PASS: all 24 roles/art, collection/detail/back, no filters or player identities, no state/selection writes, role-specific house-rule summaries and named atlas entry. Browser QA separate.');
