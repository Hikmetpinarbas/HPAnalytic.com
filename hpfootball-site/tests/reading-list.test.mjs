import test from 'node:test';import assert from 'node:assert/strict';import {parseReadingList,toggleReadingList} from '../src/lib/reading-list.mjs';
test('malformed storage is safe',()=>{assert.deepEqual(parseReadingList('oops'),[]);assert.deepEqual(parseReadingList('{}'),[])});
test('only article paths survive and duplicates collapse',()=>{assert.deepEqual(parseReadingList(JSON.stringify(['/articles/valid-one','https://evil.test','/articles/valid-one','/control/'])),['/articles/valid-one'])});
test('toggle saves and removes',()=>{assert.deepEqual(toggleReadingList([], '/articles/test'),['/articles/test']);assert.deepEqual(toggleReadingList(['/articles/test'],'/articles/test'),[])});
test('non-article paths cannot be saved',()=>assert.deepEqual(toggleReadingList([], 'javascript:alert(1)'),[]));
