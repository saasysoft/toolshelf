import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SOURCE_PATH =
  "C:/Dev/_PROJECTS/_WATCHED-FOR-ME/github-trending-collection/repos-with-metadata.json";
const SEED_PATH = resolve(__dirname, "../data/seed-tools.json");

interface RepoEntry {
  owner: string;
  repo: string;
  url: string;
  description: string | null;
  stars: number;
  language: string | null;
  last_updated: string;
  is_archived: boolean;
  is_fork: boolean;
  mention_count: number;
}

interface SeedTool {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  subcategories: string[];
  website_url: string;
  github_url: string;
  pricing: string;
  languages: string[];
  platforms: string[];
  works_with: string[];
  alternative_to: string[];
  install_difficulty: string;
  featured: boolean;
}

// Category classification by keyword matching on name + description
function classifyCategory(name: string, desc: string): string {
  const text = `${name} ${desc}`.toLowerCase();

  if (/\bmcp\b/.test(text)) return "mcp-servers";
  if (/\b(self[-\s]?host|selfhost|homelab)\b/.test(text)) return "self-hosted";
  if (/\b(cli|terminal|shell|\btui\b|command[-\s]?line)\b/.test(text)) return "cli-tools";
  if (/\b(ai|llm|agent|copilot|gpt|claude|openai|langchain|rag|embedding|diffusion|neural|machine.?learn|deep.?learn|transformer|prompt)\b/.test(text))
    return "ai-coding";
  if (/\b(docker|kubernetes|k8s|terraform|ansible|devops|ci[\s/]?cd|deploy|container|infrastructure)\b/.test(text))
    return "self-hosted";

  return "developer-productivity";
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function main() {
  // Load source repos
  const repos: RepoEntry[] = JSON.parse(readFileSync(SOURCE_PATH, "utf-8"));
  console.log(`Loaded ${repos.length} repos from source`);

  // Filter
  const filtered = repos.filter((r) => {
    if (r.is_archived) return false;
    if (r.is_fork) return false;
    if (!r.description || r.description.trim().length === 0) return false;
    if (r.stars < 50) return false;
    return true;
  });
  console.log(`After filtering (archived/fork/no-desc/<50 stars): ${filtered.length}`);

  // Map to SeedTool format
  const mapped: SeedTool[] = filtered.map((r) => {
    const slug = r.repo.toLowerCase();
    const desc = r.description!.trim();
    return {
      name: titleCase(r.repo),
      slug,
      tagline: desc.length > 120 ? desc.slice(0, 117) + "..." : desc,
      description: desc,
      category: classifyCategory(r.repo, desc),
      subcategories: [],
      website_url: r.url,
      github_url: r.url,
      pricing: "open-source",
      languages: r.language ? [r.language.toLowerCase()] : [],
      platforms: ["windows", "mac", "linux"],
      works_with: [],
      alternative_to: [],
      install_difficulty: "moderate",
      featured: false,
    };
  });

  // Dedup within import set — keep highest-star version per slug
  const starsByRepo = new Map<string, number>();
  for (const r of filtered) {
    const slug = r.repo.toLowerCase();
    starsByRepo.set(slug, Math.max(starsByRepo.get(slug) ?? 0, r.stars));
  }
  const seen = new Set<string>();
  const deduped: SeedTool[] = [];
  // Sort by stars desc so we keep the highest-star entry
  const sortedMapped = mapped
    .map((tool, i) => ({ tool, stars: filtered[i].stars }))
    .sort((a, b) => b.stars - a.stars);

  for (const { tool } of sortedMapped) {
    if (!seen.has(tool.slug)) {
      seen.add(tool.slug);
      deduped.push(tool);
    }
  }
  console.log(`After internal dedup: ${deduped.length}`);

  // Load existing seed tools and dedup against them
  const existing: SeedTool[] = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
  const existingSlugs = new Set(existing.map((t) => t.slug));
  console.log(`Existing seed tools: ${existing.length}`);

  const newTools = deduped.filter((t) => !existingSlugs.has(t.slug));
  console.log(`New tools after dedup against existing: ${newTools.length}`);

  // Category breakdown
  const catCounts: Record<string, number> = {};
  for (const t of newTools) {
    catCounts[t.category] = (catCounts[t.category] ?? 0) + 1;
  }
  console.log("\nCategory breakdown:");
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Merge and write
  const merged = [...existing, ...newTools];
  writeFileSync(SEED_PATH, JSON.stringify(merged, null, 2) + "\n");
  console.log(`\nWrote ${merged.length} total tools to seed-tools.json (+${newTools.length} new)`);
}

main();
