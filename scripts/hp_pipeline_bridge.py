#!/usr/bin/env python3
"""Site-side adapter to existing HP_WORKSPACE verified production artery.

This is deliberately a review-only contract. It can trigger the established
pipeline but NEVER writes to site content/public, builds the live site, or publishes.
"""
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HOME=Path.home()
CENTER=HOME/"HP_WORKSPACE/COMMAND_CENTER"
ARTERY=CENTER/"main_artery.py"
SOURCE=CENTER/"results/pilots"
INTEGRATED=CENTER/"results/integrated_production"
HANDOFF=CENTER/"results/site_handoff"
SUPPORTED=("galatasaray-stuttgart","fenerbahce-liverpool","celtic-besiktas")

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def inspect(match):
    if match not in SUPPORTED:raise ValueError("UNREGISTERED_MATCH")
    # A stale stage must never be reported as source-verified.
    if str(CENTER) not in sys.path:sys.path.insert(0,str(CENTER))
    from independent_pilot_qa import verify as verify_raw_sources
    fresh=verify_raw_sources(match)
    if (fresh["source_identity"]!="PASS" or fresh["output_identity"]!="PASS"
            or fresh["publication_authorized"] is not False):
        raise ValueError("FRESH_SOURCE_VERIFICATION_FAILED")
    pilot=SOURCE/match
    integrated=INTEGRATED/match
    handoff=HANDOFF/match
    for root in (pilot,integrated,handoff):
        if not root.is_dir() or root.is_symlink():raise ValueError("MISSING_VERIFIED_STAGE")
    analysis=json.loads((pilot/"analysis_package.json").read_text())
    integrate=json.loads((integrated/"integrated_manifest.json").read_text())
    integrate_accept=json.loads((integrated/"acceptance.json").read_text())
    rendered=json.loads((handoff/"site_handoff_manifest.json").read_text())
    if any(x.get("publication_authorized") is not False for x in (analysis,integrate,integrate_accept,rendered)):
        raise ValueError("PUBLICATION_AUTHORITY_VIOLATION")
    if not all(x["match_key"]==match for x in (analysis,integrate,integrate_accept,rendered)):
        raise ValueError("MATCH_KEY_DRIFT")
    if not (analysis["source_receipt_sha256"]==integrate["source_receipt_sha256"]==rendered["source_receipt_sha256"]):
        raise ValueError("SOURCE_HASH_DRIFT")
    if rendered["source_article_sha256"]!=integrate_accept["outputs"]["analysis_draft.md"]:
        raise ValueError("ARTICLE_LINEAGE_DRIFT")
    if rendered["site_renderer_sha256"]!=digest(HOME/"hpanalytic-repo/scripts/build-yazi.mjs"):
        raise ValueError("SITE_RENDERER_VERSION_DRIFT")
    for base,items in ((integrated,integrate_accept["outputs"]),(handoff,rendered["outputs_sha256"])):
        for name,expected in items.items():
            file=base/name
            if file.is_symlink() or file.resolve().parent!=base.resolve() or digest(file)!=expected:
                raise ValueError("ARTIFACT_TAMPERED:"+name)
    if not (rendered["site_builder_executed"] and rendered["site_repo_mutated"] is False):
        raise ValueError("SHADOW_RENDERER_CONTRACT_FAILED")
    return {"schema":"HPANALYTIC_PARALLEL_SITE_ENTRY_v1",
            "match_key":match,
            "status":"REVIEW_REQUIRED",
            "source_verified":True,"site_render_verified":True,
            "site_article_preview":str(handoff/"article_site_preview.html"),
            "visual_bundle_preview":str(handoff/"article_viz_bundle.js"),
            "analysis_json":str(pilot/"analysis_package.json"),
            "unresolved_metric_cells":analysis["unresolved_metric_cells"],
            "physical_event_verified":False,
            "site_repo_mutated":False,
            "publication_authorized":False}

def run(match):
    if match not in SUPPORTED:raise ValueError("UNREGISTERED_MATCH")
    if not ARTERY.is_file():raise ValueError("MISSING_MAIN_ARTERY")
    command=[sys.executable,str(ARTERY),match]
    subprocess.run(command,cwd=CENTER,check=True,capture_output=True,text=True,timeout=120)
    return inspect(match)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("match",choices=SUPPORTED)
    p.add_argument("--run",action="store_true",help="Run source QA and shadow site renderer; never publish")
    args=p.parse_args()
    try:
        result=run(args.match) if args.run else inspect(args.match)
    except (ValueError,OSError,subprocess.SubprocessError,KeyError) as exc:
        print(json.dumps({"status":"BLOCKED","error_type":type(exc).__name__,
                          "publication_authorized":False},ensure_ascii=False))
        raise SystemExit(2)
    print(json.dumps(result,ensure_ascii=False))
