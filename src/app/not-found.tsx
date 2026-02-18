import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-zinc-200 dark:text-zinc-800">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Page not found</h2>
      <p className="mt-2 text-zinc-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}
