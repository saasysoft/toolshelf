import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';

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
  hr: () => <hr className="my-8 border-zinc-200 dark:border-zinc-800" />,
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        &larr; Back to blog
      </Link>

      <header className="mb-10">
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
              <Link
                href={`/category/${post.category}`}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {post.category}
              </Link>
            </>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            {post.description}
          </p>
        )}
      </header>

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
  );
}
