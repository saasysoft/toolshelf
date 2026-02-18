-- ToolShelf.dev Initial Schema
-- Run this in Supabase SQL Editor

-- ======================
-- CATEGORIES TABLE
-- ======================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  tool_count integer DEFAULT 0
);

-- ======================
-- TOOLS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL REFERENCES categories(slug),
  subcategories text[] DEFAULT '{}',
  website_url text,
  github_url text,
  npm_url text,
  pypi_url text,
  logo_url text,
  screenshot_urls text[] DEFAULT '{}',

  -- GitHub metrics
  github_stars integer DEFAULT 0,
  github_forks integer DEFAULT 0,
  github_issues integer DEFAULT 0,
  commit_frequency text,
  contributor_count integer DEFAULT 0,
  last_commit timestamptz,
  last_release text,
  last_release_date timestamptz,

  -- Enriched metadata
  quality_score integer DEFAULT 0,
  maintenance text DEFAULT 'unknown',
  install_difficulty text DEFAULT 'moderate',
  pricing text DEFAULT 'free',
  license text,
  languages text[] DEFAULT '{}',
  platforms text[] DEFAULT '{}',
  works_with text[] DEFAULT '{}',
  alternative_to text[] DEFAULT '{}',

  -- Package metrics
  npm_weekly_downloads integer,
  pypi_monthly_downloads integer,

  -- Content
  readme_quality integer,
  has_docs_site boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  featured boolean DEFAULT false
);

-- ======================
-- COLLECTIONS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  tool_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ======================
-- INDEXES
-- ======================
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_quality_score ON tools(quality_score DESC);
CREATE INDEX idx_tools_featured ON tools(featured) WHERE featured = true;
CREATE INDEX idx_tools_maintenance ON tools(maintenance);
CREATE INDEX idx_tools_pricing ON tools(pricing);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- ======================
-- FULL-TEXT SEARCH
-- ======================
ALTER TABLE tools ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX idx_tools_fts ON tools USING gin(fts);

-- ======================
-- ROW LEVEL SECURITY
-- ======================
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON collections FOR SELECT USING (true);

-- ======================
-- UPDATED_AT TRIGGER
-- ======================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ======================
-- CATEGORY TOOL COUNT FUNCTION
-- ======================
CREATE OR REPLACE FUNCTION refresh_category_counts()
RETURNS void AS $$
BEGIN
  UPDATE categories c
  SET tool_count = (
    SELECT count(*) FROM tools t WHERE t.category = c.slug
  );
END;
$$ LANGUAGE plpgsql;
