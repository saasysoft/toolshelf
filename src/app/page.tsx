export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ToolGrid from '@/components/ToolGrid';
import { getFeaturedTools, getRecentTools, getCategories } from '@/lib/queries';

export default async function HomePage() {
  const [featured, recent, categories] = await Promise.all([
    getFeaturedTools(),
    getRecentTools(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-blue-50/50 to-white px-4 py-20 dark:from-zinc-900 dark:to-zinc-950 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Find the right tool.
            <br />
            <span className="text-blue-600">Skip the guesswork.</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            A curated directory of developer power tools with quality scores,
            maintenance status, and compatibility data &mdash; so you always know what you&apos;re installing.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar size="large" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400">
            <span>Popular:</span>
            {['ripgrep', 'Claude Code', 'Supabase', 'lazygit', 'n8n'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-500 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Tools */}
        {featured.length > 0 && (
          <div className="mb-16">
            <ToolGrid tools={featured} title="Featured Tools" />
          </div>
        )}

        {/* Categories */}
        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Browse by Category</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{cat.description}</p>
                  {cat.tool_count > 0 && (
                    <p className="mt-2 text-xs font-medium text-zinc-400">{cat.tool_count} tools</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Additions */}
        {recent.length > 0 && (
          <div className="mb-16">
            <ToolGrid tools={recent} title="Recently Added" />
          </div>
        )}

        {/* Value Prop */}
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50 lg:p-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Why ToolShelf?</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Quality Scores',
                desc: 'Every tool gets a 0-100 composite score based on GitHub activity, documentation quality, community size, and download metrics.',
              },
              {
                title: 'Maintenance Status',
                desc: 'Know if a tool is actively maintained, slowing down, or abandoned before you build your workflow around it.',
              },
              {
                title: 'Compatibility Data',
                desc: 'See at a glance which platforms, editors, and tools work together. No more "does this work on Windows?" surprises.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
