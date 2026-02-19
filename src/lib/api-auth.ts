import { supabase } from './supabase';

export type ApiTier = 'free' | 'pro' | 'enterprise';

export type AuthResult =
  | { authenticated: true; tier: ApiTier }
  | { authenticated: false; tier?: undefined; error: string; status: number };

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const RATE_LIMITS: Record<ApiTier, number> = {
  free: 100,
  pro: 5000,
  enterprise: 1000000,
};

export async function authenticateApiKey(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid Authorization header. Use: Bearer ts_live_...', status: 401 };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith('ts_live_')) {
    return { authenticated: false, error: 'Invalid API key format', status: 401 };
  }

  const keyHash = await sha256(apiKey);

  const { data: keyRecord, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (error || !keyRecord) {
    return { authenticated: false, error: 'Invalid or revoked API key', status: 401 };
  }

  const tier = keyRecord.tier as ApiTier;
  const today = new Date().toISOString().split('T')[0];

  // Reset daily counter if new day
  let requestsToday = keyRecord.requests_today;
  if (keyRecord.last_reset_date !== today) {
    requestsToday = 0;
  }

  // Check rate limit
  const limit = RATE_LIMITS[tier];
  if (requestsToday >= limit) {
    return {
      authenticated: false,
      error: `Rate limit exceeded. ${tier} tier allows ${limit} requests/day. Upgrade at https://toolshelf.dev/api`,
      status: 429,
    };
  }

  // Increment counter
  await supabase
    .from('api_keys')
    .update({
      requests_today: requestsToday + 1,
      requests_month: keyRecord.last_reset_date !== today && today.endsWith('-01')
        ? 1
        : (keyRecord.requests_month || 0) + 1,
      last_request_at: new Date().toISOString(),
      last_reset_date: today,
    })
    .eq('id', keyRecord.id);

  return { authenticated: true, tier };
}

export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ts_live_';
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export { sha256 };
