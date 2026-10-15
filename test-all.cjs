// Build and test in an empty temporary workspace so stale dist files cannot pass tests.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {sourceModules}=require('./test-support.cjs');
const root=__dirname,tests=fs.readdirSync(root).filter(f=>/(?:^|-)check\.cjs$/.test(f)).sort();
assert(tests.length>0,'No tests discovered');
const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'moonlit-tests-'));let failures=0;
function execute(file){
 const result=spawnSync(process.execPath,[file],{cwd:workspace,encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024});
 if(result.error||result.status!==0){failures++;console.error(`FAIL ${file}\n${result.error||''}${result.stdout||''}${result.stderr||''}`);return false;}
 console.log(`PASS ${file}`);return true;
}
try{
 fs.cpSync(path.join(root,'src'),path.join(workspace,'src'),{recursive:true});
 for(const file of ['build.cjs','package.json','test-support.cjs',...tests])fs.copyFileSync(path.join(root,file),path.join(workspace,file));
 fs.cpSync(path.join(root,'scripts'),path.join(workspace,'scripts'),{recursive:true});
 if(execute('build.cjs')){
  const html=fs.readFileSync(path.join(workspace,'dist/index.html'),'utf8');
  const expected=sourceModules().map(f=>fs.readFileSync(path.join(root,'src',f),'utf8')).join('\n');
  assert(html.includes('<script>'+expected+'</script>'),'Built JS must match current source order/content');
  new vm.Script(expected,{filename:'built-game.js'});
  const assets=fs.readdirSync(path.join(root,'src/assets/roles'));
  for(const file of assets)assert(fs.readFileSync(path.join(root,'src/assets/roles',file)).equals(fs.readFileSync(path.join(workspace,'dist/assets/roles',file))),file+' changed during build');
  assert.deepEqual(fs.readdirSync(path.join(workspace,'dist')).sort(),['assets','index.html']);
  console.log(`PASS clean build: current bundled code and ${assets.length} unchanged role assets`);
  for(const file of tests)execute(file);
 }
 console.log(`${tests.length} test scripts; ${failures} failed. Node/VM checks only; mobile browser QA remains separate.`);
 if(failures)process.exitCode=1;
}catch(error){console.error(error);process.exitCode=1;}
finally{fs.rmSync(workspace,{recursive:true,force:true});}
