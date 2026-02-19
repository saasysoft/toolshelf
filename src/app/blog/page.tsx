import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Developer tool guides, comparisons, and roundups. Find the best tools for your stack.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Blog
        </h1>
        <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
          Guides, comparisons, and roundups to help you find the right developer
          tools.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Posts coming soon. Check back shortly!
        </p>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>&middot;</span>
                  <span>{post.readingTime}</span>
                  {post.category && (
                    <>
                      <span>&middot;</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {post.category}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  {post.title}
                </h2>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {post.description}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
