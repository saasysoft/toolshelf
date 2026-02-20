'use client';

import { useState, useEffect } from 'react';

function formatCount(count: number): string {
  if (count > 500) {
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded}+`;
  }
  if (count > 50) {
    const rounded = Math.floor(count / 10) * 10;
    return `${rounded}+`;
  }
  return `${count}`;
}

export default function NewsletterForm({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/newsletter')
      .then((res) => res.json())
      .then((data) => {
        if (data.count > 0) setSubscriberCount(data.count);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {message}
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={variant === 'compact' ? 'flex gap-2' : 'flex flex-col gap-3 sm:flex-row sm:gap-2'}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-500 sm:col-span-2">{message}</p>
        )}
      </form>
      {subscriberCount > 0 && (
        <p className="mt-2 text-xs text-zinc-400">
          Join {formatCount(subscriberCount)} developers
        </p>
      )}
    </div>
  );
}
