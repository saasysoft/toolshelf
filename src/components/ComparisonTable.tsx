import type { Tool } from '@/types/tool';
import { formatNumber, formatDate, getDifficultyColor } from '@/lib/utils';
import QualityBadge from './QualityBadge';
import MaintenanceBadge from './MaintenanceBadge';
import Link from 'next/link';

function getDownloads(tool: Tool): number | null {
  return tool.npm_weekly_downloads || tool.pypi_monthly_downloads || null;
}

function getDownloadLabel(tool: Tool): string {
  if (tool.npm_weekly_downloads) return 'npm weekly';
  if (tool.pypi_monthly_downloads) return 'PyPI monthly';
  return '';
}

function WinnerCell({ children, isWinner }: { children: React.ReactNode; isWinner: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm ${isWinner ? 'bg-emerald-50/50 font-semibold text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
      {children}
    </td>
  );
}

export default function ComparisonTable({ tools }: { tools: [Tool, Tool] }) {
  const [a, b] = tools;

  const rows: { label: string; values: [React.ReactNode, React.ReactNode]; winner: 0 | 1 | -1 }[] = [
    {
      label: 'Quality Score',
      values: [<QualityBadge key="a" score={a.quality_score} />, <QualityBadge key="b" score={b.quality_score} />],
      winner: a.quality_score > b.quality_score ? 0 : b.quality_score > a.quality_score ? 1 : -1,
    },
    {
      label: 'GitHub Stars',
      values: [formatNumber(a.github_stars), formatNumber(b.github_stars)],
      winner: a.github_stars > b.github_stars ? 0 : b.github_stars > a.github_stars ? 1 : -1,
    },
    {
      label: 'Maintenance',
      values: [<MaintenanceBadge key="a" status={a.maintenance} />, <MaintenanceBadge key="b" status={b.maintenance} />],
      winner: -1,
    },
    {
      label: 'Pricing',
      values: [
        <span key="a" className="capitalize">{a.pricing}</span>,
        <span key="b" className="capitalize">{b.pricing}</span>,
      ],
      winner: -1,
    },
    {
      label: 'Platforms',
      values: [
        a.platforms?.join(', ') || '—',
        b.platforms?.join(', ') || '—',
      ],
      winner: -1,
    },
    {
      label: 'Languages',
      values: [
        a.languages?.join(', ') || '—',
        b.languages?.join(', ') || '—',
      ],
      winner: -1,
    },
    {
      label: 'Downloads',
      values: [
        getDownloads(a) ? `${formatNumber(getDownloads(a)!)} (${getDownloadLabel(a)})` : '—',
        getDownloads(b) ? `${formatNumber(getDownloads(b)!)} (${getDownloadLabel(b)})` : '—',
      ],
      winner: (() => {
        const da = getDownloads(a), db = getDownloads(b);
        if (!da || !db) return -1 as const;
        return da > db ? 0 as const : db > da ? 1 as const : -1 as const;
      })(),
    },
    {
      label: 'Last Commit',
      values: [formatDate(a.last_commit), formatDate(b.last_commit)],
      winner: (() => {
        if (!a.last_commit || !b.last_commit) return -1 as const;
        return new Date(a.last_commit) > new Date(b.last_commit) ? 0 as const : 1 as const;
      })(),
    },
    {
      label: 'License',
      values: [a.license || '—', b.license || '—'],
      winner: -1,
    },
    {
      label: 'Install Difficulty',
      values: [
        <span key="a" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getDifficultyColor(a.install_difficulty)}`}>{a.install_difficulty}</span>,
        <span key="b" className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getDifficultyColor(b.install_difficulty)}`}>{b.install_difficulty}</span>,
      ],
      winner: (() => {
        const order = { easy: 0, moderate: 1, advanced: 2 };
        const va = order[a.install_difficulty] ?? 1, vb = order[b.install_difficulty] ?? 1;
        return va < vb ? 0 as const : vb < va ? 1 as const : -1 as const;
      })(),
    },
    {
      label: 'Contributors',
      values: [formatNumber(a.contributor_count), formatNumber(b.contributor_count)],
      winner: a.contributor_count > b.contributor_count ? 0 : b.contributor_count > a.contributor_count ? 1 : -1,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-4 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Feature</th>
            <th className="px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <Link href={`/tools/${a.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">{a.name}</Link>
            </th>
            <th className="px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <Link href={`/tools/${b.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">{b.name}</Link>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">{row.label}</td>
              <WinnerCell isWinner={row.winner === 0}>{row.values[0]}</WinnerCell>
              <WinnerCell isWinner={row.winner === 1}>{row.values[1]}</WinnerCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
