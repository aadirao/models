import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const preferred=Number(process.argv[2])||4173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.blend':'application/octet-stream','.py':'text/plain; charset=utf-8','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{
 const file=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(file!==base&&!file.startsWith(base+path.sep))throw Error('Invalid path');
 const target=(await stat(file)).isDirectory()?path.join(file,'index.html'):file,data=await readFile(target);
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
let port=preferred;
server.on('error',error=>{if(error.code==='EADDRINUSE'&&port<preferred+10){port++;server.listen(port,'127.0.0.1');}else{console.error('The local simulator could not start. Choose another port: node server.mjs 4300');process.exitCode=1;}});
server.on('listening',()=>{if(process.argv.includes('--open'))import('node:child_process').then(({spawn})=>{const url='http://127.0.0.1:'+port,[command,args]=process.platform==='win32'?['cmd',['/c','start','',url]]:[process.platform==='darwin'?'open':'xdg-open',[url]];spawn(command,args,{detached:true,stdio:'ignore'}).unref();});console.log('Simulator: http://127.0.0.1:'+port);console.log('Trade-show loop: http://127.0.0.1:'+port+'/?kiosk=1');console.log('Press Ctrl+C to stop.');});
server.listen(port,'127.0.0.1');process.on('SIGINT',()=>server.close(()=>process.exit(0)));
