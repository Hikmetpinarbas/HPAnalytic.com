import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const layout=readFileSync(new URL("../src/layouts/BaseLayout.astro",import.meta.url),"utf8");
const home=readFileSync(new URL("../src/pages/index.astro",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/styles/global.css",import.meta.url),"utf8");
test("brand has vector HP mark and wordmark",()=>{assert.match(layout,/class="hp-mark"/);assert.match(layout,/class="hp-break"/);assert.match(layout,/HPANALYTIC/);assert.match(layout,/HİKMET PINARBAŞ/)});
test("shell has accessible mobile index and real CTA",()=>{assert.match(layout,/MobileNavigation/);assert.match(home,/href="\/analysis"/);assert.match(home,/action-primary/)});
test("entry motion is lightweight, reduced-motion safe, and content is visible before animation",()=>{assert.match(home,/hero-entry/);assert.match(css,/@keyframes hp-reveal/);assert.match(css,/@keyframes hp-line-in/);assert.match(css,/prefers-reduced-motion:reduce/);assert.doesNotMatch(css,/@keyframes hp-reveal\{from\{opacity:0/)});
