import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./',import.meta.url)),port=Number(process.env.PORT||8099),host=process.env.PROTOTYPE_HOST||'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png'};
http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/')pathname='/index.html';const target=path.resolve(root,'.'+pathname);if(!target.startsWith(root)||pathname.includes('/../')||pathname.startsWith('/.')){res.writeHead(403);return res.end('Forbidden');}if(!(await stat(target)).isFile())throw new Error('not file');res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(await readFile(target));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,host,()=>console.log(`HPAnalytic isolated prototype: http://${host}:${port}`));
