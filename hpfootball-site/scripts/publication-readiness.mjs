#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root = new URL('../', import.meta.url);
const dir = new URL('../src/content/articles/', import.meta.url);
const published = [];
const blocked = [];
for (const filename of readdirSync(dir).filter(f => f.endsWith('.md'))) {
  const source = readFileSync(new URL(filename, dir), 'utf8');
  const fm = source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = key => fm.match(new RegExp('^' + key + ':\\s*(.*)$','m'))?.[1]?.trim()?.replace(/^['"]|['"]$/g,'');
  const missing = ['title','description','date','section','evidenceClass','claimCeiling'].filter(key => !field(key));
  const images = [...source.matchAll(/!\[[^\]]*\]\((\/[^\s)]+)(?:\s+[^)]*)?\)/g)].map(m => m[1]);
  const absentAssets = images.filter(p => !existsSync(new URL('../public' + p, import.meta.url)));
  const approval = field('editorial_status') === 'PUBLISHED' && field('qualityStatus') === 'HUMAN_APPROVED' && field('sourceClaimsValidated') === 'true';
  const row = {id: filename.slice(0,-3), title: field('title'), approved: approval, missing, absentAssets, images:images.length};
  (approval && !missing.length && !absentAssets.length ? published : blocked).push(row);
}
const result = {status: blocked.some(x=>x.approved) ? 'BLOCKED_APPROVED_CONTENT' : 'AUDIT_COMPLETE', publishable: published, blocked, counts:{publishable:published.length,blocked:blocked.length}};
console.log(JSON.stringify(result,null,2));
if(result.status==='BLOCKED_APPROVED_CONTENT')process.exitCode=1;
