const fs=require('fs');
process.chdir(__dirname);
const release=require('./package.json');
const sources=['app.js','app.view.js','boards.js','mechanical.js','mechanical.view.js','gargoyle.js','gargoyle.view.js','whiteknight.js','whiteknight.view.js','bloodmoon.js','bloodmoon.view.js','dream.js','dream.view.js','cupid.js','cupid.view.js','election.js','election.view.js','rules/role-state.js','role-runtime.js','game-controller.js','victory-forecast.js','role-images.js','village-render.js','game.js'];
const css=fs.readFileSync('src/game.css','utf8')+'\n'+fs.readFileSync('src/mobile.css','utf8'),js=sources.map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n');
// dist is generated output: never carry old prototype files into a new release.
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/assets/roles',{recursive:true});
fs.cpSync('src/assets/roles','dist/assets/roles',{recursive:true,force:true});
fs.writeFileSync('dist/index.html',`<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#132b32"><meta name="application-version" content="${release.version}"><meta name="description" content="月夜議會：12 人警長狼人殺的沉浸式上帝席，支援狼兄狼弟、機械狼、石像鬼、白狼王騎士、血月獵魔人、夢魘攝夢人與盜賊丘比特。"><title>月夜議會｜上帝席</title><style>${css}</style></head><body><div id="app"></div><script>${js}</script></body></html>`);
console.log('Built self-contained Site: '+sources.length+' source modules; '+fs.statSync('dist/index.html').size+' bytes.');
