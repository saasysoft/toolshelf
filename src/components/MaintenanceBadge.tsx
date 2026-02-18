import { getMaintenanceColor } from '@/lib/utils';

const labels: Record<string, string> = {
  active: 'Active',
  slowing: 'Slowing',
  stale: 'Stale',
  abandoned: 'Abandoned',
  unknown: 'Unknown',
};

export default function MaintenanceBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getMaintenanceColor(status)}`}>
      {labels[status] || status}
    </span>
  );
}
