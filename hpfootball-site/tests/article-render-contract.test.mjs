import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const configUrl=new URL('../src/content.config.ts',import.meta.url);
const routeUrl=new URL('../src/pages/articles/[...id].astro',import.meta.url);

test('article content schema supports governed editorial metadata', async () => {
  const config=await readFile(configUrl,'utf8');
  for(const field of [
    'articleKind','author','language','topics','sourceRefs','sourceRights',
    'claimIds','counterevidence','readingMinutes','truthAuthority',
    'sourceClaimsValidated','qualityStatus'
  ]) assert.match(config,new RegExp(field));
});

test('article route renders byline reading time topics evidence limits and source layer', async () => {
  const route=await readFile(routeUrl,'utf8');
  for(const token of [
    'article-meta','readingMinutes','topics','counterevidence','sourceRefs',
    'claimCeiling','EvidenceBadge'
  ]) assert.match(route,new RegExp(token));
  assert.match(route,/Kaynak zemini/);
  assert.match(route,/Karşı kanıt|Sınır/);
});

test('article route never presents source claims as validated truth when contract says false', async () => {
  const route=await readFile(routeUrl,'utf8');
  assert.match(route,/sourceClaimsValidated/);
  assert.match(route,/doğrulanmış futbol gerçeği değildir|truth authority değildir/i);
});


test('reader-facing article metadata uses Turkish display labels instead of internal codes', async () => {
  const route=await readFile(routeUrl,'utf8');
  const badge=await readFile(new URL('../src/components/EvidenceBadge.astro',import.meta.url),'utf8');
  assert.match(route,/displayArticleKind|displaySection|displayRights|displayClaimCeiling/);
  assert.match(badge,/displayEvidenceClass|Kanıt sınırı/);
  assert.doesNotMatch(route,/COUNTEREVIDENCE \/ SINIR|SOURCE LAYER/);
  assert.doesNotMatch(badge,/CLAIM CEILING/);
});
