import test from 'node:test';
import assert from 'node:assert/strict';
import {PITCH,projectPoint,normalizeEvent,focusOpacity,selectEvents} from '../src/lib/layered-pitch.mjs';
test('105x68 coordinates project independently of renderer',()=>{assert.deepEqual(PITCH,{length:105,width:68});assert.deepEqual(projectPoint({x:52.5,y:34},420,272),{x:210,y:136})});
test('invalid pitch coordinates are rejected',()=>{assert.throws(()=>projectPoint({x:106,y:30},420,272),RangeError);assert.throws(()=>normalizeEvent({id:'x',team:'home',type:'pass',minute:10,x:-1,y:5}),RangeError)});
test('focus and context alpha differ by team',()=>{assert.equal(focusOpacity({family:'relationships',selected:'relationships',team:'home',side:'home'}),1);assert.equal(focusOpacity({family:'actions',selected:'relationships',team:'home',side:'home'}),.2);assert.equal(focusOpacity({family:'relationships',selected:'relationships',team:'away',side:'home'}),.3)});
test('events filter by team action and match clock',()=>{const e=[{id:'1',team:'home',type:'pass',minute:12,x:10,y:10},{id:'2',team:'away',type:'pass',minute:12,x:20,y:10},{id:'3',team:'home',type:'dribble',minute:33,x:21,y:10}].map(normalizeEvent);assert.deepEqual(selectEvents(e,{side:'home',type:'pass',endMinute:45}).map(x=>x.id),['1'])});
test('unavailable outcomes and positions remain unavailable',()=>{const e=normalizeEvent({id:'1',team:'home',type:'pass',minute:9,x:5,y:8});assert.equal(e.outcome,undefined);assert.equal(e.tracking,undefined);assert.equal(e.endX,undefined)});
