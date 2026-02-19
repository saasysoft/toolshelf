import { authenticateApiKey } from '@/lib/api-auth';
import { searchTools } from '@/lib/queries';
import { filterToolByTier, paginatedResponse, apiError, parsePagination, parseToolFilters } from '@/lib/api-response';
import type { ToolFilters } from '@/types/tool';

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated) {
    return apiError(auth.error!, auth.status!);
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return apiError('Query parameter "q" is required', 400);
  }

  const { page, perPage } = parsePagination(searchParams);
  const filters = parseToolFilters(searchParams) as ToolFilters;

  const { tools, count } = await searchTools(q, page, filters, perPage);
  const filtered = tools.map(t => filterToolByTier(t, auth.tier));
  return paginatedResponse(filtered, count, page, perPage);
}
