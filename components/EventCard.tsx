'use client';

import Image from 'next/image';
import type { SgEvent } from '@/lib/types';
import StarRating from './StarRating';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  practitioner: 'Practitioner',
  builder: 'Builder',
};
const LEVEL_COLOR: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  practitioner: 'bg-blue-50 text-blue-700 border-blue-200',
  builder:      'bg-purple-50 text-purple-700 border-purple-200',
};
const ORG_TYPE_LABEL: Record<string, string> = {
  tech_company: 'Tech Co',
  community:    'Community',
  academic:     'Academic',
  individual:   'Individual',
  startup:      'Startup',
};
const ORG_TYPE_COLOR: Record<string, string> = {
  tech_company: 'bg-blue-50 text-blue-700 border-blue-200',
  community:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  academic:     'bg-amber-50 text-amber-700 border-amber-200',
  individual:   'bg-purple-50 text-purple-700 border-purple-200',
  startup:      'bg-rose-50 text-rose-700 border-rose-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-SG', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Singapore',
  });
}

interface Props { event: SgEvent }

export default function EventCard({ event }: Props) {
  const hasCover = Boolean(event.coverImageUrl);

  return (
    <article className="card group flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">

      {/* ── Cover image ──────────────────────────────── */}
      <div className="relative w-full aspect-video bg-[var(--ink-100)] overflow-hidden">
        {hasCover ? (
          <Image
            src={event.coverImageUrl!}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--violet-400)] to-[var(--violet-600)] flex items-center justify-center">
            <span className="text-white/50 text-[10px] font-mono uppercase tracking-widest">No Cover</span>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {event.isNew          && <span className="badge badge-new">New</span>}
          {event.isCuratorPick  && <span className="badge badge-pick">Pick</span>}
          {event.isFree         && <span className="badge badge-free">Free</span>}
        </div>
        <div className="absolute top-2 right-2">
          <span className={`badge ${event.platform === 'luma' ? 'badge-luma' : 'badge-eb'}`}>
            {event.platform === 'luma' ? 'Luma' : 'Eventbrite'}
          </span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title + oneLiner */}
        <div>
          <h3 className="font-semibold text-[15px] leading-snug text-[var(--text)] line-clamp-2">
            {event.title}
          </h3>
          {event.oneLiner && (
            <p className="mt-1 text-[11px] text-[var(--muted)] italic leading-snug line-clamp-2">
              {event.oneLiner}
            </p>
          )}
        </div>

        {/* Organizer row */}
        {event.organizers && event.organizers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {event.organizers.map((o) => (
              <span key={o.id} className="flex items-center gap-1">
                <span className="text-[11px] text-[var(--ink-600)] font-medium">{o.name}</span>
                <span className={`badge border text-[9px] px-1.5 py-0 ${ORG_TYPE_COLOR[o.type] ?? ''}`}>
                  {ORG_TYPE_LABEL[o.type] ?? o.type}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Date / time / venue */}
        <div className="flex flex-col gap-1 text-xs text-[var(--ink-500)]">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{formatDate(event.startAt)} · {formatTime(event.startAt)}</span>
            {event.attendeeCount != null && (
              <span className="ml-auto text-[var(--muted)]">{event.attendeeCount.toLocaleString()} going</span>
            )}
          </div>
          <div className="flex items-start gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[1px]">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        {/* MRT pills */}
        {event.mrtStations && event.mrtStations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.mrtStations.map((s) => (
              <span key={s.code} className="mrt-pill text-white text-[10px]" style={{ backgroundColor: s.lineColor }}>
                <span className="mrt-dot" style={{ background: 'rgba(255,255,255,0.7)' }} />
                {s.name}
                {s.walkMins != null && <span className="opacity-80"> · {s.walkMins}m</span>}
              </span>
            ))}
          </div>
        )}

        {/* Levels */}
        {event.levels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.levels.map((l) => (
              <span key={l} className={`badge border ${LEVEL_COLOR[l]}`}>{LEVEL_LABEL[l]}</span>
            ))}
          </div>
        )}

        {/* Audience + Partner info */}
        {(event.targetAudience || event.findPartner) && (
          <div className="rounded-[10px] bg-[var(--ink-50)] border border-[var(--border)] p-2.5 flex flex-col gap-1.5 text-[11px]">
            {event.targetAudience && (
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-blue-100 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <div>
                  <span className="font-semibold text-[var(--ink-600)]">适合 </span>
                  <span className="text-[var(--muted)] leading-relaxed">{event.targetAudience}</span>
                </div>
              </div>
            )}
            {event.findPartner && (
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-violet-100 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7059F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 11h4a2 2 0 0 1 0 4h-4"/><path d="M3 11V9a6 6 0 0 1 12 0v2"/>
                    <rect x="3" y="11" width="12" height="10" rx="2"/>
                  </svg>
                </span>
                <div>
                  <span className="font-semibold text-[var(--ink-600)]">遇见 </span>
                  <span className="text-[var(--muted)] leading-relaxed">{event.findPartner}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: score + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div className="flex flex-col gap-0.5">
            <StarRating score={event.score} />
            {event.scoreNote && (
              <p className="text-[10px] text-[var(--muted)] line-clamp-1 max-w-[160px]">{event.scoreNote}</p>
            )}
          </div>
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--violet-600)] transition-colors"
          >
            报名 / Register
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
