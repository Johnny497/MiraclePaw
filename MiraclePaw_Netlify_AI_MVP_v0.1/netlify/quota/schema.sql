-- Apply manually to a dedicated private quota database only, after approval.
-- No active test window is created automatically. Never seed on app startup.
CREATE TABLE IF NOT EXISTS ai_quota (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  window_id TEXT NOT NULL CHECK (length(window_id) = 36),
  policy TEXT NOT NULL CHECK (policy = 'phase5e3-v1'),
  starts_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > starts_at AND expires_at - starts_at <= 1800),
  admissions INTEGER NOT NULL DEFAULT 0 CHECK (admissions BETWEEN 0 AND 20),
  reserved_hkd_cents INTEGER NOT NULL DEFAULT 0 CHECK (reserved_hkd_cents BETWEEN 0 AND 2000 AND reserved_hkd_cents = admissions * 100)
) STRICT;
