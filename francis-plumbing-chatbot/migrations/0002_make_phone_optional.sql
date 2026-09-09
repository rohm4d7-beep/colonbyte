-- Phone was NOT NULL, but a caller can now decline to share one and still
-- submit a request — rebuild the table with phone nullable (SQLite has no
-- direct ALTER COLUMN DROP NOT NULL).
CREATE TABLE leads_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  service TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_callback_time TEXT,
  is_emergency INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

INSERT INTO leads_new SELECT * FROM leads;

DROP TABLE leads;
ALTER TABLE leads_new RENAME TO leads;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
