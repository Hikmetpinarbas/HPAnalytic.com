# HPAnalytic.com — Public security and Linux CI evidence (2026-10-12)

Scope: HPAnalytic.com only. No production deployment.

- Remote GitHub branches enumerated: 11. Fetched all branch refs to local clone. Git object reachability count: 132 commits, Gitleaks scanned 120 commits (tool reports scan coverage separately).
- Gitleaks history scan completed with 0 findings; report kept locally and not published. Additional historical path name screening for .env, key, PEM, credentials, tokens, billing, .npmrc: no matches. Default-branch pattern scan: no suspicious files flagged. Automated scans do not guarantee absence of all secrets.
- User expressly authorized PUBLIC contingent on security audit. Repository visibility changed to PUBLIC and verified with GitHub connector.
- Isolated QA commit acf061ff01c19cd7113b8b0e1672d9308606187c uses hpfootball-site/ working directory, npm cache lockfile path, fail-closed source checks, manual dispatch, no deploy.
- GitHub-hosted Ubuntu Actions run 38183702403: QA job success; npm ci, npm test --if-present, npm run build executed. https://github.com/Hikmetpinarbas/HPAnalytic.com/actions/runs/38183702403
- GitHub-hosted runner execution demonstrates CI does not depend on phone/RDC while running. Recurring unattended schedule has NOT been installed. Site production release remains blocked pending separate user approval.
