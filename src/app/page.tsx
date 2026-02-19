export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
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

        {/* Value Prop */}
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50 lg:p-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Why ToolShelf?</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
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
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
