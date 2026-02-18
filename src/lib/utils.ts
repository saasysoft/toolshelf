export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function getMaintenanceColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'slowing': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'stale': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'abandoned': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-zinc-500 bg-zinc-50 border-zinc-200';
  }
}

export function getQualityColor(score: number): string {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-zinc-500 bg-zinc-50 border-zinc-200';
}

export function getQualityLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Emerging';
}

export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'windows': return '🪟';
    case 'mac': return '🍎';
    case 'linux': return '🐧';
    case 'web': return '🌐';
    case 'docker': return '🐳';
    default: return '📦';
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-emerald-700 bg-emerald-50';
    case 'moderate': return 'text-amber-700 bg-amber-50';
    case 'advanced': return 'text-red-700 bg-red-50';
    default: return 'text-zinc-500 bg-zinc-50';
  }
}
