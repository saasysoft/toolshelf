import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllSlugs, getPostBySlug, getPostsByCategory } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import BlogTypeBadge from '@/components/BlogTypeBadge';
import TableOfContents from '@/components/TableOfContents';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2 className="mb-4 mt-10 text-2xl font-bold text-zinc-900 dark:text-zinc-100" {...props} />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 className="mb-3 mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100" {...props} />
  ),
  p: (props: React.ComponentProps<'p'>) => (
    <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  ol: (props: React.ComponentProps<'ol'>) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300" {...props} />
  ),
  li: (props: React.ComponentProps<'li'>) => (
    <li className="leading-7" {...props} />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a className="text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300" {...props} />
  ),
  blockquote: (props: React.ComponentProps<'blockquote'>) => (
    <blockquote className="mb-4 border-l-4 border-blue-200 pl-4 italic text-zinc-600 dark:border-blue-800 dark:text-zinc-400" {...props} />
  ),
  code: (props: React.ComponentProps<'code'>) => (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" {...props} />
  ),
  pre: (props: React.ComponentProps<'pre'>) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-800" {...props} />
  ),
  img: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="mb-4 rounded-lg" alt={props.alt ?? ''} {...props} />
  ),
  hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getPostsByCategory(post.category)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const siteUrl = 'https://toolshelf.dev';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'ToolShelf',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolShelf',
      url: siteUrl,
    },
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    keywords: post.tags.join(', '),
    articleSection: post.category,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero header */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-blue-50/50 to-white px-4 py-12 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
            <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-300">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-zinc-600 dark:hover:text-zinc-300">Blog</Link>
            <span>/</span>
            <span className="truncate text-zinc-600 dark:text-zinc-400">{post.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <Link
                href={`/blog?category=${post.category}`}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {post.category}
              </Link>
            )}
            {post.type && <BlogTypeBadge type={post.type} />}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {post.title}
          </h1>
          {post.description && (
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>&middot;</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </section>

      {/* Content + ToC layout */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
          {/* Article */}
          <article className="min-w-0 max-w-3xl">
            <div className="prose-custom">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {post.tags.length > 0 && (
              <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar ToC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents />
            </div>
          </aside>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
