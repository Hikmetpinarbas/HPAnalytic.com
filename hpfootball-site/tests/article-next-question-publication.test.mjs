import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('article next-question links are restricted to admitted public articles',()=>{
 const source=readFileSync('src/pages/articles/[...id].astro','utf8');
 assert.match(source,/publicArticleIds=new Set\(all\.map/);
 assert.match(source,/resolvePublicNextQuestion\(nextQuestion, publicArticleIds\)/);
 assert.match(source,/\{safeNextQuestion&&<aside/);
 assert.doesNotMatch(source,/\{a\.data\.nextQuestion&&<aside/);
});
