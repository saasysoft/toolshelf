'use client';

import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  page: number;
  totalPages: number;
  anchor?: string;
}

export default function Pagination({ page, totalPages, anchor }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(targetPage));
    const hash = anchor ? `#${anchor}` : '';
    return `?${params.toString()}${hash}`;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <a
          href={buildHref(page - 1)}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Previous
        </a>
      )}
      <span className="px-4 py-2 text-sm text-zinc-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <a
          href={buildHref(page + 1)}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next
        </a>
      )}
    </div>
  );
}
