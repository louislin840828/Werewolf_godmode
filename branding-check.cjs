const assert=require('node:assert/strict'),fs=require('node:fs'),{createGameTest}=require('./test-support.cjs');
const {run}=createGameTest();const game=fs.readFileSync('src/game.js','utf8'),css=['game.css','mobile.css','graphic-play.css','interface-theme.css'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n');
assert(!game.includes('presentationHidden'));assert(!game.includes('if(hidden)'));assert(!css.includes('veil-screen'));assert(!fs.readFileSync('src/app.js','utf8').includes('hidden=false'));
assert(run('gameModel().title').includes('Aurawolf｜全知之人'));assert(run('exportText()').startsWith('Aurawolf｜全知之人'));
const icons=['scroll','gear','atlas'].map(n=>run(`icon('${n}')`));assert.equal(new Set(icons).size,3);for(const n of ['scroll','gear','atlas'])assert(run(`icon('${n}')`).includes(`data-icon="${n}"`));
assert(game.includes("node.getAttribute('data-icon')"));assert(!game.includes('月夜議會'));
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('<title>Aurawolf｜全知之人</title>'));assert(!html.includes('月夜議會'));assert(!html.includes('主持資訊已隱藏'));
for(const file of fs.readdirSync('src/assets/roles'))assert(fs.readFileSync('src/assets/roles/'+file).equals(fs.readFileSync('dist/assets/roles/'+file)));
console.log('PASS: Aurawolf brand/title/export, obsolete privacy mode removed, distinct keyed icons and canonical role assets copied unchanged. Browser QA separate.');
