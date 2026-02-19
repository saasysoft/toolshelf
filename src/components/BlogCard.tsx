import Link from 'next/link';
import type { BlogPostMeta } from '@/types/blog';
import BlogTypeBadge from './BlogTypeBadge';

const categoryGradients: Record<string, string> = {
  'mcp-servers': 'from-violet-100 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/20',
  'cli-tools': 'from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/20',
  'ai-coding': 'from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20',
  'self-hosted': 'from-orange-100 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/20',
  'developer-productivity': 'from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20',
  'data-tools': 'from-teal-100 to-cyan-50 dark:from-teal-900/40 dark:to-cyan-900/20',
  'devops-infra': 'from-slate-100 to-zinc-50 dark:from-slate-900/40 dark:to-zinc-900/20',
  security: 'from-red-100 to-rose-50 dark:from-red-900/40 dark:to-rose-900/20',
  'media-design': 'from-pink-100 to-fuchsia-50 dark:from-pink-900/40 dark:to-fuchsia-900/20',
  automation: 'from-yellow-100 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/20',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  const gradient = categoryGradients[post.category] ?? 'from-zinc-100 to-zinc-50 dark:from-zinc-800/40 dark:to-zinc-900/20';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      {/* Gradient placeholder / image area */}
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-end p-4`}>
        <div className="flex flex-wrap gap-1.5">
          {post.category && (
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/80 dark:text-zinc-300">
              {post.category}
            </span>
          )}
          {post.type && <BlogTypeBadge type={post.type} />}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {post.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-zinc-400 dark:text-zinc-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
      </div>
    </Link>
  );
}
