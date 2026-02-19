import { authenticateApiKey } from '@/lib/api-auth';
import { getToolBySlug } from '@/lib/queries';
import { filterToolByTier, apiResponse, apiError } from '@/lib/api-response';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (!auth.authenticated) {
    return apiError(auth.error!, auth.status!);
  }

  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return apiError('Tool not found', 404);
  }

  return apiResponse(filterToolByTier(tool, auth.tier));
}
