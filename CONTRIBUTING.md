# Contribution and verification contract

1. Read `README.md`, `docs/REPOSITORY_GOVERNANCE.md` and the current Google Drive operations handoff.
2. Inspect `git status --porcelain` and identify the exact canonical source revision. Never reset, clean or overwrite a dirty tree.
3. Make one bounded change in an isolated candidate. Prefer reuse, repair and adaptation over a new engine.
4. Run `npm test` and `npm run repo:health` locally. Run `npm run check`, `npm run build` and real browser QA on supported Linux. Static regex tests are not browser evidence.
5. Preserve source provenance, test command/exit code, accessibility, rights and security implications. Verify private editorial/adapter material does not leak into the public bundle.
6. Obtain independent E08 QA before acceptance. Publication, merge, deployment and destructive cleanup require their own explicit approval.
7. Record exact files, revision, test logs, unresolved conflicts and recovery in the canonical Drive operations document; read back the write.

No credentials in commits, docs, logs or artifacts. A successful unit test is not a production release.
