import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollections } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Collections — ToolShelf',
  description: 'Curated collections of developer tools, hand-picked for specific workflows and use cases.',
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Collections</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Collections
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Curated bundles of developer tools for specific workflows.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
              {collection.title}
            </h2>
            {collection.description && (
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {collection.description}
              </p>
            )}
            <div className="mt-auto pt-4">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {collection.tool_ids.length} tool{collection.tool_ids.length !== 1 ? 's' : ''}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {collections.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">No collections yet. Check back soon!</p>
      )}
    </div>
  );
}
