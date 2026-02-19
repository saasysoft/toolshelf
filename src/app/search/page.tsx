export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import { searchTools } from '@/lib/queries';
import type { SortOption, MaintenanceStatus, PricingType } from '@/types/tool';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  return {
    title: q ? `Search: ${q}` : 'Search Developer Tools',
    description: q
      ? `Search results for "${q}" on ToolShelf`
      : 'Search our curated directory of developer tools',
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const page = parseInt(sp.page as string) || 1;

  const toArray = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const filters = {
    platforms: toArray(sp.platform),
    languages: toArray(sp.lang),
    maintenance: toArray(sp.maintenance) as MaintenanceStatus[],
    pricing: toArray(sp.pricing) as PricingType[],
    sort: (sp.sort as SortOption) || 'quality_score',
  };

  let tools: Awaited<ReturnType<typeof searchTools>>['tools'] = [];
  let count = 0;

  if (q) {
    const result = await searchTools(q, page, filters);
    tools = result.tools;
    count = result.count;
  }

  const totalPages = Math.ceil(count / 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Search</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Search Tools</h1>

      <div className="mb-8 max-w-xl">
        <SearchBar defaultValue={q} size="large" />
      </div>

      {q && (
        <p className="mb-6 text-sm text-zinc-500">
          {count} result{count !== 1 ? 's' : ''} for &quot;{q}&quot;
        </p>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {q && (
          <Suspense fallback={null}>
            <FilterSidebar />
          </Suspense>
        )}
        <div className="min-w-0 flex-1">
          {tools.length > 0 ? (
            <ToolGrid tools={tools} />
          ) : q ? (
            <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-zinc-500">No tools found for &quot;{q}&quot;.</p>
              <p className="mt-2 text-sm text-zinc-400">Try a different search term or browse by category.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-zinc-500">Enter a search term to find developer tools.</p>
            </div>
          )}

          <Suspense fallback={null}>
            <Pagination page={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
