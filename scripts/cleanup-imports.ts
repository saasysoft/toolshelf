/**
 * Quick Win Cleanup Script
 *
 * 1. Remove low-quality tools (< 200 stars, except original 81)
 * 2. Add new categories and reclassify tools out of "developer-productivity"
 * 3. Improve short descriptions with richer context from metadata
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ENRICHED_PATH = resolve(__dirname, "../data/enriched-tools.json");
const SEED_PATH = resolve(__dirname, "../data/seed-tools.json");
const CATEGORIES_PATH = resolve(__dirname, "../data/seed-categories.json");

interface EnrichedTool {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  subcategories: string[];
  website_url: string;
  github_url: string;
  npm_url?: string;
  pypi_url?: string;
  pricing: string;
  license?: string;
  languages: string[];
  platforms: string[];
  works_with: string[];
  alternative_to: string[];
  install_difficulty: string;
  featured: boolean;
  github_stars?: number;
  github_forks?: number;
  github_open_issues?: number;
  github_last_commit?: string;
  npm_weekly_downloads?: number;
  pypi_monthly_downloads?: number;
  quality_score?: number;
  maintenance_status?: string;
  [key: string]: unknown;
}

// ── New categories ──────────────────────────────────────────────────────────

const NEW_CATEGORIES = [
  {
    slug: "data-tools",
    name: "Data & Database Tools",
    description:
      "Tools for working with databases, data pipelines, OCR, and structured data",
    icon: "🗃️",
    display_order: 6,
  },
  {
    slug: "devops-infra",
    name: "DevOps & Infrastructure",
    description:
      "Deployment, monitoring, containers, and infrastructure management tools",
    icon: "🚀",
    display_order: 7,
  },
  {
    slug: "security",
    name: "Security & Auth",
    description:
      "Authentication, encryption, vulnerability scanning, and security tools",
    icon: "🔒",
    display_order: 8,
  },
  {
    slug: "media-design",
    name: "Media & Design Tools",
    description:
      "Image, video, audio processing, UI frameworks, and design utilities",
    icon: "🎨",
    display_order: 9,
  },
  {
    slug: "automation",
    name: "Automation & Workflows",
    description:
      "Bots, scrapers, workflow engines, and task automation tools",
    icon: "⚙️",
    display_order: 10,
  },
];

// ── Category classification ─────────────────────────────────────────────────

function classifyCategory(tool: EnrichedTool): string {
  const text = `${tool.name} ${tool.description} ${tool.tagline}`.toLowerCase();
  const lang = (tool.languages || []).join(" ").toLowerCase();

  // MCP — keep existing
  if (/\bmcp\b/.test(text)) return "mcp-servers";

  // Security & Auth
  if (
    /\b(security|auth[^o]|oauth|encrypt|cipher|vault|credential|secret|firewall|honeypot|pentest|vulnerability|exploit|malware|virus|scanner|proxy.?check|leak.?detect)\b/.test(
      text
    )
  )
    return "security";

  // Data & Database
  if (
    /\b(database|sql|sqlite|postgres|mongo|redis|supabase|ocr|pdf.?to|data.?extract|data.?pipeline|etl|csv|excel|spreadsheet|bookkeep|invoice|ledger|accounting|financ)\b/.test(
      text
    )
  )
    return "data-tools";

  // DevOps & Infrastructure
  if (
    /\b(docker|kubernetes|k8s|terraform|ansible|deploy|ci[\s\/]?cd|container|infrastructure|monitor|uptime|grafana|prometheus|traefik|caddy|nginx|reverse.?proxy|load.?balanc|server.?manage|devops|helm|cluster|orchestrat|self[-\s]?host|selfhost|homelab|vpn|openvpn|wireguard|dns|ssl|certificate)\b/.test(
      text
    )
  )
    return "devops-infra";

  // Self-hosted — only if explicitly a full self-hosted app (not just infra)
  if (
    /\b(self[-\s]?hosted.*(app|platform|alternative)|alternative.*(google|slack|notion|trello|jira)|personal.*(manage|cloud|server)|home.?server)\b/.test(
      text
    )
  )
    return "self-hosted";

  // Media & Design
  if (
    /\b(image|video|audio|music|tts|speech|voice|media|photo|camera|screensaver|screenshot|thumbnail|diffusion|render|3d|animation|font|icon|color|palette|design.?system|ui.?kit|ui.?component|css.?framework|tailwind|theme|visual|canvas|svg|diagram|chart|graph.?viz|illustration|pixel)\b/.test(
      text
    )
  )
    return "media-design";

  // Automation & Workflows
  if (
    /\b(automat|workflow|scrape|crawl|bot|rpa|cron|schedul|webhook|n8n|zapier|pipeline|email.*(send|campaign)|notification|alert.*(system|service))\b/.test(
      text
    )
  )
    return "automation";

  // AI Coding
  if (
    /\b(ai|llm|agent|copilot|gpt|claude|openai|langchain|rag|embedding|diffusion|neural|machine.?learn|deep.?learn|transformer|prompt|fine.?tun|training|model|inference|token|hugging.?face)\b/.test(
      text
    )
  )
    return "ai-coding";

  // CLI Tools
  if (/\b(cli|terminal|shell|\btui\b|command[-\s]?line|neovim|nvim|tmux|dotfile)\b/.test(text))
    return "cli-tools";

  // Default stays developer-productivity
  return "developer-productivity";
}

// ── Description enrichment ──────────────────────────────────────────────────

function enrichDescription(tool: EnrichedTool): string {
  const desc = tool.description || tool.tagline || "";

  // Already has a decent description (2+ sentences or 150+ chars)
  if (desc.length >= 150 || (desc.includes(".") && desc.split(".").length >= 3)) {
    return desc;
  }

  // Build a richer description from metadata
  const parts: string[] = [desc.replace(/\.?$/, ".")];

  // Add language/platform context
  const langs = (tool.languages || []).filter(Boolean);
  if (langs.length > 0) {
    parts.push(`Built with ${langs.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}.`);
  }

  // Add star count for social proof
  const stars = tool.github_stars || 0;
  if (stars >= 10000) {
    parts.push(
      `Popular open-source project with ${(stars / 1000).toFixed(0)}k+ GitHub stars.`
    );
  } else if (stars >= 1000) {
    parts.push(
      `Open-source project with ${(stars / 1000).toFixed(1)}k GitHub stars.`
    );
  }

  // Add maintenance context
  if (tool.maintenance_status === "active") {
    parts.push("Actively maintained.");
  }

  return parts.join(" ");
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const enriched: EnrichedTool[] = JSON.parse(readFileSync(ENRICHED_PATH, "utf-8"));
  const seed: EnrichedTool[] = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
  const categories = JSON.parse(readFileSync(CATEGORIES_PATH, "utf-8"));

  console.log(`Loaded ${enriched.length} enriched tools, ${seed.length} seed tools`);

  // Identify original 81 slugs (protected from removal)
  const originalSlugs = new Set(seed.slice(0, 81).map((t) => t.slug));
  console.log(`Protected original tools: ${originalSlugs.size}`);

  // ── Step 1: Filter low-quality imports ────────────────────────────────

  const MIN_STARS = 200;
  const before = enriched.length;
  const filtered = enriched.filter((t) => {
    if (originalSlugs.has(t.slug)) return true; // Keep originals always
    return (t.github_stars || 0) >= MIN_STARS;
  });
  console.log(`\n[Step 1] Quality filter (${MIN_STARS}+ stars):`);
  console.log(`  Removed: ${before - filtered.length} low-quality tools`);
  console.log(`  Remaining: ${filtered.length}`);

  // ── Step 2: Reclassify categories ─────────────────────────────────────

  const catBefore: Record<string, number> = {};
  const catAfter: Record<string, number> = {};

  for (const t of filtered) {
    catBefore[t.category] = (catBefore[t.category] || 0) + 1;
  }

  let reclassified = 0;
  for (const t of filtered) {
    const newCat = classifyCategory(t);
    if (newCat !== t.category) {
      t.category = newCat;
      reclassified++;
    }
    catAfter[t.category] = (catAfter[t.category] || 0) + 1;
  }

  console.log(`\n[Step 2] Category reclassification:`);
  console.log(`  Reclassified: ${reclassified} tools`);
  console.log("\n  Before → After:");
  const allCats = new Set([...Object.keys(catBefore), ...Object.keys(catAfter)]);
  for (const cat of [...allCats].sort()) {
    const b = catBefore[cat] || 0;
    const a = catAfter[cat] || 0;
    const delta = a - b;
    const arrow = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "=";
    console.log(`    ${cat}: ${b} → ${a} (${arrow})`);
  }

  // ── Step 3: Enrich descriptions ───────────────────────────────────────

  let improved = 0;
  for (const t of filtered) {
    const original = t.description;
    t.description = enrichDescription(t);
    // Also fix tagline if too long
    if (t.description !== original) improved++;
    if (t.tagline && t.tagline.length > 120) {
      t.tagline = t.tagline.slice(0, 117) + "...";
    }
  }

  console.log(`\n[Step 3] Description enrichment:`);
  console.log(`  Improved: ${improved} descriptions`);

  // ── Write outputs ─────────────────────────────────────────────────────

  // Update categories
  const existingSlugs = new Set(categories.map((c: { slug: string }) => c.slug));
  const newCats = NEW_CATEGORIES.filter((c) => !existingSlugs.has(c.slug));
  const mergedCategories = [...categories, ...newCats];
  writeFileSync(CATEGORIES_PATH, JSON.stringify(mergedCategories, null, 2) + "\n");
  console.log(`\nAdded ${newCats.length} new categories (${mergedCategories.length} total)`);

  // Update seed-tools (filtered set replaces the full seed)
  // Strip enrichment-only fields for seed file
  const cleanSeed = filtered.map((t) => ({
    name: t.name,
    slug: t.slug,
    tagline: t.tagline,
    description: t.description,
    category: t.category,
    subcategories: t.subcategories || [],
    website_url: t.website_url,
    github_url: t.github_url,
    ...(t.npm_url ? { npm_url: t.npm_url } : {}),
    ...(t.pypi_url ? { pypi_url: t.pypi_url } : {}),
    pricing: t.pricing,
    ...(t.license ? { license: t.license } : {}),
    languages: t.languages,
    platforms: t.platforms,
    works_with: t.works_with || [],
    alternative_to: t.alternative_to || [],
    install_difficulty: t.install_difficulty,
    featured: t.featured || false,
  }));
  writeFileSync(SEED_PATH, JSON.stringify(cleanSeed, null, 2) + "\n");

  // Update enriched-tools too
  writeFileSync(ENRICHED_PATH, JSON.stringify(filtered, null, 2) + "\n");

  console.log(`\nWrote ${cleanSeed.length} tools to seed-tools.json`);
  console.log(`Wrote ${filtered.length} tools to enriched-tools.json`);
  console.log("\nDone! Run 'pnpm enrich' then 'pnpm seed' to push to Supabase.");
}

main();
