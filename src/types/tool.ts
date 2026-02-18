export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  subcategories: string[];
  website_url: string | null;
  github_url: string | null;
  npm_url: string | null;
  pypi_url: string | null;
  logo_url: string | null;
  screenshot_urls: string[];
  github_stars: number;
  github_forks: number;
  github_issues: number;
  commit_frequency: string | null;
  contributor_count: number;
  last_commit: string | null;
  last_release: string | null;
  last_release_date: string | null;
  quality_score: number;
  maintenance: 'active' | 'slowing' | 'stale' | 'abandoned' | 'unknown';
  install_difficulty: 'easy' | 'moderate' | 'advanced';
  pricing: 'free' | 'freemium' | 'paid' | 'open-source';
  license: string | null;
  languages: string[];
  platforms: string[];
  works_with: string[];
  alternative_to: string[];
  npm_weekly_downloads: number | null;
  pypi_monthly_downloads: number | null;
  readme_quality: number | null;
  has_docs_site: boolean;
  created_at: string;
  updated_at: string;
  featured: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  tool_count: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tool_ids: string[];
  created_at: string;
}

export type SortOption = 'quality_score' | 'github_stars' | 'name' | 'created_at';
export type MaintenanceStatus = Tool['maintenance'];
export type PricingType = Tool['pricing'];
export type InstallDifficulty = Tool['install_difficulty'];

export interface ToolFilters {
  category?: string;
  languages?: string[];
  platforms?: string[];
  maintenance?: MaintenanceStatus[];
  pricing?: PricingType[];
  minScore?: number;
  maxScore?: number;
  sort?: SortOption;
  q?: string;
}
