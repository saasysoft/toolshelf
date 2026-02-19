import { Server } from '@modelcontextprotocol/sdk/server';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { searchTools, getToolBySlug, getCategories, getTools, getRecentTools, getAlternativesFor } from './queries';
import type { Tool, ToolFilters } from '@/types/tool';

function formatTool(tool: Tool): string {
  const lines = [
    `**${tool.name}** (${tool.slug})`,
    tool.tagline ? `> ${tool.tagline}` : '',
    '',
    tool.description || '',
    '',
    `- Category: ${tool.category}`,
    `- Quality Score: ${tool.quality_score}/100`,
    `- Maintenance: ${tool.maintenance}`,
    `- Pricing: ${tool.pricing}`,
    tool.github_stars ? `- GitHub Stars: ${tool.github_stars.toLocaleString()}` : '',
    tool.github_url ? `- GitHub: ${tool.github_url}` : '',
    tool.website_url ? `- Website: ${tool.website_url}` : '',
    tool.languages.length ? `- Languages: ${tool.languages.join(', ')}` : '',
    tool.platforms.length ? `- Platforms: ${tool.platforms.join(', ')}` : '',
    tool.license ? `- License: ${tool.license}` : '',
    '',
    `View on ToolShelf: https://toolshelf.dev/tools/${tool.slug}`,
  ];
  return lines.filter(Boolean).join('\n');
}

function formatToolList(tools: Tool[]): string {
  return tools.map((t, i) =>
    `${i + 1}. **${t.name}** — ${t.tagline || 'No description'} (Score: ${t.quality_score}, Stars: ${t.github_stars?.toLocaleString() || 'N/A'}) [View](https://toolshelf.dev/tools/${t.slug})`
  ).join('\n');
}

export function createMcpServer(): Server {
  const server = new Server(
    { name: 'toolshelf', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_tools',
        description: 'Search developer tools by query, category, or language. Returns tools with quality scores, GitHub stats, and metadata from ToolShelf.dev.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: { type: 'string', description: 'Search query (e.g., "code editor", "database gui")' },
            category: { type: 'string', description: 'Category slug', enum: ['mcp-servers', 'cli-tools', 'ai-coding', 'self-hosted', 'developer-productivity', 'data-tools', 'devops-infra', 'security', 'media-design', 'automation'] },
            language: { type: 'string', description: 'Programming language filter (e.g., "TypeScript", "Python")' },
            min_score: { type: 'number', description: 'Minimum quality score (0-100)' },
            limit: { type: 'number', description: 'Max results (default 10, max 25)' },
          },
        },
      },
      {
        name: 'get_tool',
        description: 'Get detailed information about a specific developer tool by its slug. Returns quality score, GitHub stats, maintenance status, and more from ToolShelf.dev.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            slug: { type: 'string', description: 'Tool slug (e.g., "cursor", "neovim", "supabase")' },
          },
          required: ['slug'],
        },
      },
      {
        name: 'list_categories',
        description: 'List all tool categories on ToolShelf.dev with descriptions and tool counts.',
        inputSchema: { type: 'object' as const, properties: {} },
      },
      {
        name: 'compare_tools',
        description: 'Compare 2-3 developer tools side by side on quality score, GitHub stats, maintenance, and features.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            slugs: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tool slugs to compare (2-3)',
              minItems: 2,
              maxItems: 3,
            },
          },
          required: ['slugs'],
        },
      },
      {
        name: 'find_alternatives',
        description: 'Find alternative tools to a given tool, ranked by quality score.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            slug: { type: 'string', description: 'Tool slug to find alternatives for' },
            limit: { type: 'number', description: 'Max alternatives (default 5, max 12)' },
          },
          required: ['slug'],
        },
      },
      {
        name: 'get_trending',
        description: 'Get recently added or highest-rated developer tools from ToolShelf.dev.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            sort: { type: 'string', enum: ['recent', 'top_rated', 'most_stars'], description: 'Sort order (default: recent)' },
            category: { type: 'string', description: 'Optional category filter' },
            limit: { type: 'number', description: 'Max results (default 10, max 25)' },
          },
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const params = args || {};

    try {
      switch (name) {
        case 'search_tools': {
          const query = params.query as string | undefined;
          const category = params.category as string | undefined;
          const language = params.language as string | undefined;
          const minScore = params.min_score as number | undefined;
          const limit = Math.min(params.limit as number || 10, 25);

          let tools: Tool[];
          let count: number;

          if (query) {
            const filters: ToolFilters = {};
            if (category) filters.category = category;
            if (language) filters.languages = [language];
            if (minScore) filters.minScore = minScore;
            const result = await searchTools(query, 1, filters, limit);
            tools = result.tools;
            count = result.count;
          } else {
            const filters: ToolFilters = {};
            if (category) filters.category = category;
            if (language) filters.languages = [language];
            if (minScore) filters.minScore = minScore;
            const result = await getTools(filters, 1, limit);
            tools = result.tools;
            count = result.count;
          }

          const text = tools.length
            ? `Found ${count} tools${query ? ` matching "${query}"` : ''}${category ? ` in ${category}` : ''}:\n\n${formatToolList(tools)}\n\nSource: ToolShelf.dev`
            : `No tools found${query ? ` matching "${query}"` : ''}. Try a different query or browse categories.`;

          return { content: [{ type: 'text', text }] };
        }

        case 'get_tool': {
          const slug = params.slug as string;
          const tool = await getToolBySlug(slug);
          if (!tool) {
            return { content: [{ type: 'text', text: `Tool "${slug}" not found. Try searching with search_tools.` }] };
          }
          return { content: [{ type: 'text', text: `${formatTool(tool)}\n\nSource: ToolShelf.dev` }] };
        }

        case 'list_categories': {
          const categories = await getCategories();
          const text = categories.map(c =>
            `- **${c.name}** (\`${c.slug}\`) — ${c.description || 'No description'} (${c.tool_count} tools)`
          ).join('\n');
          return { content: [{ type: 'text', text: `ToolShelf Categories:\n\n${text}\n\nSource: ToolShelf.dev` }] };
        }

        case 'compare_tools': {
          const slugs = params.slugs as string[];
          const tools = await Promise.all(slugs.map(s => getToolBySlug(s)));
          const found = tools.filter((t): t is Tool => t !== null);

          if (found.length < 2) {
            return { content: [{ type: 'text', text: 'Could not find enough tools to compare. Check the slugs and try again.' }] };
          }

          const header = '| Feature | ' + found.map(t => t.name).join(' | ') + ' |';
          const sep = '|---|' + found.map(() => '---').join('|') + '|';
          const rows = [
            ['Quality Score', ...found.map(t => `${t.quality_score}/100`)],
            ['GitHub Stars', ...found.map(t => t.github_stars?.toLocaleString() || 'N/A')],
            ['Maintenance', ...found.map(t => t.maintenance)],
            ['Pricing', ...found.map(t => t.pricing)],
            ['License', ...found.map(t => t.license || 'N/A')],
            ['Languages', ...found.map(t => t.languages.join(', ') || 'N/A')],
            ['Platforms', ...found.map(t => t.platforms.join(', ') || 'N/A')],
            ['Install Difficulty', ...found.map(t => t.install_difficulty)],
          ].map(row => '| ' + row.join(' | ') + ' |').join('\n');

          return { content: [{ type: 'text', text: `Tool Comparison:\n\n${header}\n${sep}\n${rows}\n\nSource: ToolShelf.dev` }] };
        }

        case 'find_alternatives': {
          const slug = params.slug as string;
          const limit = Math.min(params.limit as number || 5, 12);
          const tool = await getToolBySlug(slug);
          if (!tool) {
            return { content: [{ type: 'text', text: `Tool "${slug}" not found.` }] };
          }
          const alternatives = await getAlternativesFor(tool, limit);
          const text = alternatives.length
            ? `Alternatives to ${tool.name}:\n\n${formatToolList(alternatives)}`
            : `No alternatives found for ${tool.name}.`;
          return { content: [{ type: 'text', text: `${text}\n\nSource: ToolShelf.dev` }] };
        }

        case 'get_trending': {
          const sort = params.sort as string || 'recent';
          const category = params.category as string | undefined;
          const limit = Math.min(params.limit as number || 10, 25);

          let tools: Tool[];
          if (sort === 'recent') {
            tools = await getRecentTools(limit);
            if (category) tools = tools.filter(t => t.category === category);
          } else {
            const filters: ToolFilters = {
              sort: sort === 'most_stars' ? 'github_stars' : 'quality_score',
            };
            if (category) filters.category = category;
            const result = await getTools(filters, 1, limit);
            tools = result.tools;
          }

          const label = sort === 'recent' ? 'Recently Added' : sort === 'most_stars' ? 'Most Starred' : 'Top Rated';
          const text = tools.length
            ? `${label} Tools${category ? ` in ${category}` : ''}:\n\n${formatToolList(tools)}`
            : 'No tools found.';
          return { content: [{ type: 'text', text: `${text}\n\nSource: ToolShelf.dev` }] };
        }

        default:
          return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  });

  return server;
}
