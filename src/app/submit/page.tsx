import type { Metadata } from 'next';
import Link from 'next/link';
import SubmitToolForm from '@/components/SubmitToolForm';
import AuthGate from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'Submit a Tool — ToolShelf',
  description: 'Suggest a developer tool for inclusion on ToolShelf. We review every submission.',
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Submit a Tool</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Submit a Tool
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Know a great developer tool that should be on ToolShelf? Let us know!
        We review every submission and enrich it with quality scores.
      </p>

      <AuthGate message="Sign in to submit a developer tool to ToolShelf. We review every submission and enrich it with quality scores.">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <SubmitToolForm />
        </div>
      </AuthGate>
    </div>
  );
}
