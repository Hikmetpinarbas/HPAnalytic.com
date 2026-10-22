import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const view=readFileSync(resolve('src/components/LayeredPitch.astro'),'utf8');
const controller=readFileSync(resolve('src/lib/layered-pitch-controller.mjs'),'utf8');

test('pitch view includes persistent SVG pitch and accessible controls',()=>{
  assert.match(view,/<svg[\s\S]*?viewBox="0 0 105 68"/);
  assert.match(view,/aria-label="Katman odağı"/);
  assert.match(view,/data-layer-focus/);
  assert.match(view,/data-team-filter/);
  assert.match(view,/data-event-filter/);
  assert.match(view,/data-time-filter/);
  assert.match(view,/data-context-opacity/);
});
test('view separates home and opponent glyphs from passes and outcomes',()=>{
  for(const layer of ['players','relationships','actions','outcomes']) assert.match(view,new RegExp('data-family="'+layer+'"'));
  assert.match(view,/data-team=\{event.team\}/);
  assert.match(view,/data-minute=\{event.minute\}/);
});
test('focus and event filters implemented by a real browser controller',()=>{
  assert.match(controller,/focusOpacity/);
  assert.match(controller,/selectEvents/);
  assert.match(controller,/addEventListener/);
});
