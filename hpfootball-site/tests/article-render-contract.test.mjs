import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const configUrl=new URL('../src/content.config.ts',import.meta.url);
const routeUrl=new URL('../src/pages/articles/[...id].astro',import.meta.url);

test('governed editorial metadata is retained in content schema',async()=>{
 const schema=await readFile(configUrl,'utf8');
 for(const name of ['articleKind','author','language','topics','sourceRefs','sourceRights','claimIds','counterevidence','claimCeiling','readingMinutes','truthAuthority','sourceClaimsValidated','qualityStatus'])
  assert.match(schema,new RegExp(name));
});
test('reader sees article identity and optional sources without internal QA panels',async()=>{
 const route=await readFile(routeUrl,'utf8');
 for(const term of ['article-meta','readingMinutes','topics','sourceRefs','Kaynakları incele','displayArticleKind','displaySection'])
  assert.match(route,new RegExp(term));
 for(const term of ['EvidenceBadge','claim-boundary','article-source-validation','article-counterevidence'])
  assert.doesNotMatch(route,new RegExp(term));
});
test('article uses Turkish labels and never renders internal taxonomy codes',async()=>{
 const route=await readFile(routeUrl,'utf8');
 assert.match(route,/articleKindLabel/);
 assert.match(route,/seriesLabel/);
 assert.match(route,/seriesLabel\s*!==\s*articleKindLabel/);
 assert.doesNotMatch(route,/COUNTEREVIDENCE \/ SINIR|SOURCE LAYER/);
});
