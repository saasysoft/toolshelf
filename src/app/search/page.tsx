export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import { searchTools } from '@/lib/queries';

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

  let tools: Awaited<ReturnType<typeof searchTools>>['tools'] = [];
  let count = 0;

  if (q) {
    const result = await searchTools(q, page);
    tools = result.tools;
    count = result.count;
  }

  const totalPages = Math.ceil(count / 24);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-zinc-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <a
              href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
