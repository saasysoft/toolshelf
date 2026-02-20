export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import NewsletterForm from '@/components/NewsletterForm';
import { getFeaturedTools, getRecentTools, getCategories, getToolCount, getTools, getDistinctDimensions } from '@/lib/queries';
import { getDimensionMeta } from '@/lib/landing-pages';
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

  const [featured, recent, categories, toolCount, { tools: browseTools, count: browseCount }, dimensions] = await Promise.all([
    getFeaturedTools(),
    getRecentTools(),
    getCategories(),
    getToolCount(),
    getTools(filters, page),
    getDistinctDimensions(3),
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
          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="#browse"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Browse All Tools
            </a>
            <Link
              href="/api-keys"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Get Free API Key
            </Link>
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

      {/* Social Proof Bar */}
      <section className="border-b border-zinc-100 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Trusted by developers at companies building with our API
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{toolCount.toLocaleString()}+</span>
              <span className="text-zinc-500 dark:text-zinc-400">Tools Indexed</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{categories.length}</span>
              <span className="text-zinc-500 dark:text-zinc-400">Categories</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Open Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Pain Points */}
      <section className="border-b border-zinc-100 bg-zinc-50 px-4 py-14 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Sound familiar?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              'You find a promising tool on GitHub\u2026 6 months later it\u2019s abandoned.',
              'README says \u201Cworks on all platforms\u201D\u2026 except yours.',
              'Awesome lists have 500 links\u2026 but no way to tell which are actually good.',
            ].map((pain) => (
              <p key={pain} className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{pain}&rdquo;
              </p>
            ))}
          </div>
          <p className="mt-8 text-sm font-semibold text-blue-600 dark:text-blue-400">
            ToolShelf solves this.
          </p>
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

        {/* Best Tools For... */}
        {dimensions.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Best Developer Tools For...</h2>
            <div className="flex flex-wrap gap-2">
              {dimensions.slice(0, 24).map((dim) => {
                const meta = getDimensionMeta(dim.slug);
                return (
                  <Link
                    key={dim.slug}
                    href={`/best/${dim.slug}`}
                    className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
                  >
                    {meta.title}
                    <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">{dim.count}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

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
            {/* API Pricing Strip */}
            <div className="mt-8 border-t border-zinc-200/60 pt-8 dark:border-zinc-700/60">
              <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                API Pricing
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white/80 p-5 text-center dark:bg-zinc-900/80">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Free</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">$0</p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">100 requests/day</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Basic fields</p>
                </div>
                <div className="rounded-xl bg-white/80 p-5 text-center ring-2 ring-blue-500/20 dark:bg-zinc-900/80">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Pro</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">$19<span className="text-sm font-normal text-zinc-500">/mo</span></p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">5,000 requests/day</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">All fields</p>
                </div>
                <div className="rounded-xl bg-white/80 p-5 text-center dark:bg-zinc-900/80">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Enterprise</p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Custom</p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Unlimited requests</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Bulk export</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link href="/api-keys" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Compare plans &rarr;
                </Link>
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

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">Frequently Asked Questions</h2>
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {[
              {
                q: 'How is ToolShelf different from Awesome lists?',
                a: 'Awesome lists are great starting points, but they\'re static links with no quality signals. ToolShelf enriches every tool with a quality score, maintenance status, compatibility data, and live GitHub stats so you can make informed decisions.',
              },
              {
                q: 'How are quality scores calculated?',
                a: 'Each tool gets a 0\u2013100 composite score based on GitHub activity (stars, commit frequency, issue responsiveness), documentation quality, community size, and download metrics. Scores are updated regularly via our enrichment pipeline.',
              },
              {
                q: 'How often is data updated?',
                a: 'Tool metadata is re-enriched on a regular schedule via the GitHub and npm/PyPI APIs. New tools are reviewed and added on an ongoing basis.',
              },
              {
                q: 'Is the API really free?',
                a: 'Yes. The free tier gives you 100 requests per day with access to basic fields. Pro ($19/mo) and Enterprise tiers are available if you need higher limits or full data export.',
              },
              {
                q: 'Who curates the tools?',
                a: 'ToolShelf is an independent project. Tools are submitted by the community and reviewed before being added. Quality scores are calculated algorithmically, not editorially.',
              },
              {
                q: 'Can I submit my own tool?',
                a: 'Absolutely. Use the Submit page to suggest a tool. We review every submission, enrich it with quality data, and add it to the directory if it meets our inclusion criteria.',
              },
            ].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.q}
                  <svg className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <p className="px-6 pb-4 text-sm text-zinc-500 dark:text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mb-16 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Get the Top 5 New Dev Tools Every Week</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            Every Friday we send a short email with the best new developer tools we found that week, plus one deep-dive comparison. Free, no spam, unsubscribe anytime.
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
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-700">
              <a
                href="https://github.com/saasysoft/toolshelf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                Open source on GitHub
              </a>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {toolCount.toLocaleString()} tools across {categories.length} categories
              </span>
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

      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ToolShelf',
            url: 'https://toolshelf.dev',
            description: 'Curated developer tools directory with quality scores, maintenance status, and compatibility data.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://toolshelf.dev/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'ToolShelf',
            url: 'https://toolshelf.dev',
            logo: 'https://toolshelf.dev/icon.svg',
            sameAs: ['https://github.com/saasysoft/toolshelf'],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How is ToolShelf different from Awesome lists?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Awesome lists are great starting points, but they are static links with no quality signals. ToolShelf enriches every tool with a quality score, maintenance status, compatibility data, and live GitHub stats so you can make informed decisions.',
                },
              },
              {
                '@type': 'Question',
                name: 'How are quality scores calculated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Each tool gets a 0-100 composite score based on GitHub activity (stars, commit frequency, issue responsiveness), documentation quality, community size, and download metrics. Scores are updated regularly via our enrichment pipeline.',
                },
              },
              {
                '@type': 'Question',
                name: 'How often is data updated?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Tool metadata is re-enriched on a regular schedule via the GitHub and npm/PyPI APIs. New tools are reviewed and added on an ongoing basis.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is the API really free?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. The free tier gives you 100 requests per day with access to basic fields. Pro ($19/mo) and Enterprise tiers are available if you need higher limits or full data export.',
                },
              },
              {
                '@type': 'Question',
                name: 'Who curates the tools?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'ToolShelf is an independent project. Tools are submitted by the community and reviewed before being added. Quality scores are calculated algorithmically, not editorially.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I submit my own tool?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely. Use the Submit page to suggest a tool. We review every submission, enrich it with quality data, and add it to the directory if it meets our inclusion criteria.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
