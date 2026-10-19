import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {existsSync} from 'node:fs';
test('layered runtime uses local Three.js GSAP and bounds GPU work',()=>{
 const code=readFileSync('src/scripts/editorial-depth-runtime.js','utf8');
 assert.match(code,/new THREE\.DirectionalLight/);
 assert.match(code,/new THREE\.WebGLRenderer/);
 assert.match(code,/gsap\.to\(/);
 assert.match(code,/prefers-reduced-motion/);
 assert.match(code,/document\.hidden/);
 assert.match(code,/lastFrame < 33/);
 assert.match(code,/\.dispose\(\)/);
 for(const name of ['three.module.js','three.core.js']) assert.ok(existsSync('src/scripts/vendor/'+name));
 assert.ok(existsSync('public/vendor/hp-depth/gsap.min.js'));
});
