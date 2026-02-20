import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getCategoryBySlug, getTools, getDimensionsForCategory } from '@/lib/queries';
import { getDimensionMeta } from '@/lib/landing-pages';
import ToolGrid from '@/components/ToolGrid';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';
import type { SortOption, MaintenanceStatus, PricingType } from '@/types/tool';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} — Developer Tools`,
    description: category.description || `Browse ${category.name} on ToolShelf`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const toArray = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const page = parseInt(sp.page as string) || 1;
  const filters = {
    category: slug,
    platforms: toArray(sp.platform),
    languages: toArray(sp.lang),
    maintenance: toArray(sp.maintenance) as MaintenanceStatus[],
    pricing: toArray(sp.pricing) as PricingType[],
    sort: (sp.sort as SortOption) || 'quality_score',
  };

  const [{ tools, count }, dimensions] = await Promise.all([
    getTools(filters, page),
    getDimensionsForCategory(slug),
  ]);
  const totalPages = Math.ceil(count / 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {category.icon && <span className="text-3xl">{category.icon}</span>}
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{category.name}</h1>
        </div>
        {category.description && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-zinc-400">{count} tools</p>
      </div>

      {/* Best Tools For... */}
      {dimensions.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Best {category.name} Tools For
          </h2>
          <div className="flex flex-wrap gap-2">
            {dimensions.slice(0, 16).map((dim) => {
              const meta = getDimensionMeta(dim.slug);
              return (
                <Link
                  key={dim.slug}
                  href={`/best/${slug}/${dim.slug}`}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
                >
                  {meta.title}
                  <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">{dim.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={null}>
          <FilterSidebar />
        </Suspense>
        <div className="min-w-0 flex-1">
          {tools.length > 0 ? (
            <ToolGrid tools={tools} />
          ) : (
            <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-zinc-500">No tools match your filters.</p>
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
