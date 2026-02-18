import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getToolBySlug, getAlternativesFor } from '@/lib/queries';
import ToolGrid from '@/components/ToolGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: 'Alternatives — ToolShelf' };

  return {
    title: `Best ${tool.name} Alternatives — ToolShelf`,
    description: `Discover the best alternatives to ${tool.name}. Compare quality scores, features, and more on ToolShelf.`,
    openGraph: {
      title: `Best ${tool.name} Alternatives — ToolShelf`,
      description: `Top alternatives to ${tool.name} for developers`,
    },
  };
}

export default async function AlternativesPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const alternatives = await getAlternativesFor(tool);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/tools/${tool.slug}`} className="hover:text-zinc-900 dark:hover:text-zinc-100">{tool.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Alternatives</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Best {tool.name} Alternatives
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        {alternatives.length} alternative{alternatives.length !== 1 ? 's' : ''} to{' '}
        <Link href={`/tools/${tool.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
          {tool.name}
        </Link>
        , sorted by quality score.
      </p>

      {alternatives.length > 0 ? (
        <ToolGrid tools={alternatives} />
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          No alternatives found yet. Check back later or{' '}
          <Link href="/submit" className="text-blue-600 hover:underline dark:text-blue-400">suggest one</Link>.
        </p>
      )}
    </div>
  );
}
