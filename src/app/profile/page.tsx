'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getProfile, updateProfile, getBookmarkedTools } from '@/lib/auth-queries';
import ToolGrid from '@/components/ToolGrid';
import type { Tool } from '@/types/tool';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then((p) => {
        if (p) {
          setProfile(p);
          setDisplayName(p.display_name || '');
          setBio(p.bio || '');
        }
      });
      getBookmarkedTools(user.id).then(setBookmarkedTools);
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, {
      display_name: displayName,
      bio,
    });
    if (!error) {
      setProfile((prev) => prev ? { ...prev, display_name: displayName, bio } : prev);
      setEditing(false);
    }
    setSaving(false);
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-10 flex items-start gap-5">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={280}
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="A short bio..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile?.display_name || user.email?.split('@')[0]}
                </h1>
                {profile?.display_name && (
                  <Link
                    href={`/u/${encodeURIComponent(profile.display_name)}`}
                    className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    View public profile
                  </Link>
                )}
              </div>
              {profile?.bio && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
              )}
              <p className="mt-1 text-xs text-zinc-400">{user.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="mt-3 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bookmarked Tools */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Bookmarked Tools
          {bookmarkedTools.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-400">({bookmarkedTools.length})</span>
          )}
        </h2>
        {bookmarkedTools.length > 0 ? (
          <ToolGrid tools={bookmarkedTools} />
        ) : (
          <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">
              No bookmarks yet. Browse tools and click the bookmark button to save your favorites.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
