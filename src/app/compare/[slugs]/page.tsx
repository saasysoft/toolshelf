import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getToolsBySlugs } from '@/lib/queries';
import ComparisonTable from '@/components/ComparisonTable';
import type { Tool } from '@/types/tool';

interface Props {
  params: Promise<{ slugs: string }>;
}

function parseSlugs(slugsParam: string): [string, string] | null {
  const parts = slugsParam.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return { title: 'Comparison — ToolShelf' };

  const tools = await getToolsBySlugs(parsed);
  const toolA = tools.find((t) => t.slug === parsed[0]);
  const toolB = tools.find((t) => t.slug === parsed[1]);

  if (!toolA || !toolB) return { title: 'Comparison — ToolShelf' };

  return {
    title: `${toolA.name} vs ${toolB.name} — ToolShelf Comparison`,
    description: `Compare ${toolA.name} and ${toolB.name} side-by-side. Quality scores, stars, maintenance, platforms, and more.`,
    openGraph: {
      title: `${toolA.name} vs ${toolB.name} — ToolShelf`,
      description: `Side-by-side comparison of ${toolA.name} and ${toolB.name}`,
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();

  const tools = await getToolsBySlugs(parsed);
  const toolA = tools.find((t) => t.slug === parsed[0]);
  const toolB = tools.find((t) => t.slug === parsed[1]);

  if (!toolA || !toolB) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Compare</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {toolA.name} vs {toolB.name}
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Side-by-side comparison of {toolA.name} and {toolB.name}
      </p>

      <ComparisonTable tools={[toolA, toolB]} />

      {/* Taglines */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[toolA, toolB].map((tool) => (
          <div key={tool.slug} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <Link href={`/tools/${tool.slug}`} className="text-lg font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
              {tool.name}
            </Link>
            {tool.tagline && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tool.tagline}</p>
            )}
            {tool.description && (
              <p className="mt-2 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">{tool.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${toolA.name} vs ${toolB.name}`,
            description: `Comparison of ${toolA.name} and ${toolB.name}`,
            about: [
              { '@type': 'SoftwareApplication', name: toolA.name },
              { '@type': 'SoftwareApplication', name: toolB.name },
            ],
          }),
        }}
      />
    </div>
  );
}
