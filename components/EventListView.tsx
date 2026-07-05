'use client';

import { useState, useMemo } from 'react';
import type { SgEvent, Level } from '@/lib/types';
import StarRating from './StarRating';

const LEVEL_COLOR: Record<string, string> = {
  beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  practitioner: 'bg-blue-50 text-blue-700 border-blue-200',
  builder:      'bg-purple-50 text-purple-700 border-purple-200',
};
const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner', practitioner: 'Practitioner', builder: 'Builder',
};

type SortKey = 'date' | 'score' | 'attendees';

interface Props { events: SgEvent[] }

export default function EventListView({ events }: Props) {
  const [filterLevel,    setFilterLevel]    = useState<Level | 'all'>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'luma' | 'eventbrite'>('all');
  const [filterFree,     setFilterFree]     = useState(false);
  const [sortBy,         setSortBy]         = useState<SortKey>('date');
  const [search,         setSearch]         = useState('');

  const filtered = useMemo(() => {
    let out = [...events];
    if (filterLevel !== 'all')    out = out.filter(e => e.levels.includes(filterLevel as Level));
    if (filterPlatform !== 'all') out = out.filter(e => e.platform === filterPlatform);
    if (filterFree)               out = out.filter(e => e.isFree);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.oneLiner?.toLowerCase().includes(q) ||
        e.targetAudience?.toLowerCase().includes(q) ||
        e.findPartner?.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q)) ||
        e.organizers.some(o => o.name.toLowerCase().includes(q)),
      );
    }
    if (sortBy === 'score')     out.sort((a, b) => b.score - a.score);
    else if (sortBy === 'attendees') out.sort((a, b) => (b.attendeeCount ?? 0) - (a.attendeeCount ?? 0));
    else out.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return out;
  }, [events, filterLevel, filterPlatform, filterFree, sortBy, search]);

  return (
    <div className="space-y-4">
      {/* ── Filter / search bar ──────────────────────────────────── */}
      <div className="card p-3 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索活动、主办方、受众…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition"
          />
        </div>

        {/* Level filter */}
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value as Level | 'all')}
          className="px-2 py-1.5 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="all">所有级别</option>
          <option value="beginner">Beginner</option>
          <option value="practitioner">Practitioner</option>
          <option value="builder">Builder</option>
        </select>

        {/* Platform filter */}
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value as any)}
          className="px-2 py-1.5 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="all">所有平台</option>
          <option value="luma">Luma</option>
          <option value="eventbrite">Eventbrite</option>
        </select>

        {/* Free toggle */}
        <button
          onClick={() => setFilterFree(v => !v)}
          className={`px-3 py-1.5 text-xs rounded-[10px] border transition font-semibold ${
            filterFree ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          仅免费
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          className="ml-auto px-2 py-1.5 text-xs rounded-[10px] border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="date">按日期</option>
          <option value="score">按评分</option>
          <option value="attendees">按人气</option>
        </select>

        <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">
          {filtered.length} 场活动
        </span>
      </div>

      {/* ── Event rows ───────────────────────────────────────────── */}
      <div className="card divide-y divide-[var(--border)] overflow-hidden">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--muted)] text-sm">
            没有符合条件的活动
          </div>
        )}
        {filtered.map((event) => {
          const dateStr = new Date(event.startAt).toLocaleDateString('en-SG', {
            weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
          });
          const timeStr = new Date(event.startAt).toLocaleTimeString('en-SG', {
            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Singapore',
          });

          return (
            <div key={event.id} className="flex items-start gap-4 px-4 py-4 hover:bg-[var(--ink-50)] transition-colors group">

              {/* Date column */}
              <div className="flex-shrink-0 w-20 text-right">
                <div className="text-[11px] font-semibold text-[var(--ink-700)] leading-tight">{dateStr.split(',')[0]}</div>
                <div className="text-[10px] text-[var(--muted)]">{dateStr.replace(/^[^,]+,\s*/, '')}</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">{timeStr}</div>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start gap-2 flex-wrap">
                  {event.isNew         && <span className="badge badge-new">New</span>}
                  {event.isCuratorPick && <span className="badge badge-pick">Pick</span>}
                  {event.isFree
                    ? <span className="badge badge-free">Free</span>
                    : <span className="badge badge-eb">{event.price}</span>
                  }
                  <span className={`badge ${event.platform === 'luma' ? 'badge-luma' : 'badge-eb'}`}>
                    {event.platform === 'luma' ? 'Luma' : 'Eventbrite'}
                  </span>
                </div>

                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-semibold text-[14px] text-[var(--text)] hover:text-[var(--accent)] transition-colors leading-snug"
                >
                  {event.title}
                </a>

                {event.oneLiner && (
                  <p className="text-[12px] text-[var(--muted)] italic leading-snug">{event.oneLiner}</p>
                )}

                {/* Organiser */}
                {event.organizers.length > 0 && (
                  <p className="text-[11px] text-[var(--ink-500)]">
                    <span className="text-[var(--muted)]">主办：</span>
                    {event.organizers.map(o => o.name).join(' · ')}
                  </p>
                )}

                {/* Venue + MRT */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
                  <span className="flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {event.venue}
                  </span>
                  {(event.mrtStations ?? []).map(s => (
                    <span key={s.code} className="mrt-pill text-[9px]" style={{ backgroundColor: s.lineColor }}>
                      <span className="mrt-dot" style={{ background: 'rgba(255,255,255,0.7)', width: 6, height: 6 }} />
                      {s.name} {s.walkMins != null && `· ${s.walkMins}m`}
                    </span>
                  ))}
                </div>

                {/* Audience / Partner */}
                {(event.targetAudience || event.findPartner) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
                    {event.targetAudience && (
                      <span className="text-[var(--muted)]">
                        <span className="font-semibold text-[var(--ink-600)]">适合 </span>{event.targetAudience}
                      </span>
                    )}
                    {event.findPartner && (
                      <span className="text-[var(--muted)]">
                        <span className="font-semibold text-[var(--accent)]">遇见 </span>{event.findPartner}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right column: levels + score + CTA */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-0.5">
                <div className="flex flex-wrap gap-1 justify-end">
                  {event.levels.map(l => (
                    <span key={l} className={`badge border ${LEVEL_COLOR[l]}`}>{LEVEL_LABEL[l]}</span>
                  ))}
                </div>
                <StarRating score={event.score} />
                {event.attendeeCount != null && (
                  <span className="text-[10px] text-[var(--muted)]">{event.attendeeCount.toLocaleString()} going</span>
                )}
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-[var(--accent)] text-[var(--accent)] text-[11px] font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  报名
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
