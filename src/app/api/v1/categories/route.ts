import { authenticateApiKey } from '@/lib/api-auth';
import { getCategories } from '@/lib/queries';
import { apiResponse, apiError, filterCategoryForApi } from '@/lib/api-response';

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated) {
    return apiError(auth.error!, auth.status!);
  }

  const categories = await getCategories();
  return apiResponse(categories.map(filterCategoryForApi));
}
