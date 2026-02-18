import { getQualityColor, getQualityLabel } from '@/lib/utils';

export default function QualityBadge({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getQualityColor(score)}`}>
      <span className="font-mono">{score}</span>
      <span className="text-[10px] font-normal opacity-70">{getQualityLabel(score)}</span>
    </span>
  );
}
