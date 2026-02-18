/**
 * Seed Enrichment Script
 *
 * Reads seed-tools.json, enriches each tool via:
 * - GitHub API (using `gh api`) for stars, forks, issues, contributors, last commit, release, license, languages
 * - npm registry for weekly downloads
 * - PyPI stats for monthly downloads
 * - Computes quality score
 *
 * Usage: npx tsx scripts/enrich-seed.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface SeedTool {
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  category: string;
  subcategories?: string[];
  website_url?: string;
  github_url?: string;
  npm_url?: string;
  pypi_url?: string;
  pricing: string;
  license?: string;
  languages?: string[];
  platforms?: string[];
  works_with?: string[];
  alternative_to?: string[];
  install_difficulty?: string;
  featured?: boolean;
}

interface EnrichedTool extends SeedTool {
  github_stars: number;
  github_forks: number;
  github_issues: number;
  contributor_count: number;
  last_commit: string | null;
  last_release: string | null;
  last_release_date: string | null;
  commit_frequency: string | null;
  npm_weekly_downloads: number | null;
  pypi_monthly_downloads: number | null;
  quality_score: number;
  maintenance: string;
  readme_quality: number | null;
  has_docs_site: boolean;
}

function ghApi(endpoint: string): unknown | null {
  try {
    const result = execSync(`gh api ${endpoint} 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 15000,
    });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function extractOwnerRepo(githubUrl: string): string | null {
  const match = githubUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) return null;
  return match[1].replace(/\.git$/, '');
}

function getCommitFrequency(lastCommitDate: string | null): string {
  if (!lastCommitDate) return 'rarely';
  const diff = Date.now() - new Date(lastCommitDate).getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 7) return 'daily';
  if (days < 30) return 'weekly';
  if (days < 90) return 'monthly';
  return 'rarely';
}

function getMaintenanceStatus(lastCommitDate: string | null, frequency: string): string {
  if (!lastCommitDate) return 'unknown';
  const days = (Date.now() - new Date(lastCommitDate).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 90 && (frequency === 'daily' || frequency === 'weekly')) return 'active';
  if (days < 180) return 'slowing';
  if (days < 365) return 'stale';
  return 'abandoned';
}

function normalize(value: number, max: number): number {
  return Math.min(value / max, 1);
}

function commitRecencyScore(lastCommit: string | null): number {
  if (!lastCommit) return 0;
  const days = (Date.now() - new Date(lastCommit).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return 1;
  if (days < 30) return 0.8;
  if (days < 90) return 0.6;
  if (days < 180) return 0.3;
  if (days < 365) return 0.1;
  return 0;
}

function computeQualityScore(tool: Partial<EnrichedTool>): number {
  const github = normalize(tool.github_stars || 0, 50000) * 25;
  const activity = commitRecencyScore(tool.last_commit || null) * 20;
  const community = normalize(tool.contributor_count || 0, 100) * 15;
  const docs = (tool.readme_quality || 50) * 0.15;
  const downloads = normalize((tool.npm_weekly_downloads || 0) + (tool.pypi_monthly_downloads || 0), 1000000) * 15;
  const social = 5; // placeholder

  return Math.min(100, Math.round(github + activity + community + docs + downloads + social));
}

async function fetchNpmDownloads(npmUrl: string): Promise<number | null> {
  const match = npmUrl.match(/npmjs\.com\/package\/(.+)/);
  if (!match) return null;
  const pkg = match[1];
  try {
    const res = execSync(`curl -sf "https://api.npmjs.org/downloads/point/last-week/${pkg}" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    const data = JSON.parse(res);
    return data.downloads || null;
  } catch {
    return null;
  }
}

async function fetchPypiDownloads(pypiUrl: string): Promise<number | null> {
  const match = pypiUrl.match(/pypi\.org\/project\/(.+?)\/?$/);
  if (!match) return null;
  const pkg = match[1];
  try {
    const res = execSync(`curl -sf "https://pypistats.org/api/packages/${pkg}/recent" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    const data = JSON.parse(res);
    return data.data?.last_month || null;
  } catch {
    return null;
  }
}

async function enrichTool(seed: SeedTool): Promise<EnrichedTool> {
  const enriched: EnrichedTool = {
    ...seed,
    github_stars: 0,
    github_forks: 0,
    github_issues: 0,
    contributor_count: 0,
    last_commit: null,
    last_release: null,
    last_release_date: null,
    commit_frequency: null,
    npm_weekly_downloads: null,
    pypi_monthly_downloads: null,
    quality_score: 0,
    maintenance: 'unknown',
    readme_quality: null,
    has_docs_site: false,
  };

  // GitHub enrichment
  if (seed.github_url) {
    const ownerRepo = extractOwnerRepo(seed.github_url);
    if (ownerRepo) {
      console.log(`  GitHub: ${ownerRepo}`);
      const repo = ghApi(`repos/${ownerRepo}`) as Record<string, unknown> | null;
      if (repo) {
        enriched.github_stars = (repo.stargazers_count as number) || 0;
        enriched.github_forks = (repo.forks_count as number) || 0;
        enriched.github_issues = (repo.open_issues_count as number) || 0;
        enriched.last_commit = (repo.pushed_at as string) || null;
        enriched.license = enriched.license || (repo.license as Record<string, string>)?.spdx_id || undefined;
        enriched.has_docs_site = !!(repo.homepage as string);

        // Languages
        const langs = ghApi(`repos/${ownerRepo}/languages`) as Record<string, number> | null;
        if (langs) {
          enriched.languages = enriched.languages?.length
            ? enriched.languages
            : Object.keys(langs).map((l) => l.toLowerCase()).slice(0, 5);
        }

        // Contributors count
        const contribs = ghApi(`repos/${ownerRepo}/contributors?per_page=1&anon=true`) as unknown[] | null;
        if (Array.isArray(contribs)) {
          // GitHub returns Link header with total, but gh api doesn't expose it easily
          // Approximate from the repo's contributor_count if available
          enriched.contributor_count = (repo.subscribers_count as number) || contribs.length;
        }

        // Latest release
        const releases = ghApi(`repos/${ownerRepo}/releases?per_page=1`) as Record<string, unknown>[] | null;
        if (releases && releases.length > 0) {
          enriched.last_release = (releases[0].tag_name as string) || null;
          enriched.last_release_date = (releases[0].published_at as string) || null;
        }
      }

      enriched.commit_frequency = getCommitFrequency(enriched.last_commit);
      enriched.maintenance = getMaintenanceStatus(enriched.last_commit, enriched.commit_frequency);
    }
  }

  // npm downloads
  if (seed.npm_url) {
    console.log(`  npm: ${seed.npm_url}`);
    enriched.npm_weekly_downloads = await fetchNpmDownloads(seed.npm_url);
  }

  // PyPI downloads
  if (seed.pypi_url) {
    console.log(`  PyPI: ${seed.pypi_url}`);
    enriched.pypi_monthly_downloads = await fetchPypiDownloads(seed.pypi_url);
  }

  // Default readme quality estimate based on has_docs_site
  enriched.readme_quality = enriched.has_docs_site ? 75 : 50;

  // Quality score
  enriched.quality_score = computeQualityScore(enriched);

  return enriched;
}

async function main() {
  const seedPath = path.join(__dirname, '..', 'data', 'seed-tools.json');
  if (!fs.existsSync(seedPath)) {
    console.error(`Seed file not found: ${seedPath}`);
    process.exit(1);
  }

  const seeds: SeedTool[] = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`Enriching ${seeds.length} tools...\n`);

  const enriched: EnrichedTool[] = [];

  for (const seed of seeds) {
    console.log(`[${enriched.length + 1}/${seeds.length}] ${seed.name}`);
    try {
      const result = await enrichTool(seed);
      enriched.push(result);
      console.log(`  Score: ${result.quality_score} | Stars: ${result.github_stars} | Maintenance: ${result.maintenance}\n`);
    } catch (err) {
      console.error(`  ERROR: ${err}`);
      enriched.push({
        ...seed,
        github_stars: 0, github_forks: 0, github_issues: 0,
        contributor_count: 0, last_commit: null, last_release: null,
        last_release_date: null, commit_frequency: null,
        npm_weekly_downloads: null, pypi_monthly_downloads: null,
        quality_score: 10, maintenance: 'unknown',
        readme_quality: null, has_docs_site: false,
      });
    }
  }

  const outPath = path.join(__dirname, '..', 'data', 'enriched-tools.json');
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));
  console.log(`\nDone! Wrote ${enriched.length} enriched tools to ${outPath}`);
}

main().catch(console.error);
