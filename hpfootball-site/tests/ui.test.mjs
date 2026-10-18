import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('CSS variables and color scheme match light theme specification', () => {
  const cssPath = path.resolve(__dirname, '../src/styles/global.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  assert.match(cssContent, /color-scheme:\s*light;/);
  assert.match(cssContent, /--bg:\s*#F5F1E8;/i);
  assert.match(cssContent, /--surface:\s*#FFFEFB;/i);
  assert.match(cssContent, /--ink:\s*#181D19;/i);
  assert.match(cssContent, /--gold:\s*#B78C72;/i);
  assert.doesNotMatch(cssContent, /background:\s*#080706;/i);
});

test('BaseLayout theme color matches light background', () => {
  const layoutPath = path.resolve(__dirname, '../src/layouts/BaseLayout.astro');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

  assert.match(layoutContent, /<meta name="theme-color" content="#F5F1E8"\/>/);
});
