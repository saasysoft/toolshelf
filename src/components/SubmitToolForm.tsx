'use client';

import { useState } from 'react';

const CATEGORIES = [
  { value: '', label: 'Select a category...' },
  { value: 'cli-tools', label: 'CLI Tools' },
  { value: 'editor-extensions', label: 'Editor Extensions' },
  { value: 'devops-infra', label: 'DevOps & Infrastructure' },
  { value: 'testing-quality', label: 'Testing & Quality' },
  { value: 'ai-ml-tools', label: 'AI & ML Tools' },
];

export default function SubmitToolForm() {
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    github_url: '',
    category: '',
    submitted_by: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setFormData({ name: '', website_url: '', github_url: '', category: '', submitted_by: '', notes: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to submit. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tool Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tool Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="e.g., ripgrep"
        />
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Website URL
        </label>
        <input
          type="url"
          id="website_url"
          name="website_url"
          value={formData.website_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="https://example.com"
        />
      </div>

      {/* GitHub URL */}
      <div>
        <label htmlFor="github_url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          GitHub URL
        </label>
        <input
          type="url"
          id="github_url"
          name="github_url"
          value={formData.github_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="https://github.com/user/repo"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Submitted By */}
      <div>
        <label htmlFor="submitted_by" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Name or Email
        </label>
        <input
          type="text"
          id="submitted_by"
          name="submitted_by"
          value={formData.submitted_by}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Optional — so we can credit you"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Why should we add this tool? What makes it great?"
        />
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit Tool'}
      </button>
    </form>
  );
}
