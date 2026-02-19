import type { Metadata } from 'next';
import Link from 'next/link';
import ApiKeyForm from '@/components/ApiKeyForm';

export const metadata: Metadata = {
  title: 'API Access — ToolShelf',
  description: 'Get a free API key to access ToolShelf developer tools data programmatically.',
};

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">API Access</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        API Access
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Access ToolShelf data programmatically. Search 970+ developer tools with quality scores,
        GitHub stats, and compatibility data.
      </p>

      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Get Your Free API Key
        </h2>
        <ApiKeyForm />
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            API Tiers
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Free</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">100 requests/day</p>
                <p className="text-sm text-zinc-500">Basic fields: name, slug, category, tagline, quality score, GitHub URL</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Pro</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">5,000 requests/day — $19/mo</p>
                <p className="text-sm text-zinc-500">All fields including enrichment data, download stats, and compatibility info</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="mt-0.5 rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Enterprise</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Unlimited — Custom pricing</p>
                <p className="text-sm text-zinc-500">Full access + bulk export + webhook notifications</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Start
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">Search tools:</p>
              <code className="block rounded bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
                &nbsp;&nbsp;&quot;https://toolshelf.dev/api/v1/search?q=code+editor&quot;
              </code>
            </div>
            <div>
              <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">Get a specific tool:</p>
              <code className="block rounded bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
                &nbsp;&nbsp;&quot;https://toolshelf.dev/api/v1/tools/cursor&quot;
              </code>
            </div>
            <div>
              <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">Browse by category:</p>
              <code className="block rounded bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
                &nbsp;&nbsp;&quot;https://toolshelf.dev/api/v1/categories/ai-coding/tools&quot;
              </code>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Endpoints
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['GET /api/v1/tools', 'List and filter tools (paginated)'],
              ['GET /api/v1/tools/:slug', 'Get a single tool by slug'],
              ['GET /api/v1/categories', 'List all categories'],
              ['GET /api/v1/categories/:slug/tools', 'Tools in a category'],
              ['GET /api/v1/search?q=...', 'Full-text search'],
              ['GET /api/v1/stats', 'Directory statistics'],
              ['POST /api/v1/register', 'Register for an API key'],
            ].map(([endpoint, desc]) => (
              <div key={endpoint} className="flex items-start gap-3">
                <code className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{endpoint}</code>
                <span className="text-zinc-600 dark:text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Query Parameters
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['q', 'Search query (for /search endpoint)'],
              ['category', 'Filter by category slug'],
              ['language', 'Filter by programming language'],
              ['platform', 'Filter by platform'],
              ['maintenance', 'Filter by status (active, slowing, stale, abandoned)'],
              ['pricing', 'Filter by pricing (free, freemium, paid, open-source)'],
              ['min_score', 'Minimum quality score (0-100)'],
              ['sort', 'Sort by: quality_score, github_stars, name, created_at'],
              ['page', 'Page number (default: 1)'],
              ['per_page', 'Results per page (max: 50, default: 24)'],
            ].map(([param, desc]) => (
              <div key={param} className="flex items-start gap-3">
                <code className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{param}</code>
                <span className="text-zinc-600 dark:text-zinc-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            MCP Server
          </h2>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Connect ToolShelf directly to Claude, Cursor, or any MCP-compatible AI tool:
          </p>
          <code className="block rounded bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {`{
  "mcpServers": {
    "toolshelf": {
      "type": "url",
      "url": "https://toolshelf.dev/api/mcp"
    }
  }
}`}
          </code>
        </div>
      </div>
    </div>
  );
}
