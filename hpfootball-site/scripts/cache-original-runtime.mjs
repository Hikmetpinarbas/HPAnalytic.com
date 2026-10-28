import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),folder=new URL('public/js/preserved-derby/',root);await mkdir(folder,{recursive:true});
const manifest={};
for(const [key,name]of [['data','source-data.js.txt'],['runtime','chart-runtime.js.txt']]){
 const bytes=await readFile(new URL('src/components/preserved-derby/'+name,root));
 const sha256=createHash('sha256').update(bytes).digest('hex'),file=key+'-'+sha256.slice(0,20)+'.js';
 await writeFile(new URL(file,folder),bytes);manifest[key]={url:'/js/preserved-derby/'+file,sha256,bytes:bytes.length};
}
await writeFile(new URL('src/components/preserved-derby/runtime-assets.json',root),JSON.stringify(manifest,null,2)+'\n');
console.log('Original chart data and runtime cached byte-for-byte:',Object.fromEntries(Object.entries(manifest).map(([key,x])=>[key,x.bytes])));
