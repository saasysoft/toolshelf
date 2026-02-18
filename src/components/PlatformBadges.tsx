import { getPlatformIcon } from '@/lib/utils';

export default function PlatformBadges({ platforms }: { platforms: string[] }) {
  if (!platforms?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          title={p}
        >
          <span>{getPlatformIcon(p)}</span>
          <span className="capitalize">{p}</span>
        </span>
      ))}
    </div>
  );
}
