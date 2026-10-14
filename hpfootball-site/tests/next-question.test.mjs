import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schemaUrl = new URL('../src/content.config.ts', import.meta.url);
const articleUrl = new URL('../src/pages/articles/[...id].astro', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');

test('article schema supports one optional authored next question with a real internal destination', async () => {
  const schema = await source(schemaUrl);
  assert.match(schema, /nextQuestion\s*:\s*z\.object\(\{[\s\S]*question\s*:\s*z\.string\(\)[\s\S]*href\s*:\s*z\.string\(\)[\s\S]*\}\)\.optional\(\)/);
});

test('article renders next question only when authored and destination is public', async () => {
  const article = await source(articleUrl);
  assert.match(article, /const nextQuestion=a\.data\.nextQuestion/);
  assert.match(article, /resolvePublicNextQuestion\(nextQuestion, publicArticleIds\)/);
  assert.match(article, /safeNextQuestion&&/);
  assert.match(article, /SIRADAKİ SORU/);
  assert.match(article, /safeNextQuestion\.question/);
  assert.match(article, /href=\{safeNextQuestion\.href\}/);
});

test('next question is a static, vertically readable continuation surface', async () => {
  const css = await source(cssUrl);
  assert.match(css, /\.next-question\s*\{/);
  assert.doesNotMatch(articleSourcePlaceholder, /client:/);
});
const articleSourcePlaceholder = await source(articleUrl);
