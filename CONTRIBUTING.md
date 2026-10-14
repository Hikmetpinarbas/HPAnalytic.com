# Contribution and verification contract

1. Read `README.md`, `docs/REPOSITORY_GOVERNANCE.md` and the current Google Drive operator handoff.
2. Start from the canonical integration branch named in `docs/REPOSITORY_GOVERNANCE.md`. Check `git status --porcelain` first; never reset, clean or overwrite a dirty tree.
3. Make one bounded change on its own branch. Prefer reuse, repair and adaptation over a new engine.
4. Run `npm test` locally. Run `npm run check`, `npm run build` and real browser QA on supported Linux (the acceptance workflow). Regex source tests are not browser evidence.
5. Record source provenance, test commands and exit codes, accessibility, rights and security implications. Confirm private studio material does not reach the public bundle.
6. Get independent QA before acceptance. Publication, merge to the production branch, deployment and destructive cleanup each need their own explicit approval.
7. Record files, revision, test logs, open conflicts and recovery steps in the Drive operations document.

No credentials in commits, docs, logs or artifacts. A passing unit test is not a production release.
