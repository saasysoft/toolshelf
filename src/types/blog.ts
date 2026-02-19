export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  published: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
