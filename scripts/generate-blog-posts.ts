/**
 * Generate draft MDX blog posts from ToolShelf tool data.
 *
 * Usage: pnpm generate-posts [--type best|comparison|deepdive] [--category slug]
 *
 * Generates drafts in content/blog/ — review before publishing (set published: true).
 */

import fs from 'fs';
import path from 'path';

interface Tool {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  github_url?: string;
  website_url?: string;
  pricing?: string;
  languages?: string[];
  platforms?: string[];
  featured?: boolean;
  github_stars?: number;
  quality_score?: number;
  maintenance?: string;
}

interface Category {
  slug: string;
  name: string;
  description: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');
const DATA_DIR = path.join(process.cwd(), 'data');

function loadTools(): Tool[] {
  const enrichedPath = path.join(DATA_DIR, 'enriched-tools.json');
  const seedPath = path.join(DATA_DIR, 'seed-tools.json');
  const filePath = fs.existsSync(enrichedPath) ? enrichedPath : seedPath;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function loadCategories(): Category[] {
  return JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'seed-categories.json'), 'utf-8')
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function writePost(filename: string, content: string) {
  const filePath = path.join(CONTENT_DIR, filename);
  if (fs.existsSync(filePath)) {
    console.log(`  SKIP ${filename} (already exists)`);
    return;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  CREATED ${filename}`);
}

// ---------- Post generators ----------

function generateBestOf(category: Category, tools: Tool[]) {
  const catTools = tools
    .filter((t) => t.category === category.slug)
    .sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, 15);

  if (catTools.length < 3) return;

  const slug = `best-${category.slug}-2026`;
  const shortName = category.name.replace(/ & /g, ' and ');

  const toolSections = catTools
    .map((t, i) => {
      const stars =
        t.github_stars && t.github_stars > 0
          ? ` (${(t.github_stars / 1000).toFixed(1)}k stars)`
          : '';
      const link = t.website_url || t.github_url || '';
      const linkMd = link ? ` — [Website](${link})` : '';
      return `### ${i + 1}. ${t.name}${stars}

${t.description || t.tagline}

**Pricing:** ${t.pricing || 'N/A'}${linkMd}
`;
    })
    .join('\n');

  const content = `---
title: "Best ${shortName} in 2026"
description: "Our top picks for the best ${shortName.toLowerCase()} based on quality scores, maintenance activity, and community adoption."
date: "${today()}"
category: "${category.slug}"
tags: ["${category.slug}", "best-of", "2026", "developer-tools"]
published: false
---

Looking for the best ${shortName.toLowerCase()}? We analyzed ${catTools.length} tools in this category using ToolShelf's quality scoring system — factoring in maintenance activity, community adoption, documentation quality, and more.

Here are the top picks for 2026.

${toolSections}

---

Browse all tools in [${category.name}](/category/${category.slug}), or [search for something specific](/search).
`;

  writePost(`${slug}.mdx`, content);
}

function generateComparison(toolGroup: Tool[], comparisonName: string) {
  if (toolGroup.length < 2) return;

  const slug = slugify(
    toolGroup.map((t) => t.name).join('-vs-')
  );

  const tableRows = toolGroup
    .map(
      (t) =>
        `| **${t.name}** | ${t.pricing || 'N/A'} | ${(t.platforms || []).join(', ') || 'N/A'} | ${t.quality_score ?? 'N/A'} | ${t.github_stars ? `${(t.github_stars / 1000).toFixed(1)}k` : 'N/A'} |`
    )
    .join('\n');

  const sections = toolGroup
    .map(
      (t) => `### ${t.name}

${t.description || t.tagline}

${t.website_url ? `[Website](${t.website_url})` : ''}${t.github_url ? ` | [GitHub](${t.github_url})` : ''}
`
    )
    .join('\n');

  const content = `---
title: "${comparisonName}"
description: "A detailed comparison of ${toolGroup.map((t) => t.name).join(', ')} — features, pricing, and quality scores side by side."
date: "${today()}"
category: "${toolGroup[0].category}"
tags: ["comparison", "${toolGroup[0].category}", ${toolGroup.map((t) => `"${t.slug}"`).join(', ')}]
published: false
---

Choosing between ${toolGroup.map((t) => `**${t.name}**`).join(', ')}? Here's how they compare based on real data from ToolShelf.

## Quick Comparison

| Tool | Pricing | Platforms | Quality Score | GitHub Stars |
|------|---------|-----------|---------------|--------------|
${tableRows}

${sections}

## Which Should You Choose?

{/* TODO: Add editorial recommendation based on use cases */}

The right choice depends on your specific needs. Check the detailed profiles on ToolShelf for more information:
${toolGroup.map((t) => `- [${t.name}](/tools/${t.slug})`).join('\n')}
`;

  writePost(`${slug}.mdx`, content);
}

function generateCategoryDeepDive(category: Category, tools: Tool[]) {
  const catTools = tools.filter((t) => t.category === category.slug);
  if (catTools.length < 5) return;

  const slug = `${category.slug}-landscape-2026`;
  const shortName = category.name.replace(/ & /g, ' and ');

  const pricingBreakdown = {
    'open-source': catTools.filter((t) => t.pricing === 'open-source').length,
    free: catTools.filter((t) => t.pricing === 'free').length,
    freemium: catTools.filter((t) => t.pricing === 'freemium').length,
    paid: catTools.filter((t) => t.pricing === 'paid').length,
  };

  const topTools = catTools
    .sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, 5);

  const content = `---
title: "The ${shortName} Landscape in 2026"
description: "A comprehensive look at the ${shortName.toLowerCase()} ecosystem — ${catTools.length} tools analyzed with trends, pricing breakdown, and top picks."
date: "${today()}"
category: "${category.slug}"
tags: ["${category.slug}", "landscape", "deep-dive", "2026"]
published: false
---

The ${shortName.toLowerCase()} space is thriving in 2026. ToolShelf tracks **${catTools.length} tools** in this category. Here's what the landscape looks like.

## By the Numbers

- **${catTools.length}** total tools tracked
- **${pricingBreakdown['open-source']}** open-source
- **${pricingBreakdown.free + pricingBreakdown.freemium}** free or freemium
- **${pricingBreakdown.paid}** paid

## Top Rated Tools

${topTools.map((t, i) => `${i + 1}. **[${t.name}](/tools/${t.slug})** — ${t.tagline}${t.quality_score ? ` (Score: ${t.quality_score})` : ''}`).join('\n')}

## Key Trends

{/* TODO: Add editorial insights about category trends */}

1. **Trend 1** — Description
2. **Trend 2** — Description
3. **Trend 3** — Description

## Getting Started

If you're new to ${shortName.toLowerCase()}, start with these approachable options:

${topTools.filter((t) => t.pricing === 'open-source' || t.pricing === 'free').slice(0, 3).map((t) => `- **[${t.name}](/tools/${t.slug})** — ${t.tagline}`).join('\n')}

---

Explore all [${category.name}](/category/${category.slug}) tools on ToolShelf.
`;

  writePost(`${slug}.mdx`, content);
}

// ---------- Main ----------

function main() {
  const args = process.argv.slice(2);
  const typeArg = args.indexOf('--type');
  const catArg = args.indexOf('--category');
  const postType = typeArg !== -1 ? args[typeArg + 1] : 'all';
  const catFilter = catArg !== -1 ? args[catArg + 1] : undefined;

  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  const tools = loadTools();
  const categories = loadCategories();
  const filteredCategories = catFilter
    ? categories.filter((c) => c.slug === catFilter)
    : categories;

  console.log(
    `Generating blog posts from ${tools.length} tools across ${filteredCategories.length} categories...\n`
  );

  // "Best X" posts per category
  if (postType === 'all' || postType === 'best') {
    console.log('--- Best-of posts ---');
    for (const cat of filteredCategories) {
      generateBestOf(cat, tools);
    }
  }

  // Category deep dives
  if (postType === 'all' || postType === 'deepdive') {
    console.log('\n--- Category deep dives ---');
    for (const cat of filteredCategories) {
      generateCategoryDeepDive(cat, tools);
    }
  }

  // Comparison posts — define interesting matchups
  if (postType === 'all' || postType === 'comparison') {
    console.log('\n--- Comparison posts ---');
    const comparisons: { names: string[]; title: string }[] = [
      {
        names: ['cursor', 'zed', 'neovim'],
        title: 'Cursor vs Zed vs Neovim: AI Code Editors Compared',
      },
      {
        names: ['docker', 'podman'],
        title: 'Docker vs Podman: Container Runtimes Compared',
      },
      {
        names: ['supabase', 'firebase', 'pocketbase'],
        title: 'Supabase vs Firebase vs PocketBase: Backend Platforms Compared',
      },
      {
        names: ['n8n', 'windmill'],
        title: 'n8n vs Windmill: Workflow Automation Compared',
      },
    ];

    const toolMap = new Map(tools.map((t) => [t.slug, t]));
    for (const comp of comparisons) {
      const group = comp.names
        .map((n) => toolMap.get(n))
        .filter((t): t is Tool => t !== undefined);
      if (group.length >= 2) {
        generateComparison(group, comp.title);
      }
    }
  }

  console.log('\nDone! Review drafts in content/blog/ and set published: true when ready.');
}

main();
