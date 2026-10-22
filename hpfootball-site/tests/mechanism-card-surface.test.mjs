import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('editorial mechanism metadata stays available without a reader-facing diagnostic card', async()=>{
  const schema=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');
  const article=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
  assert.match(schema,/mechanismCard/);
  assert.doesNotMatch(article,/import MechanismCard|<MechanismCard/);
});
