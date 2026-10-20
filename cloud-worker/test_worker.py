import unittest
from worker import make_report


class WorkerTests(unittest.TestCase):
    def test_connectivity_report_is_safe(self):
        result = make_report("connectivity")
        self.assertEqual(result["status"], "completed")
        self.assertFalse(result["production_modified"])
        self.assertEqual(result["source"], "github-actions")

    def test_rejects_unapproved_task(self):
        with self.assertRaises(ValueError):
            make_report("deploy")


if __name__ == "__main__":
    unittest.main()
