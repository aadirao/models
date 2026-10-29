// Packs dist/ into one HTML file that opens by double-click (file://), with no server or Node.js needed to view it.
// Modules are embedded as text and loaded through blob URLs and an import map; the model is embedded as base64.
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const dist='dist',output='Heat Tracing Simulator.html';
const specifier=/(\bfrom\s*|\bimport\s*)(['"])(\.{1,2}\/[^'"]+|three)\2/g;
const modules={};
function load(id){
 if(id in modules)return;modules[id]='';
 let source=readFileSync(path.join(dist,id),'utf8');
 source=source.replace(specifier,(match,keyword,quote,target)=>{
  const dependency=target==='three'?'vendor/three.module.js':path.posix.normalize(path.posix.join(path.posix.dirname(id),target));
  load(dependency);return keyword+quote+'@hts/'+dependency+quote;
 });
 if(id==='app.js'){
  if(!source.includes("'./assets/thermal_assembly.glb'"))throw Error('Model path not found in app.js');
  source=source.replace("loadAsync('./assets/thermal_assembly.glb'","loadAsync(window.__htsModelUrl").replaceAll('href="./assets/','href="./dist/assets/');
 }
 modules[id]=source;
}
load('app.js');
const safeJson=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const model=readFileSync(path.join(dist,'assets/thermal_assembly.glb')).toString('base64');
const bootstrap=`<script type="application/json" id="hts-modules">${safeJson(modules)}</script>
<script type="application/octet-stream" id="hts-model">${model}</script>
<script>
(async()=>{
 const sources=JSON.parse(document.getElementById('hts-modules').textContent),imports={};
 for(const [id,source] of Object.entries(sources))imports['@hts/'+id]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
 const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.append(map);
 const text=atob(document.getElementById('hts-model').textContent.trim()),bytes=new Uint8Array(text.length);
 for(let i=0;i<text.length;i++)bytes[i]=text.charCodeAt(i);
 window.__htsModelUrl=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));
 await import('@hts/app.js');
})().catch(error=>{console.error(error);document.getElementById('load-message').textContent='This browser could not start the simulator. Open it in a current Chrome, Edge, Firefox or Safari.';});
</script>`;
let html=readFileSync(path.join(dist,'index.html'),'utf8');
const css=readFileSync(path.join(dist,'style.css'),'utf8');
for(const [from,to] of[['<link rel="stylesheet" href="./style.css">',`<style>${css}</style>`],['<script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script>',''],['<script type="module" src="./app.js"></script>',bootstrap]]){
 if(!html.includes(from))throw Error('Unexpected index.html layout: '+from);
 html=html.replace(from,()=>to);
}
writeFileSync(output,html);
console.log(`Wrote "${output}" (${(Buffer.byteLength(html)/1048576).toFixed(1)} MB, ${Object.keys(modules).length} modules)`);
