import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple in-memory rate limiting (per IP, 5 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count++;
  return entry.count > 5;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, subscribed_at: new Date().toISOString(), unsubscribed_at: null },
      { onConflict: 'email' }
    );

  if (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ message: "You're in! We'll send you the good stuff." });
}

export async function GET() {
  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .is('unsubscribed_at', null);

  if (error) {
    console.error('Newsletter count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }

  return NextResponse.json(
    { count: count ?? 0 },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
