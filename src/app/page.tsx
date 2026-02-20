export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import NewsletterForm from '@/components/NewsletterForm';
import { getFeaturedTools, getRecentTools, getCategories, getToolCount, getTools } from '@/lib/queries';
import type { SortOption, MaintenanceStatus, PricingType } from '@/types/tool';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;

  const toArray = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const page = parseInt(sp.page as string) || 1;
  const filters = {
    platforms: toArray(sp.platform),
    languages: toArray(sp.lang),
    maintenance: toArray(sp.maintenance) as MaintenanceStatus[],
    pricing: toArray(sp.pricing) as PricingType[],
    sort: (sp.sort as SortOption) || 'quality_score',
  };

  const [featured, recent, categories, toolCount, { tools: browseTools, count: browseCount }] = await Promise.all([
    getFeaturedTools(),
    getRecentTools(),
    getCategories(),
    getToolCount(),
    getTools(filters, page),
  ]);

  const totalPages = Math.ceil(browseCount / 24);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-blue-50/50 to-white px-4 py-20 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Find the right tool.
            <br />
            <span className="text-blue-600">Skip the guesswork.</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {toolCount > 0 ? `${toolCount}+` : 'Hundreds of'} developer tools across {categories.length} categories
            with quality scores, maintenance status, and compatibility data.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="large" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400">
            <span>Popular:</span>
            {['ripgrep', 'Claude Code', 'Supabase', 'lazygit', 'n8n'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-500 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
              >
                {term}
              </Link>
            ))}
          </div>
          {/* Stats bar */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{toolCount.toLocaleString()}</span>
              <span>tools</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{categories.length}</span>
              <span>categories</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">100%</span>
              <span>free &amp; open</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — feature highlights */}
      <section className="border-b border-zinc-100 bg-white px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            More than a list of links
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Quality Scores',
                desc: 'Every tool scored 0-100 using GitHub activity, docs quality, community size, and download metrics.',
              },
              {
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                title: 'Live Stats',
                desc: 'GitHub stars, maintenance status, and commit frequency updated regularly via API enrichment.',
              },
              {
                icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                title: 'REST API',
                desc: 'Programmatic access to all tool data. Free tier with 100 req/day. Pro and enterprise tiers available.',
              },
              {
                icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                title: 'MCP Server',
                desc: 'Connect ToolShelf to Claude, Cursor, or any MCP-compatible AI agent for native tool discovery.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Tools */}
        {featured.length > 0 && (
          <div className="mb-16">
            <ToolGrid tools={featured} title="Featured Tools" />
          </div>
        )}

        {/* Categories */}
        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Browse by Category</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{cat.description}</p>
                  {cat.tool_count > 0 && (
                    <p className="mt-2 text-xs font-medium text-zinc-400">{cat.tool_count} tools</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Additions */}
        {recent.length > 0 && (
          <div className="mb-16">
            <ToolGrid tools={recent} title="Recently Added" />
          </div>
        )}

        {/* Built for AI Agents */}
        <section className="mb-16 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 dark:from-indigo-950/30 dark:to-blue-950/30 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex-1">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  AI-Ready Infrastructure
                </p>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Built for AI agents, not just humans
                </h2>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                  ToolShelf is designed to be the canonical tool discovery source for AI. Whether you&apos;re building
                  an agent that recommends developer tools or need structured data for your workflow, we&apos;ve got you covered.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/80">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">llms.txt</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Standard machine-readable file that tells AI models who we are and how to cite our data.
                    </p>
                    <Link href="/llms.txt" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      View llms.txt &rarr;
                    </Link>
                  </div>
                  <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/80">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">REST API</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Full API with search, filtering, and pagination. Free tier at 100 requests/day.
                    </p>
                    <Link href="/api-keys" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Get API key &rarr;
                    </Link>
                  </div>
                  <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/80">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">MCP Server</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Native integration for Claude, Cursor, and any MCP-compatible AI tool.
                    </p>
                    <Link href="/api-keys#mcp" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Connect &rarr;
                    </Link>
                  </div>
                </div>
              </div>
              <div className="shrink-0 lg:w-80">
                <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs text-zinc-300 dark:border-zinc-700">
                  <p className="text-zinc-500"># Add to your MCP config</p>
                  <p className="mt-1">{`{`}</p>
                  <p className="pl-4">{`"mcpServers": {`}</p>
                  <p className="pl-8">{`"toolshelf": {`}</p>
                  <p className="pl-12"><span className="text-blue-400">{`"type"`}</span>: <span className="text-green-400">{`"url"`}</span>,</p>
                  <p className="pl-12"><span className="text-blue-400">{`"url"`}</span>: <span className="text-green-400">{`"https://toolshelf.dev/api/mcp"`}</span></p>
                  <p className="pl-8">{`}`}</p>
                  <p className="pl-4">{`}`}</p>
                  <p>{`}`}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse All Tools */}
        <section className="mb-16" id="browse">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Browse All Tools</h2>
            <p className="mt-1 text-sm text-zinc-400">{browseCount} tools</p>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <Suspense fallback={null}>
              <FilterSidebar />
            </Suspense>
            <div className="min-w-0 flex-1">
              {browseTools.length > 0 ? (
                <ToolGrid tools={browseTools} />
              ) : (
                <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
                  <p className="text-zinc-500">No tools match your filters.</p>
                </div>
              )}

              <Suspense fallback={null}>
                <Pagination page={page} totalPages={totalPages} anchor="browse" />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mb-16 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Stay ahead of the curve</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Get weekly roundups of the best new developer tools, curated comparisons, and insights delivered to your inbox.
          </p>
          <div className="mx-auto mt-5 max-w-sm">
            <NewsletterForm />
          </div>
        </section>

        {/* Why ToolShelf + Support */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Why ToolShelf?</h2>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: 'Quality Scores',
                  desc: 'Every tool gets a 0-100 composite score based on GitHub activity, documentation quality, community size, and download metrics.',
                },
                {
                  title: 'Maintenance Status',
                  desc: 'Know if a tool is actively maintained, slowing down, or abandoned before you build your workflow around it.',
                },
                {
                  title: 'Compatibility Data',
                  desc: 'See at a glance which platforms, editors, and tools work together. No more "does this work on Windows?" surprises.',
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Support ToolShelf</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              ToolShelf is an independent project. Here&apos;s how you can help it grow:
            </p>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: 'Submit a tool',
                  desc: 'Know a great tool that should be here? We review every submission and enrich it with quality scores.',
                  href: '/submit',
                  label: 'Submit',
                },
                {
                  title: 'Use the API',
                  desc: 'Build on ToolShelf data. Free tier available, paid tiers support the project and unlock full data.',
                  href: '/api-keys',
                  label: 'Get API key',
                },
                {
                  title: 'Spread the word',
                  desc: 'Share ToolShelf with your team. Link to toolshelf.dev when recommending tools.',
                  href: null,
                  label: null,
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                  </div>
                  {item.href && (
                    <Link
                      href={item.href}
                      className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
