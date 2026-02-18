import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollectionBySlug, getToolsByIds } from '@/lib/queries';
import ToolGrid from '@/components/ToolGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'Collection Not Found' };

  return {
    title: `${collection.title} — ToolShelf Collection`,
    description: collection.description || `A curated collection of ${collection.tool_ids.length} developer tools.`,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const tools = await getToolsByIds(collection.tool_ids);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/collections" className="hover:text-zinc-900 dark:hover:text-zinc-100">Collections</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{collection.title}</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {collection.title}
      </h1>
      {collection.description && (
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">{collection.description}</p>
      )}

      {tools.length > 0 ? (
        <ToolGrid tools={tools} />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">No tools in this collection yet.</p>
      )}
    </div>
  );
}
