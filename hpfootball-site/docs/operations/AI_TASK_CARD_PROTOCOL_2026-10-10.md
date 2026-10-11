# HPAnalytic — AI Task Card Handoff Protocol
STATUS: CANDIDATE / LOCAL ONLY. No external agent ACK claimed.
Canonical site repo: ~/HPA_SITE_DEV/HP-PROJELERI/hpfootball-site
Existing shared task queue (Drive): https://docs.google.com/document/d/1x5hEqtMb4_apJQJAc1xIl4I2ZMZA4oPKAd19vFDVF6A/edit
Existing operator hub (Drive): https://docs.google.com/document/d/1sVd7VXzO7yCj00_LAh7mcLE5bIWE7tbmzDEwYrH2HGA/edit
Existing main coordinator (Drive): https://docs.google.com/document/d/1Ni4uRQToo4wQMsfgRb3Cjv2CvCWbODQSHmW5PKFQR8E/edit

## Contract
ChatGPT issues a compact card containing TASK_ID, TARGET_AGENT, SOURCE, INSTRUCTION_PATH, OUTPUT_PATH, SCOPE, STATUS and ACCEPTANCE.
The receiving agent must open the referenced task file itself, read the full instructions and current repository state, then ACK with exact task ID and evidence of access.
If the receiving agent cannot access Termux filesystem or Drive, it must say BLOCKED and ask for the file content/access; it must NOT pretend to have read it.
The operator should work in the designated source of record, avoid parallel conflicting writes, preserve existing dirty tree and all untracked files.
The agent writes results in its own versioned result file and appends a concise RESULT/BLOCKER message to the existing shared queue only when it has actual write access and revision-safe protocol.
Do not claim another agent has received or started a task until it explicitly ACKs.
No production deployment, push/merge, destructive cleanup, spending or publication without required authorization.

## First card
TASK_ID: HPWEB-CLAUDE-REPO-20261010-001
TARGET_AGENT: Claude Code
SOURCE: Termux local site repo
INSTRUCTION_PATH: docs/operations/INTERNATIONAL_ARCHITECTURE_AND_CLAUDE_CODE_HANDOFF_2026-10-10.md
OUTPUT_PATH: docs/operations/results/HPWEB-CLAUDE-REPO-20261010-001_RESULT.md
STATUS: READY_FOR_EXTERNAL_HANDOFF / NOT_ACKED
ACCEPTANCE: verified isolated audit, path-by-path disposition, reproducible tests, no mutation of original dirty tree, precise SHA and blockers.
