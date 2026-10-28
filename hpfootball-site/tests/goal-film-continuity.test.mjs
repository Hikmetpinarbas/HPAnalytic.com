import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const film=readFileSync(new URL('../src/lib/goal-film.ts',import.meta.url),'utf8');
test('finished goal continues with the next registered goal on explicit play',()=>{
 assert.match(film,/starts:Array<\(\)=>void>\s*=\s*\[\]/);
 assert.match(film,/starts\[i\+1\]\?\.\(\)/);
 assert.match(film,/motion\.matches/);
});
test('transport never autoplay-starts just by page load',()=>{
 assert.match(film,/play\.addEventListener\('click'/);
 assert.doesNotMatch(film,/starts\[0\]\?\.\(\)/);
});
