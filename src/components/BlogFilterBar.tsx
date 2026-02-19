'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface BlogFilterBarProps {
  categories: string[];
  postCount: number;
}

export default function BlogFilterBar({ categories, postCount }: BlogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  const handleFilter = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set('category', category);
      } else {
        params.delete('category');
      }
      router.push(`/blog?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleFilter('')}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
        }`}
      >
        All ({postCount})
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleFilter(cat)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
