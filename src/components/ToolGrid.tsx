import type { Tool } from '@/types/tool';
import ToolCard from './ToolCard';

export default function ToolGrid({ tools, title }: { tools: Tool[]; title?: string }) {
  return (
    <section>
      {title && (
        <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
