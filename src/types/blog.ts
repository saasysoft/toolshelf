export type BlogPostType = 'best-of' | 'comparison' | 'deep-dive' | 'guide' | 'roundup';

export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  published: boolean;
  type?: BlogPostType;
  image?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
