import type { Tool, Category } from '@/types/tool';
import type { ApiTier } from './api-auth';

const FREE_TOOL_FIELDS = [
  'slug', 'name', 'tagline', 'category', 'github_url', 'website_url',
  'quality_score', 'maintenance', 'pricing', 'github_stars',
] as const;

export function filterToolByTier(tool: Tool, tier: ApiTier): Partial<Tool> & { url: string } {
  if (tier === 'pro' || tier === 'enterprise') {
    return { ...tool, url: `https://toolshelf.dev/tools/${tool.slug}` };
  }
  // Free tier: basic fields only
  const filtered: Record<string, unknown> = {};
  for (const field of FREE_TOOL_FIELDS) {
    filtered[field] = tool[field];
  }
  filtered.url = `https://toolshelf.dev/tools/${tool.slug}`;
  return filtered as Partial<Tool> & { url: string };
}

export function apiResponse(data: unknown, meta: Record<string, unknown> = {}) {
  return Response.json({
    data,
    meta: {
      source: 'toolshelf.dev',
      attribution: 'Data from ToolShelf.dev — the curated developer tools directory',
      ...meta,
    },
  });
}

export function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function paginatedResponse(
  items: unknown[],
  total: number,
  page: number,
  perPage: number,
) {
  return apiResponse(items, {
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  });
}

export function parsePagination(params: URLSearchParams): { page: number; perPage: number } {
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(params.get('per_page') || '24', 10)));
  return { page, perPage };
}

export function parseToolFilters(params: URLSearchParams) {
  const filters: Record<string, unknown> = {};

  const category = params.get('category');
  if (category) filters.category = category;

  const language = params.get('language');
  if (language) filters.languages = [language];

  const platform = params.get('platform');
  if (platform) filters.platforms = [platform];

  const maintenance = params.get('maintenance');
  if (maintenance) filters.maintenance = [maintenance];

  const pricing = params.get('pricing');
  if (pricing) filters.pricing = [pricing];

  const minScore = params.get('min_score');
  if (minScore) filters.minScore = parseInt(minScore, 10);

  const sort = params.get('sort');
  if (sort && ['quality_score', 'github_stars', 'name', 'created_at'].includes(sort)) {
    filters.sort = sort;
  }

  return filters;
}

export function filterCategoryForApi(category: Category) {
  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    tool_count: category.tool_count,
    url: `https://toolshelf.dev/category/${category.slug}`,
  };
}
