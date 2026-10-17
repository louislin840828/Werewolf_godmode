// Dependency-free local development server. Only dist/ is exposed over HTTP.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),output=path.join(root,'dist');
function options(args){
 const out={host:'127.0.0.1',port:4173,watch:true,check:false,help:false};
 for(let i=0;i<args.length;i++){
  const arg=args[i];
  if(arg==='--host'){out.host=args[++i];if(!out.host||!/^[-\w.:]+$/.test(out.host))throw Error('Invalid --host');}
  else if(arg==='--port'){const value=args[++i];if(!/^\d+$/.test(value||'')||+value<1||+value>65535)throw Error('Invalid --port');out.port=+value;}
  else if(arg==='--no-watch')out.watch=false;
  else if(arg==='--check')out.check=true;
  else if(arg==='--help')out.help=true;
  else throw Error('Unknown option: '+arg);
 }
 return out;
}
function assetPath(url){
 let pathname;try{pathname=decodeURIComponent(new URL(url,'http://localhost').pathname)}catch{return {status:400}}
 if(pathname.includes('\0')||pathname.includes('\\'))return {status:400};
 const file=path.resolve(output,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(output+path.sep))return {status:403};
 try{const real=fs.realpathSync(file);if(!real.startsWith(output+path.sep))return {status:403};if(!fs.statSync(real).isFile())return {status:404};return {status:200,file:real}}catch{return {status:404}}
}
const mime={'.html':'text/html; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.writeHead(405);res.end();return}
 const asset=assetPath(req.url);
 if(asset.status!==200){res.writeHead(asset.status);res.end();return}
 try{const data=fs.readFileSync(asset.file);res.setHeader('Content-Type',mime[path.extname(asset.file)]||'application/octet-stream');res.setHeader('Content-Length',data.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(500);res.end()}
}
function build(){const result=spawnSync(process.execPath,[path.join(root,'build.cjs')],{cwd:root,stdio:'inherit'});if(result.status!==0)throw Error('Build failed');}
function fingerprint(){
 const files=['package.json','build.cjs'];
 function walk(dir){for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else files.push(file)}}
 walk('src');return files.map(file=>{const stat=fs.statSync(path.join(root,file));return `${file}:${stat.mtimeMs}:${stat.size}`}).join('|');
}
function main(){
 const config=options(process.argv.slice(2));
 if(config.help){console.log('node scripts/dev-server.cjs [--host 127.0.0.1] [--port 4173] [--no-watch] [--check]\n--check builds and validates index.html without opening a listening port.');return}
 build();if(config.check){if(assetPath('/').status!==200)throw Error('Missing built homepage');console.log('Local server build/path check passed; no server started.');return}
 let healthy=true,stamp=fingerprint();const server=http.createServer((req,res)=>{if(!healthy){res.writeHead(503);res.end('Build failed; fix the source and save again.');return}handler(req,res)});
 const timer=config.watch?setInterval(()=>{try{const next=fingerprint();if(next===stamp)return;stamp=next;build();healthy=true;console.log('Rebuilt. Refresh the browser to see changes.')}catch(error){healthy=false;console.error(error.message)}},1000):null;
 server.on('error',error=>{if(timer)clearInterval(timer);console.error(error.message);process.exitCode=1});
 server.listen(config.port,config.host,()=>console.log(`Moonlit ${require('../package.json').version}: http://${config.host}:${config.port}\n${config.watch?'Watching source; refresh after rebuild.':'Preview mode; restart after changes.'}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(timer)clearInterval(timer);server.close()});
}
if(require.main===module){try{main()}catch(error){console.error(error.message);process.exitCode=1}}
module.exports={options,assetPath,handler};
