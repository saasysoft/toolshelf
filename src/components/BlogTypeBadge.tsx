import type { BlogPostType } from '@/types/blog';

const typeConfig: Record<BlogPostType, { label: string; classes: string }> = {
  'best-of': {
    label: 'Best Of',
    classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  },
  comparison: {
    label: 'Comparison',
    classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  'deep-dive': {
    label: 'Deep Dive',
    classes: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
  },
  guide: {
    label: 'Guide',
    classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  roundup: {
    label: 'Roundup',
    classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  },
};

export default function BlogTypeBadge({ type }: { type: BlogPostType }) {
  const config = typeConfig[type];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.classes}`}>
      {config.label}
    </span>
  );
}
