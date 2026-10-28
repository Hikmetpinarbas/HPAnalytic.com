import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {pruneDraftArchive} from '../src/integrations/public-archive-boundary.mjs';
test('draft and orphan raw HTML cannot bypass publication gates; source files and explicitly admitted output survive',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'hpa-archive-'));
 const sourceDir=pathToFileURL(root+'/');
 const output=pathToFileURL(root+'/dist/client/');
 try {
  for(const dir of ['public/monographs','src/content/monographs','dist/client/monographs']) await mkdir(new URL(dir+'/',sourceDir),{recursive:true});
  for(const name of ['draft','admitted','orphan']) {
   await writeFile(new URL('public/monographs/'+name+'.html',sourceDir),'source '+name);
   await writeFile(new URL('monographs/'+name+'.html',output),'output '+name);
  }
  await writeFile(new URL('src/content/monographs/draft.md',sourceDir),'---\ntitle: Test\ndraft: true\n---\nBody');
  await writeFile(new URL('src/content/monographs/admitted.md',sourceDir),'---\ntitle: Test\ndraft: false\n---\nBody');
  assert.deepEqual((await pruneDraftArchive({sourceDir,assetDirs:[output]})).sort(),['draft.html','orphan.html']);
  await assert.rejects(access(new URL('monographs/draft.html',output)));
  await assert.rejects(access(new URL('monographs/orphan.html',output)));
  assert.equal(await readFile(new URL('monographs/admitted.html',output),'utf8'),'output admitted');
  assert.equal(await readFile(new URL('public/monographs/draft.html',sourceDir),'utf8'),'source draft');
 } finally {await rm(root,{recursive:true,force:true});}
});
