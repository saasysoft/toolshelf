import type { MetadataRoute } from 'next';
import { getAllToolSlugs, getAllCategorySlugs, getAllCollectionSlugs, getDistinctDimensions, getToolsByCategoryAndDimension } from '@/lib/queries';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://toolshelf.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [toolSlugs, categorySlugs, collectionSlugs, dimensions] = await Promise.all([
    getAllToolSlugs(),
    getAllCategorySlugs(),
    getAllCollectionSlugs(),
    getDistinctDimensions(),
  ]);

  const blogPosts = getAllPosts();

  // Build cross-product landing pages (category × dimension with 3+ tools)
  const crossProductPages: { category: string; slug: string }[] = [];
  await Promise.all(
    categorySlugs.map(async (cat) => {
      await Promise.all(
        dimensions.map(async ({ slug }) => {
          const tools = await getToolsByCategoryAndDimension(cat, slug);
          if (tools.length >= 3) {
            crossProductPages.push({ category: cat, slug });
          }
        }),
      );
    }),
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/search`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/submit`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/collections`, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/category/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${BASE_URL}/collections/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const toolPages: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const alternativePages: MetadataRoute.Sitemap = toolSlugs.map((slug) => ({
    url: `${BASE_URL}/alternatives/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const bestSinglePages: MetadataRoute.Sitemap = dimensions.map(({ slug }) => ({
    url: `${BASE_URL}/best/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const bestCrossPages: MetadataRoute.Sitemap = crossProductPages.map(({ category, slug }) => ({
    url: `${BASE_URL}/best/${category}/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...collectionPages,
    ...toolPages,
    ...alternativePages,
    ...blogPages,
    ...bestSinglePages,
    ...bestCrossPages,
  ];
}
