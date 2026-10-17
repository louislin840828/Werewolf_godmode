// Conservative lexical inventory, NOT an AST reachability proof or deletion tool.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(path.join(root,'src')).filter(f=>f.endsWith('.js'));
const tests=fs.readdirSync(root).filter(f=>/^(check|.*-check)\.cjs$/.test(f));
const source=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const testText=tests.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const count=(text,name)=>(text.match(new RegExp('\\b'+name+'\\b','g'))||[]).length;
const candidates=[];
for(const file of files){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/\b(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:let|const)\s+([A-Za-z_$][\w$]*)\b)/g)){const name=m[1]||m[2];if(count(source,name)!==1)continue;candidates.push({file:path.relative(root,file),line:text.slice(0,m.index).split('\n').length,name,kind:m[1]?'function':'first binding',testReferences:count(testText,name)});}}
console.log(JSON.stringify({method:'lexical identifier count across src including inline handler strings; first let/const binding only',limitations:['Not AST/scope aware; comments, property names and strings count as references','Does not prove reachability; global adapters, object properties, closures and dynamic calls need manual review','CSS, assets, save schema and conditional fallback paths require separate manual review'],sourceFiles:files.length,testFiles:tests.length,candidates},null,2));
