import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('offline observer is deterministic and rejects nonallowlisted input',()=>{
 const dir=mkdtempSync(join(tmpdir(),'hp-observer-'));const file=join(dir,'input.json');
 try{
  writeFileSync(file,JSON.stringify({repository:'Hikmetpinarbas/HPAnalytic.com',sha:'9ecb9126d8684bd42865eb8c334c24d0618be204',runs:[{id:1,status:'completed',conclusion:'success'}]}));
  const a=execFileSync(process.execPath,['scripts/repo-observer.mjs',file],{encoding:'utf8'});
  const b=execFileSync(process.execPath,['scripts/repo-observer.mjs',file],{encoding:'utf8'});
  assert.equal(a,b);assert.equal(JSON.parse(a).source,'OFFLINE_SNAPSHOT_NOT_LIVE');
  writeFileSync(file,JSON.stringify({repository:'unapproved/repo',sha:'invalid'}));
  assert.equal(spawnSync(process.execPath,['scripts/repo-observer.mjs',file]).status,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
