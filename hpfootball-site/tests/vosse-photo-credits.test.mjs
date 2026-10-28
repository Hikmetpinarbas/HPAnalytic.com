import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const page=readFileSync(new URL('src/pages/portraits/vosse-de-boode.astro',root),'utf8');
test('licensed documentary images appear with creator, links, honest context labeling',()=>{
 assert.match(page,/photo-1767731154269-904a69c11fe4/);
 assert.match(page,/photo-1767731325176-1b4c774bd3d3/);
 assert.match(page,/christopher lemercier/);
 assert.match(page,/Unsplash/);
 assert.match(page,/temsili|bağlamsal/);
 assert.match(page,/sloansportsconference\.com\/people\/vosse-de-boode/);
});
