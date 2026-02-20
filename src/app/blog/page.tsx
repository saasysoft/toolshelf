import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import BlogFilterBar from '@/components/BlogFilterBar';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Developer tool guides, comparisons, and roundups. Find the best tools for your stack.',
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoryFilter = typeof sp.category === 'string' ? sp.category : '';

  const allPosts = getAllPosts();
  const categories = getAllCategories();
  const filteredPosts = categoryFilter
    ? allPosts.filter((p) => p.category === categoryFilter)
    : allPosts;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-blue-50/50 to-white px-4 py-16 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Developer Tool Insights
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Guides, comparisons, and deep dives to help you pick the right tools.{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              {allPosts.length} articles
            </span>
          </p>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-b border-zinc-100 bg-blue-50/50 px-4 py-8 dark:border-zinc-800 dark:bg-blue-950/20">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm font-semibold text-blue-600 dark:text-blue-400">Newsletter</p>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Get new tool roundups and deep dives delivered weekly.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* Filter + Grid */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense>
          <BlogFilterBar categories={categories} postCount={allPosts.length} />
        </Suspense>

        {filteredPosts.length === 0 ? (
          <p className="mt-12 text-center text-zinc-500 dark:text-zinc-400">
            No posts in this category yet. Check back soon!
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
