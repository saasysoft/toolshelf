import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 minute between submissions per IP

export async function POST(request: Request) {
  // Basic rate limiting by IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const lastSubmit = rateLimitMap.get(ip);
  if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: 'Please wait before submitting again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, website_url, github_url, category, submitted_by, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tool name is required.' }, { status: 400 });
    }

    // Basic URL validation
    if (website_url && !/^https?:\/\/.+/.test(website_url)) {
      return NextResponse.json({ error: 'Invalid website URL.' }, { status: 400 });
    }
    if (github_url && !/^https?:\/\/.+/.test(github_url)) {
      return NextResponse.json({ error: 'Invalid GitHub URL.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('submissions').insert({
      name: name.trim(),
      website_url: website_url?.trim() || null,
      github_url: github_url?.trim() || null,
      category: category?.trim() || null,
      submitted_by: submitted_by?.trim() || null,
      notes: notes?.trim() || null,
    });

    if (error) {
      console.error('Submission insert error:', error.message);
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
    }

    rateLimitMap.set(ip, Date.now());

    return NextResponse.json({ success: true, message: 'Tool submitted successfully! We\'ll review it soon.' });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
