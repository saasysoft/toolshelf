'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ defaultValue = '', size = 'default' }: { defaultValue?: string; size?: 'default' | 'large' }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools... (e.g., ripgrep, file manager, deployment)"
          className={`w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30 ${isLarge ? 'py-4 text-lg' : 'py-2.5 text-sm'}`}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 sm:inline-block">
          Enter
        </kbd>
      </div>
    </form>
  );
}
