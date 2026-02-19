import { supabase } from '@/lib/supabase';
import { generateApiKey, sha256 } from '@/lib/api-auth';
import { apiError } from '@/lib/api-response';

export async function POST(request: Request) {
  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { email, name } = body;

  if (!email || !email.includes('@')) {
    return apiError('Valid email is required', 400);
  }

  // Check if email already has an active key
  const { data: existing } = await supabase
    .from('api_keys')
    .select('key_prefix')
    .eq('email', email)
    .is('revoked_at', null)
    .limit(1);

  if (existing && existing.length > 0) {
    return apiError(
      `An active API key already exists for this email (${existing[0].key_prefix}...). Contact support to reset.`,
      409,
    );
  }

  const apiKey = generateApiKey();
  const keyHash = await sha256(apiKey);
  const keyPrefix = apiKey.slice(0, 16);

  const { error } = await supabase.from('api_keys').insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name: name || null,
    email,
    tier: 'free',
  });

  if (error) {
    console.error('API key registration error:', error.message);
    return apiError('Failed to create API key', 500);
  }

  return Response.json({
    api_key: apiKey,
    prefix: keyPrefix,
    tier: 'free',
    rate_limit: '100 requests/day',
    message: 'Save this API key — it cannot be retrieved again. Use it in the Authorization header: Bearer ' + apiKey,
    docs: 'https://toolshelf.dev/api/v1/docs',
  }, { status: 201 });
}
