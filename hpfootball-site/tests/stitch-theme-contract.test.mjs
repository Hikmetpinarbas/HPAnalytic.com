import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('site loads approved reusable lab tokens, without replacing brand artwork',()=>{
  const css=fs.readFileSync('src/styles/hpa-design-tokens.css','utf8');
  const layout=fs.readFileSync('src/layouts/BaseLayout.astro','utf8');
  for(const hex of ['#F5F1E8','#FFFEFB','#181D19','#234338','#8EA58B','#B78C72','#C3A469']) assert.ok(css.includes(hex),hex);
  assert.match(layout,/import '\.\.\/styles\/hpa-design-tokens\.css'/);
});
