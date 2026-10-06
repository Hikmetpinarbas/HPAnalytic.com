import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { extractFromHtml, foundryCandidates, readFoundryQueue, readUploadedFile, readUrl } from '../src/studio/lib/intake.mjs';
import editorialStudio, { STUDIO_ROUTES } from '../src/studio/integration.mjs';
import { studioRequestProblem } from '../src/studio/lib/guard.mjs';
import { createStore } from '../src/studio/lib/store.mjs';
import { handleAction } from '../src/studio/lib/actions.mjs';
import { isPublic } from '../src/lib/public-content.mjs';

const tmp = () => mkdtemp(path.join(os.tmpdir(), 'hp-studio-'));

test('HTML extraction keeps in-content headers and drops page chrome', () => {
  const html = '<html><head><title>T</title><meta name="description" content="D &amp; E"></head><body><nav>menu</nav><main><header><h1>Başlık</h1></header><p>Gövde &#39;metin&#39;</p><script>x()</script></main><footer>f</footer></body></html>';
  const out = extractFromHtml(html);
  assert.equal(out.title, 'T');
  assert.equal(out.description, 'D & E');
  assert.match(out.text, /Başlık/);
  assert.match(out.text, /Gövde 'metin'/);
  assert.doesNotMatch(out.text, /menu|x\(\)/);
});

test('readUrl reports failures instead of guessing', async () => {
  assert.deepEqual((await readUrl('ftp://x')).warnings, ['URL_INVALID']);
  const notFound = await readUrl('https://example.org', { fetchImpl: async () => new Response('', { status: 404 }) });
  assert.deepEqual(notFound.warnings, ['HTTP_404']);
  const pdf = await readUrl('https://example.org/r.pdf', { fetchImpl: async () => new Response('%PDF-1.7 x', { headers: { 'content-type': 'application/pdf' } }) });
  assert.ok(pdf.pdf);
  assert.ok(pdf.warnings.includes('PDF_TEXT_NEEDS_ENGINE'));
});

test('uploaded files: text read, PDF kept for the engine, DOCX reported', () => {
  assert.equal(readUploadedFile('n.md', Buffer.from('# not')).text, '# not');
  assert.ok(readUploadedFile('r.pdf', Buffer.from('%PDF-1.4')).pdf);
  assert.deepEqual(readUploadedFile('a.docx', Buffer.from('PK')).warnings, ['DOCX_NOT_SUPPORTED_YET_EXPORT_AS_PDF_OR_MD']);
});

test('Foundry bridge reads the queue shape, skips incomplete items, never writes', async () => {
  const dir = await tmp();
  await writeFile(path.join(dir, 'QUEUE_INCREMENT_01.json'), JSON.stringify({ items: [
    { id: 'CFQ-1', type: 'article_seed', seed: 's', source_lead: 'l', provenance: 'p', claim_ceiling: 'c' },
    { id: 'CFQ-2', type: 'source_lead', seed: 's', source_lead: 'l', provenance: 'p', claim_ceiling: 'c' },
    { id: 'CFQ-3', type: 'article_seed', seed: 's' },
  ] }));
  await writeFile(path.join(dir, 'QUEUE_BROKEN.json'), '{');
  const before = await readdir(dir);
  const q = await readFoundryQueue(dir);
  assert.deepEqual(q.items.map((i) => i.id), ['CFQ-1', 'CFQ-2']);
  assert.deepEqual(q.warnings, ['FOUNDRY_FILE_INVALID:QUEUE_BROKEN.json']);
  assert.deepEqual(foundryCandidates(q.items).map((i) => i.id), ['CFQ-1']);
  assert.deepEqual(foundryCandidates(q.items, new Set(['CFQ-1'])), []);
  assert.deepEqual(await readdir(dir), before);
  assert.equal((await readFoundryQueue(path.join(dir, 'missing'))).available, false);
});

test('Studio routes are injected only with HP_STUDIO=1, and never in a build', () => {
  const injected = [];
  const setup = (env, command = 'dev') => editorialStudio({ env }).hooks['astro:config:setup']({ command, injectRoute: (r) => injected.push(r), logger: { info() {} } });
  setup({});
  assert.equal(injected.length, 0);
  assert.throws(() => setup({ HP_STUDIO: '1' }, 'build'), /local-only/);
  setup({ HP_STUDIO: '1' });
  assert.deepEqual(injected.map((r) => r.pattern), STUDIO_ROUTES.map((r) => r.pattern));
  assert.ok(injected.every((r) => r.prerender === false && !r.entrypoint.includes('src/pages')));
});

test('request guard: loopback only, same-origin POST only', () => {
  const env = { HP_STUDIO: '1' };
  const req = (href, method = 'GET', origin = null) => ({ url: new URL(href), method, headers: new Headers(origin ? { origin } : {}) });
  assert.equal(studioRequestProblem(req('http://127.0.0.1:4321/studio/editorial'), env), null);
  assert.equal(studioRequestProblem(req('http://192.168.1.5:4321/studio/editorial'), env), 'NOT_LOOPBACK');
  assert.equal(studioRequestProblem(req('http://127.0.0.1:4321/studio/editorial', 'POST'), env), 'CROSS_ORIGIN_POST');
  assert.equal(studioRequestProblem(req('http://127.0.0.1:4321/studio/editorial', 'POST', 'https://evil.example'), env), 'CROSS_ORIGIN_POST');
  assert.equal(studioRequestProblem(req('http://127.0.0.1:4321/studio/editorial', 'POST', 'http://127.0.0.1:4321'), env), null);
  assert.equal(studioRequestProblem(req('http://127.0.0.1:4321/studio/editorial'), {}), 'STUDIO_DISABLED');
});

test('public site: draft content is filtered from every collection read', async () => {
  assert.equal(isPublic({ data: { draft: true } }), false);
  assert.equal(isPublic({ data: {} }), true);
  const files = ['components/SectionListing.astro', 'layouts/BaseLayout.astro', 'pages/archive.astro', 'pages/search.astro', 'pages/articles/[...id].astro', 'pages/index.astro'];
  for (const f of files) {
    const src = await readFile(new URL(`../src/${f}`, import.meta.url), 'utf8');
    for (const call of src.match(/getCollection\([^)]*\)/g) ?? []) assert.match(call, /isPublic/, `${f}: ${call}`);
  }
  const config = await readFile(new URL('../src/content.config.ts', import.meta.url), 'utf8');
  assert.equal((config.match(/draft:z\.boolean\(\)\.default\(false\)/g) ?? []).length, 3);
});

test('public code never imports Studio code', async () => {
  const walk = async (dir) => (await readdir(dir, { withFileTypes: true })).flatMap((e) => e.isDirectory() ? [] : [path.join(dir, e.name)]);
  const roots = ['pages', 'pages/articles', 'pages/api', 'layouts', 'components', 'lib'].map((d) => new URL(`../src/${d}/`, import.meta.url).pathname);
  for (const root of roots) {
    for (const file of await walk(root)) {
      assert.doesNotMatch(await readFile(file, 'utf8'), /studio\//, file);
    }
  }
});

test('store keeps data outside the repo and rejects path tricks', async () => {
  const store = createStore(await tmp());
  assert.equal(await store.getTopic('../../etc/passwd'), null);
  await assert.rejects(store.writeOutbox('../escape.md', 'x'), /OUTBOX_PATH_ESCAPE/);
});

test('end to end, OPERATOR path: idea → READY → APPROVED → package, never published', async () => {
  process.env.HP_STUDIO_ENGINE = 'off';
  const root = await tmp();
  const store = createStore(root);
  const form = (fields) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.append(k, v);
    return f;
  };
  const run = async (fields) => (await handleAction(store, form(fields)));
  const created = await run({ action: 'intake', text: 'Pas ağı merkeziliği gerçekten oyuncu önemini ölçer mi?' });
  assert.equal(created.flash, 'INTAKE_IDEA_OK');
  const id = created.redirect.split('/').pop();
  assert.equal((await store.getTopic(id)).state, 'IDEA', 'no engine → stays IDEA, nothing fabricated');

  const paste = (step, answer) => run({ action: 'paste_step', id, step, answer: JSON.stringify(answer) });
  assert.equal((await run({ action: 'run_step', id, step: 'classify' })).flash, 'ENGINE_UNAVAILABLE:ENGINE_DISABLED');
  await paste('classify', { title: 'Merkezilik önem mi?', destination: 'RESEARCH', core_question: 'q', working_thesis: 't', content_type: 'MISUNDERSTOOD_METRIC' });
  assert.equal((await paste('evidence', {})).flash, 'NO_SOURCES', 'steps respect preconditions');
  await paste('research', { sources: [{ title: 'A', url: 'https://a.org', role: 'ACADEMIC', stance: 'SUPPORTS' }, { title: 'B', url: 'https://b.org', role: 'COUNTEREVIDENCE', stance: 'COUNTER' }] });
  await paste('evidence', { claims: [{ claim: 'c', evidence: 'e', source_ids: ['S1'], confidence: 'MEDIUM', counterevidence: 'x', interpretation: '' }], thesis: 't', counterargument: 'ca', hp_angle: 'hp' });
  await paste('draft', { standfirst: 's', body_md: 'Merkezilik akışı ölçer, önemi değil. [S1]' });
  await paste('headlines', { headlines: [{ variant: 'A', text: 'Merkezilik önem değildir', answers: true, stronger_than_evidence: false, misleading: false, generic: false }] });
  await paste('redteam', { findings: [], scores: { ORIGINALITY: 7 }, summary: '' });
  assert.equal((await store.getTopic(id)).state, 'EDITORIAL_REVIEW');

  assert.match((await run({ action: 'transition', id, to: 'READY' })).flash, /^GATE_FAILED:SOURCE_TRACEABILITY/);
  await run({ action: 'verify_source', id, source_id: 'S1' });
  await run({ action: 'attest', id, key: 'sources_checked', value: 'true' });
  await run({ action: 'attest', id, key: 'voice_checked', value: 'true' });
  await run({ action: 'select_headline', id, variant: 'A' });
  assert.equal((await run({ action: 'transition', id, to: 'READY' })).flash, 'STATE:READY');
  await run({ action: 'set_public_meta', id, evidence_class: '', claim_ceiling: 'CONCEPTUAL', tags: '' });
  assert.equal((await run({ action: 'transition', id, to: 'APPROVED' })).flash, 'STATE:APPROVED');
  assert.equal((await run({ action: 'export', id })).flash, 'EXPORTED');
  assert.equal((await run({ action: 'transition', id, to: 'PUBLISHED' })).flash, 'PUBLIC_URL_REQUIRED');
  assert.equal((await run({ action: 'set_public_url', id, public_url: 'https://evil.example/x' })).flash, 'PUBLIC_URL_MUST_BE_HPANALYTIC');

  const topicAfter = await store.getTopic(id);
  const pkg = await readFile(path.join(root, 'outbox', topicAfter.export.path), 'utf8');
  assert.match(pkg, /\ndraft: true\n/);
  const ledger = (await readFile(path.join(root, 'ledger.jsonl'), 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
  assert.ok(ledger.some((e) => e.type === 'TRANSITION' && e.to === 'APPROVED'));

  const rejected = await run({ action: 'intake', text: 'Başka zayıf fikir burada duruyor' });
  const rid = rejected.redirect.split('/').pop();
  await run({ action: 'transition', id: rid, to: 'REJECTED', reason: 'TOO_GENERIC' });
  assert.equal((await store.failureMemory())[0].reason, 'TOO_GENERIC');
  const again = await run({ action: 'intake', text: 'Başka zayıf fikir burada duruyor' });
  const warnings = (await store.getTopic(again.redirect.split('/').pop())).intake.warnings;
  assert.ok(warnings.some((w) => w.startsWith('SIMILAR_TO_REJECTED:TOO_GENERIC')), warnings.join());
  delete process.env.HP_STUDIO_ENGINE;
});
