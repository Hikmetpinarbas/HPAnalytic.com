import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  normalizeControlItem,
  loadControlItems,
  canSiteAdmit,
  STATUS_FLOW,
} from '../src/lib/content-control.mjs';

const routeUrl = new URL('../src/pages/control/content.astro', import.meta.url);
const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const surfacesUrl = new URL('../src/lib/site-surfaces.mjs', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');

const master = {
  content_id: 'analysis_state::POSTMATCH::Turkey - Italy',
  title: 'Turkey - Italy — POSTMATCH',
  status: 'REVIEW_READY',
  source_type: 'ANALYSIS_STATE_ADMITTED',
  source_date: '2026-10-05',
  evidence_class: ['EVIDENCE'],
  claim_ceiling: 'MIXED',
  web_route: { status: 'EDITORIAL_ROUTE_READY', quality_status: 'REVIEW_REQUIRED' },
  article_quality: { professional_output_ready: false, status: 'EVIDENCE_GAPS' },
};

test('control route exists with required internal editorial identity', async () => {
  const route = await source(routeUrl);
  assert.match(route, /HP CONTENT CONTROL/);
  assert.match(route, /Editorial Intake \/ Review \/ Admission/);
});

test('control route is not added to public navigation', async () => {
  const [layout, surfaces] = await Promise.all([source(layoutUrl), source(surfacesUrl)]);
  assert.doesNotMatch(layout, /\/control\/content/);
  assert.doesNotMatch(surfaces, /\/control\/content/);
});

test('existing empty public surface rule remains intact', async () => {
  const surfaces = await source(surfacesUrl);
  assert.match(surfaces, /Number\(articleSections\[surface\.key\] \|\| 0\) > 0/);
  assert.match(surfaces, /Number\(collectionCounts\[surface\.key\] \|\| 0\) > 0/);
});

test('normalized item preserves missing fields as UNKNOWN rather than inventing values', () => {
  const item = normalizeControlItem({ master: { content_id: 'x', title: 'X' } });
  assert.equal(item.truth_status, 'UNKNOWN');
  assert.equal(item.evidence_status.canonical_source_available, 'UNKNOWN');
  assert.equal(item.rights_status, 'UNKNOWN');
  assert.equal(item.visual_status.renderer_status, 'UNKNOWN');
  assert.equal(item.site_admission, 'UNKNOWN');
});

test('blocked truth item never appears publish-ready', () => {
  const item = normalizeControlItem({ master: { ...master, status: 'BLOCKED' } });
  assert.equal(item.truth_status, 'BLOCKED');
  assert.notEqual(item.site_admission, 'APPROVED_FOR_SITE');
  assert.equal(canSiteAdmit(item), false);
});

test('review item is not promoted to approved', () => {
  const item = normalizeControlItem({ master });
  assert.equal(item.truth_status, 'REVIEW_REQUIRED');
  assert.notEqual(item.site_admission, 'APPROVED_FOR_SITE');
});

test('rights BLOCKED prevents site admission even if another source says approved', () => {
  const item = normalizeControlItem({
    master: { ...master, status: 'HUMAN_APPROVED' },
    admission: { site_admission: 'APPROVED_FOR_SITE', rights_status: 'BLOCKED' },
  });
  assert.equal(item.rights_status, 'BLOCKED');
  assert.equal(canSiteAdmit(item), false);
  assert.notEqual(item.site_admission, 'APPROVED_FOR_SITE');
});

test('current pointer produces a normalized control item', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hp-control-'));
  await mkdir(path.join(root, 'social_content'), { recursive: true });
  await writeFile(path.join(root, 'social_content/HPA_CONTENT_MASTER_CURRENT.json'), JSON.stringify(master));
  const items = await loadControlItems({ stateRoot: root });
  assert.equal(items.length, 1);
  assert.equal(items[0].id, master.content_id);
});

test('missing sources fail soft and return UNKNOWN rather than throw', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hp-control-empty-'));
  const items = await loadControlItems({ stateRoot: root });
  assert.equal(items.length, 1);
  assert.equal(items[0].truth_status, 'UNKNOWN');
  assert.match(items[0].warnings.join(' '), /SOURCE/i);
});

test('mobile markup is operable without horizontal table dependency', async () => {
  const [route, css] = await Promise.all([source(routeUrl), source(cssUrl)]);
  assert.match(route, /class="control-item-card"/);
  assert.match(route, /type="search"/);
  assert.match(route, /<select/);
  assert.match(css, /\.control-item-card/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.doesNotMatch(route, /<table\b/);
});

test('control surface contains no automatic publish action', async () => {
  const route = await source(routeUrl);
  assert.doesNotMatch(route, /fetch\([^)]*publish/i);
  assert.match(route, /No auto publish/i);
  assert.doesNotMatch(route, /<form[^>]+publish/i);
  assert.doesNotMatch(route, /data-[^=]*publish/i);
});

test('adapter is presentation-only and does not create a second truth engine', async () => {
  const adapter = await source(new URL('../src/lib/content-control.mjs', import.meta.url));
  assert.doesNotMatch(adapter, /scoreClaim|inferClaim|generateClaim|upgradeConfidence|approveClaim/i);
  assert.match(adapter, /UNKNOWN/);
  assert.deepEqual(STATUS_FLOW, [
    'INTAKE','VALIDATED','REVIEW_READY','HUMAN_APPROVED','SITE_ADMITTED','PUBLISHED'
  ]);
});

test('social derivative states are mapped as state only, without publishing', () => {
  const item = normalizeControlItem({
    master,
    social: {
      derivatives: {
        x_single: { status: 'DRAFT_READY' },
        x_thread: { status: 'DRAFT_READY' },
        instagram_carousel: { status: 'DRAFT_READY' },
        reel_script: { status: 'DRAFT_READY' },
        youtube_short_script: { status: 'DRAFT_READY' },
      },
    },
  });
  assert.equal(item.social_status.X, 'DRAFT_READY');
  assert.equal(item.social_status.Thread, 'DRAFT_READY');
  assert.equal(item.social_status['Instagram Carousel'], 'DRAFT_READY');
  assert.equal(item.social_status.Reel, 'DRAFT_READY');
  assert.equal(item.social_status['YouTube Short'], 'DRAFT_READY');
});

test('UNKNOWN or REVIEW_REQUIRED rights never permit site admission', () => {
  for (const rights_status of ['UNKNOWN', 'REVIEW_REQUIRED']) {
    const item = normalizeControlItem({master:{...master,status:'HUMAN_APPROVED',web_route:{quality_status:'PASS'},article_quality:{professional_output_ready:true},rights_status,site_admission:'APPROVED_FOR_SITE'}});
    assert.equal(canSiteAdmit(item), false);
    assert.notEqual(item.site_admission, 'APPROVED_FOR_SITE');
  }
});
