-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Public insert" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- No public read access
CREATE POLICY "No public read" ON newsletter_subscribers
  FOR SELECT USING (false);
