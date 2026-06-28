'use client';

import type { Organizer } from '@/lib/types';
import StarRating from './StarRating';

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  tech_company: { label: 'Tech Company',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  community:    { label: 'Community',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  academic:     { label: 'Academic',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  individual:   { label: 'Individual',    color: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
  startup:      { label: 'Startup',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

interface Props {
  organizer: Organizer;
  eventCount?: number;
}

export default function OrganizerCard({ organizer, eventCount }: Props) {
  const typeInfo = TYPE_LABEL[organizer.type] ?? TYPE_LABEL.community;

  return (
    <article className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[14px] text-[var(--text)] leading-snug line-clamp-2">
            {organizer.name}
          </h3>
          {organizer.website && (
            <a
              href={organizer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--violet-500)] hover:underline truncate block mt-0.5"
            >
              {organizer.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <span className={`badge border flex-shrink-0 ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <StarRating score={organizer.score} size={13} />
        <span className="text-xs text-[var(--muted)]">Credibility</span>
        {eventCount != null && (
          <span className="ml-auto text-xs text-[var(--muted)]">
            {eventCount} event{eventCount !== 1 ? 's' : ''} this cycle
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--ink-500)] leading-relaxed line-clamp-4">
        {organizer.description}
      </p>

      {/* Score note */}
      {organizer.scoreNote && (
        <div className="flex gap-2 p-2.5 rounded-[10px] bg-[var(--ink-100)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[1px]">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[11px] text-[var(--ink-500)] leading-relaxed">{organizer.scoreNote}</p>
        </div>
      )}

      {/* Tags */}
      {organizer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {organizer.tags.map((tag) => (
            <span
              key={tag}
              className="badge border border-[var(--border)] bg-[var(--ink-50)] text-[var(--ink-500)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
