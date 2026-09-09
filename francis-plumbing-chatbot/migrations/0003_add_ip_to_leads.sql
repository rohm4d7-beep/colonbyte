ALTER TABLE leads ADD COLUMN ip TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_ip_created_at ON leads (ip, created_at DESC);
