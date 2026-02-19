import { authenticateApiKey } from '@/lib/api-auth';
import { getToolCount, getCategories } from '@/lib/queries';
import { apiResponse, apiError } from '@/lib/api-response';

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated) {
    return apiError(auth.error!, auth.status!);
  }

  const [toolCount, categories] = await Promise.all([
    getToolCount(),
    getCategories(),
  ]);

  return apiResponse({
    total_tools: toolCount,
    total_categories: categories.length,
    categories: categories.map(c => ({
      slug: c.slug,
      name: c.name,
      tool_count: c.tool_count,
    })),
  });
}
