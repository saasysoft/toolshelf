import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Categories</h3>
            <ul className="mt-3 space-y-2">
              {[
                { slug: 'cli-tools', name: 'CLI Tools' },
                { slug: 'ai-coding', name: 'AI Coding' },
                { slug: 'mcp-servers', name: 'MCP Servers' },
                { slug: 'self-hosted', name: 'Self-Hosted' },
                { slug: 'developer-productivity', name: 'Productivity' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resources</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Search</Link></li>
              <li><Link href="/collections/claude-code-starter-kit" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">Collections</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">About ToolShelf</h3>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              A curated directory of developer power tools with AI-enriched quality scores,
              maintenance status, and compatibility data. No more guessing if a tool is actively maintained.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            ToolShelf.dev &mdash; Built for developers who care about their tools.
          </p>
        </div>
      </div>
    </footer>
  );
}
