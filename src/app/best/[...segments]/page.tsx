import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getToolsByDimension,
  getToolsByCategoryAndDimension,
  getDistinctDimensions,
  getAllCategorySlugs,
  getCategoryBySlug,
} from '@/lib/queries';
import { getDimensionMeta, getCategoryDisplay } from '@/lib/landing-pages';
import ToolGrid from '@/components/ToolGrid';

interface Props {
  params: Promise<{ segments: string[] }>;
}

export async function generateStaticParams() {
  const [dimensions, categorySlugs] = await Promise.all([
    getDistinctDimensions(),
    getAllCategorySlugs(),
  ]);

  const params: { segments: string[] }[] = [];

  // Single-dimension: /best/python
  for (const { slug } of dimensions) {
    params.push({ segments: [slug] });
  }

  // Cross-product: /best/ai-coding/python
  await Promise.all(
    categorySlugs.map(async (cat) => {
      await Promise.all(
        dimensions.map(async ({ slug }) => {
          const tools = await getToolsByCategoryAndDimension(cat, slug);
          if (tools.length >= 3) {
            params.push({ segments: [cat, slug] });
          }
        }),
      );
    }),
  );

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;

  if (segments.length === 1) {
    const [slug] = segments;
    const meta = getDimensionMeta(slug);
    const tools = await getToolsByDimension(slug);
    if (tools.length < 3) return { title: 'Not Found' };

    const title = `Best ${meta.title} Developer Tools (2026)`;
    const description = `Discover the ${tools.length} best developer tools for ${meta.description}. Curated and ranked by quality score on ToolShelf.`;
    return { title, description, openGraph: { title, description } };
  }

  if (segments.length === 2) {
    const [category, slug] = segments;
    const dimMeta = getDimensionMeta(slug);
    const catDisplay = getCategoryDisplay(category);
    const tools = await getToolsByCategoryAndDimension(category, slug);
    if (tools.length < 3) return { title: 'Not Found' };

    const title = `Best ${catDisplay} Tools for ${dimMeta.title} (2026)`;
    const description = `${tools.length} top ${catDisplay.toLowerCase()} tools for ${dimMeta.description}. Curated and ranked by quality score.`;
    return { title, description, openGraph: { title, description } };
  }

  return { title: 'Not Found' };
}

export default async function BestPage({ params }: Props) {
  const { segments } = await params;

  if (segments.length === 1) {
    return <SingleDimensionPage slug={segments[0]} />;
  }
  if (segments.length === 2) {
    return <CrossProductPage category={segments[0]} slug={segments[1]} />;
  }

  notFound();
}

async function SingleDimensionPage({ slug }: { slug: string }) {
  const tools = await getToolsByDimension(slug);
  if (tools.length < 3) notFound();

  const meta = getDimensionMeta(slug);

  // Find cross-product pages that exist
  const categorySlugs = await getAllCategorySlugs();
  const crossLinks: { category: string; categoryDisplay: string; count: number }[] = [];
  await Promise.all(
    categorySlugs.map(async (cat) => {
      const catTools = await getToolsByCategoryAndDimension(cat, slug);
      if (catTools.length >= 3) {
        crossLinks.push({ category: cat, categoryDisplay: getCategoryDisplay(cat), count: catTools.length });
      }
    }),
  );
  crossLinks.sort((a, b) => b.count - a.count);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${meta.title} Developer Tools`,
    description: `Top developer tools for ${meta.description}`,
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 50).map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      url: `https://toolshelf.dev/tools/${tool.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Best {meta.title} Tools</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Best {meta.title} Developer Tools
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {tools.length} curated tools for {meta.description}, ranked by quality score.
        </p>
      </div>

      <ToolGrid tools={tools} />

      {crossLinks.length > 0 && (
        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Best {meta.title} Tools by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {crossLinks.map(({ category, categoryDisplay, count }) => (
              <Link
                key={category}
                href={`/best/${category}/${slug}`}
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
              >
                {categoryDisplay} ({count})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function CrossProductPage({ category, slug }: { category: string; slug: string }) {
  const tools = await getToolsByCategoryAndDimension(category, slug);
  if (tools.length < 3) notFound();

  const dimMeta = getDimensionMeta(slug);
  const catData = await getCategoryBySlug(category);
  const catDisplay = catData?.name || getCategoryDisplay(category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${catDisplay} Tools for ${dimMeta.title}`,
    description: `Top ${catDisplay.toLowerCase()} tools for ${dimMeta.description}`,
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 50).map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      url: `https://toolshelf.dev/tools/${tool.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${category}`} className="hover:text-zinc-900 dark:hover:text-zinc-100">{catDisplay}</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Best for {dimMeta.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Best {catDisplay} Tools for {dimMeta.title}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {tools.length} curated {catDisplay.toLowerCase()} tools for {dimMeta.description}, ranked by quality score.
        </p>
      </div>

      <ToolGrid tools={tools} />

      <div className="mt-12 flex flex-wrap gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <Link
          href={`/best/${slug}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          All {dimMeta.title} tools
        </Link>
        <Link
          href={`/category/${category}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          All {catDisplay}
        </Link>
      </div>
    </div>
  );
}
