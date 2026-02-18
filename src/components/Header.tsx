import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tool<span className="text-blue-600">Shelf</span>
          </span>
        </Link>

        <div className="hidden flex-1 sm:block sm:max-w-md lg:max-w-lg">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            href="/category/cli-tools"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Browse
          </Link>
          <Link
            href="/collections"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Collections
          </Link>
          <Link
            href="/submit"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Submit
          </Link>
        </nav>
      </div>
    </header>
  );
}
