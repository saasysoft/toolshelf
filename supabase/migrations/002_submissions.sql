CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  github_url text,
  category text,
  submitted_by text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "No public read" ON submissions FOR SELECT USING (false);
