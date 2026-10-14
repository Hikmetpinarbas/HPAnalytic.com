import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const t=readFileSync(new URL('../editorial/governance/HP_EDITORIAL_COUNCIL_100.md',import.meta.url),'utf8');
test('council contains exactly 100 numbered members',()=>{assert.equal((t.match(/^\d+\. /gm)||[]).length,100)});
test('council protects voice evidence comprehension and insight',()=>{
 for(const s of ["never imitate a living writer's distinctive voice",'ordinary-reader clarity','Final voice authority: Hikmet Pınarbaş','editorial force and cognitive salience may never exceed evidence','Ordinary Reader Test','Eureka Test','Gestalt / cognitive design acceptance']) assert.ok(t.toLowerCase().includes(s.toLowerCase()),s);
});
