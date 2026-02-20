import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

async function getPublicProfile(username: string) {
  const decoded = decodeURIComponent(username);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, bio, created_at')
    .ilike('display_name', decoded)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return { title: 'User Not Found' };
  }

  return {
    title: `${profile.display_name} — ToolShelf`,
    description: profile.bio || `${profile.display_name}'s profile on ToolShelf`,
    openGraph: {
      title: `${profile.display_name} — ToolShelf`,
      description: profile.bio || `${profile.display_name}'s profile on ToolShelf`,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const initial = (profile.display_name || 'U')[0].toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-10 flex items-start gap-5">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${profile.display_name}'s avatar`}
            className="h-20 w-20 rounded-full"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {profile.display_name}
          </h1>
          {profile.bio && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
          )}
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Public info section */}
      <section>
        <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400">
            This is {profile.display_name}&apos;s public profile. More activity coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}
