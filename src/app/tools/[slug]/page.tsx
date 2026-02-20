import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getToolBySlug, getRelatedTools, getCollections, getAllToolSlugs } from '@/lib/queries';
import QualityBadge from '@/components/QualityBadge';
import MaintenanceBadge from '@/components/MaintenanceBadge';
import PlatformBadges from '@/components/PlatformBadges';
import ToolGrid from '@/components/ToolGrid';
import BookmarkButton from '@/components/BookmarkButton';
import ExtLink from '@/components/ExtLink';
import { formatNumber, formatDate, getDifficultyColor, getInstallCommand } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} — ${tool.tagline || 'Developer Tool'}`,
    description: tool.tagline || tool.description?.slice(0, 160) || `${tool.name} on ToolShelf`,
    openGraph: {
      title: `${tool.name} — ToolShelf`,
      description: tool.tagline || undefined,
    },
    other: {
      'application-name': 'ToolShelf',
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const [related, collections, allSlugs] = await Promise.all([
    getRelatedTools(tool),
    getCollections(),
    getAllToolSlugs(),
  ]);

  const slugSet = new Set(allSlugs);
  const toolCollections = collections.filter((c) => c.tool_ids.includes(tool.id));
  const installCmd = getInstallCommand(tool);
  const firstRelatedSlug = related[0]?.slug;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${tool.category}`} className="capitalize hover:text-zinc-900 dark:hover:text-zinc-100">
          {tool.category.replace(/-/g, ' ')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{tool.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{tool.name}</h1>
            {tool.tagline && (
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{tool.tagline}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BookmarkButton toolId={tool.id} />
            <QualityBadge score={tool.quality_score} />
            <MaintenanceBadge status={tool.maintenance} />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={`/alternatives/${tool.slug}`}
          className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50"
        >
          See Alternatives
        </Link>
        {firstRelatedSlug && (
          <Link
            href={`/compare/${tool.slug}-vs-${firstRelatedSlug}`}
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            Compare...
          </Link>
        )}
      </div>

      {/* Stats Row */}
      <div className="mb-8 flex flex-wrap gap-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        {tool.github_stars > 0 && (
          <Stat label="Stars" value={formatNumber(tool.github_stars)} highlight />
        )}
        {tool.npm_weekly_downloads && (
          <Stat label="Weekly Downloads" value={formatNumber(tool.npm_weekly_downloads)} highlight />
        )}
        {tool.pypi_monthly_downloads && (
          <Stat label="Monthly Downloads" value={formatNumber(tool.pypi_monthly_downloads)} highlight />
        )}
        {tool.last_release && (
          <Stat label="Latest" value={tool.last_release} />
        )}
        {tool.last_commit && (
          <Stat label="Last Commit" value={formatDate(tool.last_commit)} />
        )}
        {tool.license && (
          <Stat label="License" value={tool.license} />
        )}
        {tool.contributor_count > 0 && (
          <Stat label="Contributors" value={formatNumber(tool.contributor_count)} highlight />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          {tool.description && (
            <div className="prose prose-zinc mb-8 max-w-none dark:prose-invert">
              <p>{tool.description}</p>
            </div>
          )}

          {/* Getting Started */}
          {installCmd && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Getting Started</h2>
              <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-700">
                <div className="mb-1 text-xs text-zinc-500">{installCmd.label}</div>
                <code className="text-sm text-emerald-400">{installCmd.command}</code>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Links */}
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Links</h3>
            <div className="space-y-2">
              {tool.website_url && (
                <ExtLink href={tool.website_url} label="Website" />
              )}
              {tool.github_url && (
                <ExtLink href={tool.github_url} label="GitHub" />
              )}
              {tool.npm_url && (
                <ExtLink href={tool.npm_url} label="npm" />
              )}
              {tool.pypi_url && (
                <ExtLink href={tool.pypi_url} label="PyPI" />
              )}
            </div>
          </div>

          {/* Platforms */}
          {tool.platforms?.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Platforms</h3>
              <PlatformBadges platforms={tool.platforms} />
            </div>
          )}

          {/* Install Difficulty */}
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Install Difficulty</h3>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${getDifficultyColor(tool.install_difficulty)}`}>
              {tool.install_difficulty}
            </span>
          </div>

          {/* Works With */}
          {tool.works_with?.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Works With</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.works_with.map((w) => {
                  const wSlug = w.toLowerCase().replace(/\s+/g, '-');
                  const isLinked = slugSet.has(wSlug);
                  return isLinked ? (
                    <Link key={w} href={`/tools/${wSlug}`} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                      {w}
                    </Link>
                  ) : (
                    <span key={w} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {w}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alternative To */}
          {tool.alternative_to?.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alternative To</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.alternative_to.map((a) => {
                  const aSlug = a.toLowerCase().replace(/\s+/g, '-');
                  const isLinked = slugSet.has(aSlug);
                  return isLinked ? (
                    <Link key={a} href={`/tools/${aSlug}`} className="rounded-md bg-violet-50 px-2 py-0.5 text-xs text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50">
                      {a}
                    </Link>
                  ) : (
                    <Link key={a} href={`/alternatives/${tool.slug}`} className="rounded-md bg-violet-50 px-2 py-0.5 text-xs text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50">
                      {a}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* In Collections */}
          {toolCollections.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">In Collections</h3>
              <div className="space-y-1.5">
                {toolCollections.map((c) => (
                  <Link key={c.id} href={`/collections/${c.slug}`} className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    {c.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {tool.languages?.length > 0 && (
            <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Built With</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.languages.map((l) => (
                  <span key={l} className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Tools */}
      {related.length > 0 && (
        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Similar Tools</h2>
            <Link
              href={`/alternatives/${tool.slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              See all alternatives &rarr;
            </Link>
          </div>
          <ToolGrid tools={related} />
        </div>
      )}

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            description: tool.tagline || tool.description,
            url: `https://toolshelf.dev/tools/${tool.slug}`,
            applicationCategory: 'DeveloperApplication',
            ...(tool.platforms?.length && { operatingSystem: tool.platforms.join(', ') }),
            ...(tool.last_release && { softwareVersion: tool.last_release }),
            ...(tool.license && { license: tool.license }),
            ...((tool.pricing === 'free' || tool.pricing === 'open-source') && {
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }),
        }}
      />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className={`font-semibold text-zinc-900 dark:text-zinc-100 ${highlight ? 'text-base' : 'text-sm'}`}>{value}</dd>
    </div>
  );
}

