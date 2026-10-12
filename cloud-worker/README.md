# Cloud Drive Worker v1

Isolated manual GitHub Actions worker; never deploys the website.

## Preconditions
1. Create a Google Cloud service account and enable Google Drive API.
2. Share the dedicated output folder with the service account email as Editor.
3. Add repository Actions secret `GDRIVE_SERVICE_ACCOUNT_JSON` with the service account JSON (never commit it).
4. Add repository Actions variable `GDRIVE_OUTPUT_FOLDER_ID` = `1PTRshZIBwfivaaBOrTl1EcOv7HaAYfuz`.
5. Run **Cloud Drive Worker (isolated)** manually with task `connectivity` from the workflow branch.

This worker uses Drive's `drive.file` scope. Shared-folder visibility for service accounts and file ownership can depend on Google Workspace policies; if the API rejects folder access, verify service account permissions and account restrictions. No secret is logged. The workflow fails closed if authentication or upload is unavailable.

## Acceptance
A successful GitHub Actions job **and** a `cloud-worker-connectivity.json` file appearing in the dedicated Drive folder are both required. Neither is yet verified.

## Local tests
`python -m unittest discover -s cloud-worker -p 'test_*.py'`
