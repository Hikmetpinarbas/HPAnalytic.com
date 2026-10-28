import {readdir,readFile,rm} from 'node:fs/promises';

// Legacy public HTML must not bypass the collection's draft boundary.
// Source copies remain in public/ for editorial work; only emitted files are removed.
export async function pruneDraftArchive({sourceDir,assetDirs}) {
 let files;
 try {files=await readdir(new URL('public/monographs/',sourceDir));}
 catch(error) {if(error.code==='ENOENT') return []; throw error;}
 const removed=[];
 for(const name of files.filter(name=>name.endsWith('.html'))) {
  let source='';
  try {source=await readFile(new URL(`src/content/monographs/${name.slice(0,-5)}.md`,sourceDir),'utf8');}
  catch(error) {if(error.code!=='ENOENT') throw error;}
  const frontmatter=source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  // A legacy file needs a corresponding explicitly non-draft source.
  if(/^draft:\s*false\s*$/m.test(frontmatter)) continue;
  for(const dir of assetDirs) await rm(new URL(`monographs/${name}`,dir),{force:true});
  removed.push(name);
 }
 return removed;
}
export default function publicArchiveBoundary() {
 let sourceDir;
 return {name:'hpanalytic-public-archive-boundary',hooks:{
  'astro:config:done':({config})=>{sourceDir=config.root;},
  'astro:build:done':async({dir,logger})=>{
   const removed=await pruneDraftArchive({sourceDir,assetDirs:[dir,new URL('client/',dir)]});
   logger.info(`Excluded ${removed.length} unverified legacy archive HTML files from public output; source copies preserved.`);
  }
 }};
}
