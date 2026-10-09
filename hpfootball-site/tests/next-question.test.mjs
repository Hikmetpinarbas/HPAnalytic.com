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

test('article renders next question only when it is authored', async () => {
  const article = await source(articleUrl);
  assert.match(article, /resolveNextQuestion\(a\.data\.nextQuestion,/);
  assert.match(article, /\{nextQuestion\s*&&/);
  assert.match(article, /SIRADAKİ SORU/);
  assert.match(article, /\{nextQuestion\.question\}/);
  assert.match(article, /\{nextQuestion\.href\s*&&\s*<a href=\{nextQuestion\.href\}/);
});

test('next question is a static, vertically readable continuation surface', async () => {
  const css = await source(cssUrl);
  assert.match(css, /\.next-question\s*\{/);
  assert.doesNotMatch(articleSourcePlaceholder, /client:/);
});
const articleSourcePlaceholder = await source(articleUrl);

test('next question links an article only when that article is public', async () => {
  const { resolveNextQuestion } = await import('../src/lib/next-question.mjs');
  const q = (href) => ({ question: 'Q?', href });
  assert.equal(resolveNextQuestion(undefined, []), null);
  assert.deepEqual(resolveNextQuestion(q('/articles/position-role'), ['event-only-boundary']), { question: 'Q?', href: null });
  assert.deepEqual(resolveNextQuestion(q('/articles/position-role/'), ['position-role']), { question: 'Q?', href: '/articles/position-role/' });
  assert.deepEqual(resolveNextQuestion(q('/analysis/'), []), { question: 'Q?', href: '/analysis/' });
  assert.equal(resolveNextQuestion(q('https://example.com'), []).href, null);
});
