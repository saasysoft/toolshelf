'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { isBookmarked, toggleBookmark } from '@/lib/auth-queries';
import { trackEvent } from '@/lib/analytics';

export default function BookmarkButton({ toolId }: { toolId: string }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      isBookmarked(user.id, toolId).then(setBookmarked);
    }
  }, [user, toolId]);

  if (!user) return null;

  async function handleToggle() {
    if (!user) return;
    setLoading(true);
    const result = await toggleBookmark(user.id, toolId);
    setBookmarked(result);
    setLoading(false);
    trackEvent({
      action: result ? 'bookmark_add' : 'bookmark_remove',
      category: 'engagement',
      label: toolId,
    });
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={loading}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this tool'}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        bookmarked
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      } disabled:opacity-50`}
    >
      <svg
        className="h-3.5 w-3.5"
        fill={bookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
