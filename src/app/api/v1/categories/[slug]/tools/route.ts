import { authenticateApiKey } from '@/lib/api-auth';
import { getTools, getCategoryBySlug } from '@/lib/queries';
import { filterToolByTier, paginatedResponse, apiError, parsePagination, parseToolFilters } from '@/lib/api-response';
import type { ToolFilters } from '@/types/tool';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated) {
    return apiError(auth.error!, auth.status!);
  }

  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return apiError('Category not found', 404);
  }

  const { searchParams } = new URL(request.url);
  const { page, perPage } = parsePagination(searchParams);
  const filters = { ...parseToolFilters(searchParams), category: slug } as ToolFilters;

  const { tools, count } = await getTools(filters, page, perPage);
  const filtered = tools.map(t => filterToolByTier(t, auth.tier));
  return paginatedResponse(filtered, count, page, perPage);
}
