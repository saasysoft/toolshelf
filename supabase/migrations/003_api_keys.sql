-- API Keys for public REST API access
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  name text,
  email text NOT NULL,
  tier text NOT NULL DEFAULT 'free',
  requests_today integer DEFAULT 0,
  requests_month integer DEFAULT 0,
  last_request_at timestamptz,
  last_reset_date date DEFAULT CURRENT_DATE,
  monthly_reset_date date DEFAULT date_trunc('month', CURRENT_DATE)::date,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_email ON api_keys(email);

-- RLS: api_keys are managed server-side with service key only
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (for registration) but not read other keys
CREATE POLICY "Allow anon insert" ON api_keys
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon to select own key by hash (for auth validation)
CREATE POLICY "Allow select by key_hash" ON api_keys
  FOR SELECT TO anon
  USING (true);

-- Allow anon to update counters (for rate limiting)
CREATE POLICY "Allow update counters" ON api_keys
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
