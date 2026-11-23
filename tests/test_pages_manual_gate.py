import unittest
from pathlib import Path

WORKFLOW=Path(__file__).resolve().parents[1]/".github/workflows/deploy.yml"

class PagesPublicationGateTest(unittest.TestCase):
    def test_no_push_auto_deploy(self):
        s=WORKFLOW.read_text()
        header=s.split("\npermissions:",1)[0]
        self.assertNotIn("  push:", header, "main push must not trigger pages deployment")
    def test_manual_release_requires_explicit_false_default(self):
        s=WORKFLOW.read_text()
        self.assertIn("workflow_dispatch:",s)
        self.assertIn("release_approved:",s)
        self.assertIn("default: false",s)
        self.assertIn("type: boolean",s)
    def test_build_and_deploy_guarded_by_manual_approval(self):
        s=WORKFLOW.read_text()
        self.assertGreaterEqual(s.count("github.ref == 'refs/heads/main'"),2)
        self.assertGreaterEqual(s.count("inputs.release_approved == true"),2)
        self.assertIn("node scripts/release-security-gate.mjs dist",s)

    def test_immutable_dependencies_and_least_privilege(self):
        s=WORKFLOW.read_text()
        self.assertIn("npm ci --no-audit --no-fund",s)
        self.assertNotIn("npm install",s)
        self.assertIn("  deploy:\n    permissions:\n      pages: write\n      id-token: write",s)
        self.assertIn("permissions:\n  contents: read",s)

if __name__=="__main__":unittest.main()
