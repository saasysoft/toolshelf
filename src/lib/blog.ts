import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BlogPost, BlogPostMeta, BlogPostType } from '@/types/blog';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '');
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      return {
        title: data.title ?? slug,
        slug,
        description: data.description ?? '',
        date: data.date ?? '',
        category: data.category ?? '',
        tags: data.tags ?? [],
        readingTime: stats.text,
        published: data.published !== false,
        type: (data.type as BlogPostType) ?? undefined,
        image: data.image ?? undefined,
      } satisfies BlogPostMeta;
    })
    .filter((p) => p.published)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    title: data.title ?? slug,
    slug,
    description: data.description ?? '',
    date: data.date ?? '',
    category: data.category ?? '',
    tags: data.tags ?? [],
    readingTime: stats.text,
    published: data.published !== false,
    type: (data.type as BlogPostType) ?? undefined,
    image: data.image ?? undefined,
    content,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getPostsByCategory(category: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  return [...new Set(posts.map((p) => p.category).filter(Boolean))].sort();
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  return [...new Set(posts.flatMap((p) => p.tags))].sort();
}
