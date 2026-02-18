'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SortOption } from '@/types/tool';

const PLATFORMS = ['mac', 'linux', 'windows', 'web', 'docker'];
const LANGUAGES = ['rust', 'go', 'typescript', 'python', 'c', 'javascript', 'ruby', 'java'];
const MAINTENANCE_OPTIONS = ['active', 'slowing', 'stale'];
const PRICING_OPTIONS = ['free', 'open-source', 'freemium', 'paid'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'quality_score', label: 'Quality Score' },
  { value: 'github_stars', label: 'GitHub Stars' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'created_at', label: 'Newest First' },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll(key);

      if (current.includes(value)) {
        params.delete(key);
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }

      params.delete('page');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const setSort = useCallback(
    (sort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', sort);
      params.delete('page');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const isChecked = (key: string, value: string) => searchParams.getAll(key).includes(value);
  const currentSort = searchParams.get('sort') || 'quality_score';

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-56">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <FilterGroup title="Platform" options={PLATFORMS} filterKey="platform" isChecked={isChecked} toggle={updateFilter} />
      <FilterGroup title="Language" options={LANGUAGES} filterKey="lang" isChecked={isChecked} toggle={updateFilter} />
      <FilterGroup title="Maintenance" options={MAINTENANCE_OPTIONS} filterKey="maintenance" isChecked={isChecked} toggle={updateFilter} />
      <FilterGroup title="Pricing" options={PRICING_OPTIONS} filterKey="pricing" isChecked={isChecked} toggle={updateFilter} />
    </aside>
  );
}

function FilterGroup({
  title,
  options,
  filterKey,
  isChecked,
  toggle,
}: {
  title: string;
  options: string[];
  filterKey: string;
  isChecked: (key: string, value: string) => boolean;
  toggle: (key: string, value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</h3>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isChecked(filterKey, opt)}
              onChange={() => toggle(filterKey, opt)}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
            />
            <span className="capitalize">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
