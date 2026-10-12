#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const repo = resolve(root, '..');
const issues = [];
const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  if (!ok) issues.push(name);
};
const read = (p) => readFileSync(join(repo, p), 'utf8');
const pkg = JSON.parse(read('hpfootball-site/package.json'));
check('locked dependencies', existsSync(join(root, 'package-lock.json')), 'package-lock.json exists');
check('node version policy', existsSync(join(root, '.nvmrc')), '.nvmrc exists');
check('readme entrypoint', existsSync(join(repo, 'README.md')), 'root README exists');
check('contributor guidance', existsSync(join(repo, 'CONTRIBUTING.md')), 'root CONTRIBUTING exists');
check('recovery and ownership', existsSync(join(repo, 'docs/REPOSITORY_GOVERNANCE.md')), 'governance contract exists');
check('automated acceptance', existsSync(join(repo, '.github/workflows/hp-football-linux-acceptance.yml')), 'Linux CI workflow exists');
// The intent is "no dependency tree committed to git". A real node_modules created by
// `npm ci` (Linux CI, Cloud Shell) is expected; Termux symlinks it. Both are fine when ignored.
const ignored = (p) => existsSync(join(repo, p)) && /^\/?node_modules\/?$/m.test(read(p));
check('no accidental dependency tree', !existsSync(join(repo, 'node_modules')) && (ignored('.gitignore') || ignored('hpfootball-site/.gitignore')), 'node_modules is git-ignored; none at repository root');
check('private package', pkg.private === true, 'package private=true');
check('test script', typeof pkg.scripts?.test === 'string', 'test script configured');
const prod = read('.github/workflows/hpanalytic-production-deploy.yml');
check('deployment branch guarded', prod.includes("github.ref == 'refs/heads/site-hp-standard-v2'"), 'deployment conditional guard exists; manual approval separately required');
const report = { schema: 'hp-repo-health/v1', scope: 'static structural checks only; NOT build, security or production acceptance', checks, result: issues.length ? 'FAIL' : 'PASS' };
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
process.exitCode = issues.length ? 1 : 0;
