const assert=require('node:assert/strict'),fs=require('node:fs');
const {options,assetPath,handler}=require('./scripts/dev-server.cjs');
assert.deepEqual(options([]),{host:'127.0.0.1',port:4173,watch:true,check:false,help:false});
assert.equal(options(['--host','0.0.0.0','--port','8080']).port,8080);
for(const args of [['--port','0'],['--port','65536'],['--port','abc'],['--host'],['--unknown']])assert.throws(()=>options(args));
function request(url,method='GET'){
 const response={headers:{},setHeader(k,v){this.headers[k]=v},writeHead(s){this.status=s},end(body){this.body=body}};
 handler({url,method},response);return response;
}
const home=request('/');assert.equal(home.status,200);assert.equal(home.headers['Cache-Control'],'no-store');
assert(home.body.toString().includes(`name="application-version" content="${require('./package.json').version}"`));
const head=request('/','HEAD');assert.equal(head.status,200);assert.equal(head.body,undefined);
assert.equal(request('/','POST').status,405);
for(const url of ['/src/app.js','/package.json','/.env','/.git/config'])assert.equal(request(url).status,404);
assert.equal(assetPath('/%2e%2e%2fpackage.json').status,403);
assert.equal(assetPath('/%00').status,400);assert.equal(assetPath('/%zz').status,400);
const role=request('/assets/roles/villager.webp?test=1');assert.equal(role.status,200);assert.equal(role.headers['Content-Type'],'image/webp');
assert(role.body.equals(fs.readFileSync('src/assets/roles/villager.webp')));
console.log('PASS: local server options, homepage/version, GET/HEAD, source/secret isolation, traversal rejection, and full-quality role bytes; handler-only test, no listening server.');
