import type { SgEvent } from '@/lib/types';

interface Props {
  events: SgEvent[];
}

export default function StatsRow({ events }: Props) {
  const total      = events.length;
  const freeCount  = events.filter((e) => e.isFree).length;
  const newCount   = events.filter((e) => e.isNew).length;
  const pickCount  = events.filter((e) => e.isCuratorPick).length;
  const topEvent   = events.reduce<SgEvent | null>((top, e) => {
    if (e.attendeeCount == null) return top;
    if (!top || (top.attendeeCount ?? 0) < e.attendeeCount) return e;
    return top;
  }, null);

  const stats = [
    {
      value: total,
      label: 'Total events',
      sub: 'Next 2 weeks',
    },
    {
      value: `${Math.round((freeCount / (total || 1)) * 100)}%`,
      label: 'Free to attend',
      sub: `${freeCount} of ${total}`,
    },
    {
      value: topEvent?.attendeeCount?.toLocaleString() ?? '—',
      label: 'Top attendance',
      sub: topEvent?.title ? topEvent.title.slice(0, 28) + '…' : '',
    },
    {
      value: pickCount,
      label: "Curator picks",
      sub: `${newCount} new this scan`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="card p-4">
          <p className="text-2xl font-bold text-[var(--text)] tabular-nums">{s.value}</p>
          <p className="text-xs font-medium text-[var(--ink-600)] mt-0.5">{s.label}</p>
          {s.sub && <p className="text-[10px] text-[var(--muted)] mt-0.5 line-clamp-1">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}
