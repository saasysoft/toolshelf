import Link from 'next/link';
import type { Tool } from '@/types/tool';
import { formatNumber } from '@/lib/utils';
import QualityBadge from './QualityBadge';
import MaintenanceBadge from './MaintenanceBadge';

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
            {tool.name}
          </h3>
          {tool.tagline && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {tool.tagline}
            </p>
          )}
        </div>
        <QualityBadge score={tool.quality_score} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <MaintenanceBadge status={tool.maintenance} />

        {tool.github_stars > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {formatNumber(tool.github_stars)}
          </span>
        )}

        {tool.pricing && tool.pricing !== 'free' && (
          <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            {tool.pricing}
          </span>
        )}

        {tool.platforms?.length > 0 && (
          <div className="ml-auto flex gap-1">
            {tool.platforms.slice(0, 3).map((p) => (
              <span key={p} className="text-xs opacity-60" title={p}>
                {p === 'mac' ? '🍎' : p === 'linux' ? '🐧' : p === 'windows' ? '🪟' : p === 'web' ? '🌐' : '🐳'}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
