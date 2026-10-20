"""Isolated Google Drive delivery worker. No production deployment."""
import json
import os
import sys
from datetime import datetime, timezone


def make_report(task):
    if task != "connectivity":
        raise ValueError("Only the connectivity task is permitted in v1")
    return {
        "schema_version": 1,
        "task": task,
        "status": "completed",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "github-actions",
        "production_modified": False,
    }


def main():
    task = os.environ.get("WORKER_TASK", "connectivity")
    report = make_report(task)
    credentials_json = os.environ["GDRIVE_SERVICE_ACCOUNT_JSON"]
    folder_id = os.environ["GDRIVE_OUTPUT_FOLDER_ID"]
    if not folder_id.strip():
        raise ValueError("Missing output folder ID")
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaInMemoryUpload

    credentials = service_account.Credentials.from_service_account_info(
        json.loads(credentials_json),
        scopes=["https://www.googleapis.com/auth/drive.file"],
    )
    service = build("drive", "v3", credentials=credentials, cache_discovery=False)
    body = json.dumps(report, ensure_ascii=False, indent=2).encode("utf-8")
    media = MediaInMemoryUpload(body, mimetype="application/json", resumable=False)
    result = service.files().create(
        body={"name": "cloud-worker-connectivity.json", "parents": [folder_id]},
        media_body=media,
        fields="id,name,webViewLink",
    ).execute()
    print(json.dumps({"uploaded": True, "file_id": result["id"], "name": result["name"]}))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Cloud worker failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        sys.exit(1)
