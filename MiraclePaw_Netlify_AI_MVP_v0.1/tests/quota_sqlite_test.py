"""Offline real SQLite execution of the exact production reservation SQL.
Uses a file-backed DB and independent connections/threads. Not a D1 deployment test.
Run: python3 tests/quota_sqlite_test.py
"""
import concurrent.futures
from contextlib import closing
from pathlib import Path
import re
import sqlite3
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
SQL = re.search(r"export const RESERVE_SQL = `([^`]+)`;", (ROOT / 'netlify/lib/quota.mjs').read_text()).group(1)
SCHEMA = (ROOT / 'netlify/quota/schema.sql').read_text()
WINDOW = '00000000-0000-4000-8000-000000000001'

class QuotaSqlTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db = str(Path(self.temp.name) / 'quota.sqlite')
        with closing(sqlite3.connect(self.db)) as conn, conn:
            conn.executescript(SCHEMA)
    def tearDown(self):
        self.temp.cleanup()
    def seed(self, start=None, end=None, used=0):
        now = int(time.time())
        with closing(sqlite3.connect(self.db)) as conn, conn:
            conn.execute('INSERT INTO ai_quota VALUES(1,?,?,?,?,?,?)', (WINDOW,'phase5e3-v1', now-10 if start is None else start, now+1500 if end is None else end,used,used*100))
    def reserve(self, window=WINDOW, duration='65'):
        with closing(sqlite3.connect(self.db, timeout=30)) as conn, conn:
            row = conn.execute(SQL,(window,duration)).fetchone()
            return row
    def counts(self):
        with closing(sqlite3.connect(self.db)) as conn, conn:
            return conn.execute('SELECT admissions,reserved_hkd_cents FROM ai_quota').fetchone()
    def test_concurrent_100_mixed_route_admissions(self):
        self.seed()
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
            rows = list(pool.map(lambda i:self.reserve(duration='65' if i%2 else '41'),range(100)))
        granted = [row for row in rows if row is not None]
        self.assertEqual(len(granted),20)
        self.assertEqual(sorted(row[4] for row in granted),list(range(1,21)))
        self.assertEqual(self.counts(),(20,2000))
        self.assertIsNone(self.reserve())
        self.assertEqual(self.counts(),(20,2000))
    def test_no_auto_seed(self):
        self.assertIsNone(self.reserve())
        self.assertIsNone(self.counts())
    def test_wrong_window(self):
        self.seed()
        self.assertIsNone(self.reserve(window='other'))
        self.assertEqual(self.counts(),(0,0))
    def test_expired(self):
        now=int(time.time()); self.seed(now-100,now-1)
        self.assertIsNone(self.reserve()); self.assertEqual(self.counts(),(0,0))
    def test_future(self):
        now=int(time.time()); self.seed(now+120,now+600)
        self.assertIsNone(self.reserve()); self.assertEqual(self.counts(),(0,0))
    def test_insufficient_time_remaining(self):
        now=int(time.time()); self.seed(now-10,now+30)
        self.assertIsNone(self.reserve(duration='41')); self.assertIsNone(self.reserve(duration='65'))
        self.assertEqual(self.counts(),(0,0))
    def test_no_second_window_row(self):
        self.seed()
        with self.assertRaises(sqlite3.IntegrityError): self.seed()
    def test_schema_budget_duration_and_counter_constraints(self):
        now=int(time.time())
        for start,end,used in [(now,now+1801,0),(now,now-1,0),(now,now+100,21),(now,now+100,-1)]:
            with self.assertRaises(sqlite3.IntegrityError): self.seed(start,end,used)
        self.seed()
        with closing(sqlite3.connect(self.db)) as conn, conn:
            with self.assertRaises(sqlite3.IntegrityError): conn.execute('UPDATE ai_quota SET reserved_hkd_cents=99')
    def test_ambiguous_client_loss_is_not_refunded(self):
        self.seed(used=19)
        self.reserve()  # caller discards result; no refund query exists
        self.assertIsNone(self.reserve())
        self.assertEqual(self.counts(),(20,2000))

if __name__ == '__main__': unittest.main(verbosity=2)
