import {writeFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {layout,home,archive,article,analysis} from './src/ui.mjs';
const root=new URL('./',import.meta.url),pages=[['index','home','Oyunu başka türlü oku',home],['archive','archive','Araştırma arşivi',archive],['article','article','Bir pasın değeri',article],['analysis','analysis','Etkileşimli analiz',analysis]];
for(const [file,key,title,render]of pages){const path=new URL(file+'.html',root);await writeFile(path,layout(key,title,render()));console.log(`${fileURLToPath(path)} ${(await stat(path)).size} bytes`);}
