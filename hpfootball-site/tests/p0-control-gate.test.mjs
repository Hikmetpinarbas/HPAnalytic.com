import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const middleware=readFileSync(new URL('../src/middleware.ts',import.meta.url),'utf8');
test('control root and descendants denied before next()',()=>{
 assert.match(middleware,/pathname\s*===\s*['"]\/control['"]/);
 assert.match(middleware,/pathname\.startsWith\(['"]\/control\/['"]\)/);
 assert.match(middleware,/status:\s*404/);
});
