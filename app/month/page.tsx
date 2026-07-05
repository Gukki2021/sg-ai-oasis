import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { SgEvent, Organizer } from '@/lib/types';
import staticEventsRaw  from '@/data/events.json';
import staticOrgsRaw    from '@/data/organizers.json';
import EventCard        from '@/components/EventCard';
import StatsRow         from '@/components/StatsRow';
import DistributionPanel from '@/components/DistributionPanel';
import OrganizerCard    from '@/components/OrganizerCard';
import ViewSwitcher     from '@/components/ViewSwitcher';
import EventListView    from '@/components/EventListView';

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

// ─── Static JSON hydration ────────────────────────────────────
function loadStaticEvents(): SgEvent[] {
  const orgMap = Object.fromEntries(
    (staticOrgsRaw as any[]).map((o) => [o.id, o as Organizer]),
  );
  return (staticEventsRaw as any[]).map((e) => ({
    ...e,
    organizers: (e.organizers ?? []).map((id: string) => orgMap[id]).filter(Boolean),
  })) as SgEvent[];
}

// ─── Fetch all upcoming events (next 30 days) ─────────────────
async function getMonthEvents(): Promise<SgEvent[]> {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) return loadStaticEvents();
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const cutoff   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { data, error } = await supabase
      .from('events_full').select('*')
      .gte('start_at', new Date().toISOString())
      .lte('start_at', cutoff.toISOString())
      .order('start_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row: any): SgEvent => ({
      id: row.id, title: row.title, description: row.description,
      oneLiner: row.one_liner, targetAudience: row.target_audience,
      findPartner: row.find_partner,
      startAt: row.start_at, endAt: row.end_at,
      venue: row.venue, venueLat: row.venue_lat, venueLng: row.venue_lng,
      mrtStations: row.mrt_stations ?? [],
      platform: row.platform, sourceUrl: row.source_url,
      isFree: row.is_free, price: row.price,
      coverImageUrl: row.cover_image_url, externalId: row.external_id,
      attendeeCount: row.attendee_count, status: row.status,
      tags: row.tags ?? [], levels: row.levels ?? [],
      score: row.score, scoreNote: row.score_note,
      isCuratorPick: row.is_curator_pick, isNew: row.is_new,
      organizers: row.organizers ?? [],
      scrapedAt: row.scraped_at, createdAt: row.created_at,
    }));
  } catch { return loadStaticEvents(); }
}

// ─── Group events by week banner ─────────────────────────────
function groupByWeek(events: SgEvent[]) {
  const groups = new Map<string, SgEvent[]>();
  events.forEach((e) => {
    const d    = new Date(e.startAt);
    const mon  = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    const sun  = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt  = (dt: Date) => dt.toLocaleDateString('en-SG', {
      month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
    });
    const label = `${fmt(mon)} – ${fmt(sun)}`;
    const arr   = groups.get(label) ?? [];
    arr.push(e);
    groups.set(label, arr);
  });
  return groups;
}

// ─── Deduplicate organizers ───────────────────────────────────
function getUniqueOrganizers(events: SgEvent[]) {
  const map = new Map<string, { org: Organizer; count: number }>();
  events.forEach((e) => {
    (e.organizers ?? []).forEach((o: Organizer) => {
      const ex = map.get(o.id);
      if (ex) ex.count++;
      else map.set(o.id, { org: o, count: 1 });
    });
  });
  return Array.from(map.values()).sort((a, b) => b.org.score - a.org.score);
}

// ─── Page ─────────────────────────────────────────────────────
export default async function MonthPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view       = searchParams.view || 'list'; // default to list for month
  const events     = await getMonthEvents();
  const byWeek     = groupByWeek(events);
  const organizers = getUniqueOrganizers(events);
  const lastScan   = events[0]?.scrapedAt
    ? new Date(events[0].scrapedAt).toLocaleString('en-SG', {
        timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short',
      })
    : '—';

  // Date range label
  const rangeStart = new Date().toLocaleDateString('en-SG', {
    month: 'long', day: 'numeric', timeZone: 'Asia/Singapore',
  });
  const rangeEnd   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-SG', {
    month: 'long', day: 'numeric', timeZone: 'Asia/Singapore',
  });

  return (
    <div className="min-h-dvh bg-[var(--bg)]">

      {/* ── Sticky header ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] bg-[var(--bg)]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-7 h-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight hidden sm:block">SG AI Oasis</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {/* Page nav tabs */}
          <nav className="flex items-center gap-1 bg-[var(--ink-100)] p-1 rounded-[12px]" aria-label="Page">
            <a href="/"      className="page-nav-tab">本周活动</a>
            <a href="/month" className="page-nav-tab page-nav-tab--active">本月活动</a>
          </nav>

          <p className="text-[11px] text-[var(--muted)] hidden md:block flex-shrink-0">
            Last scan: {lastScan}
          </p>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Title + view switcher */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              未来一个月 AI Events
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              {rangeStart} — {rangeEnd} · {events.length} 场活动 · 每日自动抓取更新
            </p>
          </div>
          <Suspense fallback={<div className="h-9 w-56 rounded-xl bg-[var(--ink-100)] animate-pulse" />}>
            <ViewSwitcher />
          </Suspense>
        </div>

        {/* Stats */}
        <StatsRow events={events} />

        {/* ── List view (完全版, default for month) ───────────── */}
        {view === 'list' && (
          <>
            <DistributionPanel events={events} />
            <section>
              <p className="section-label mb-4">完全版 · 未来 30 天</p>
              <EventListView events={events} />
            </section>
            <section className="space-y-4">
              <p className="section-label">主办方</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {organizers.map(({ org, count }) => (
                  <OrganizerCard key={org.id} organizer={org} eventCount={count} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── Cards view ──────────────────────────────────────── */}
        {view === 'cards' && (
          <>
            <DistributionPanel events={events} />
            <section className="space-y-10">
              <p className="section-label">按周分组</p>
              {Array.from(byWeek.entries()).map(([week, weekEvents]) => (
                <div key={week} className="space-y-4">
                  <h2 className="text-base font-semibold text-[var(--ink-700)] flex items-center gap-2">
                    <span className="text-[var(--muted)] text-sm font-normal">Week</span> {week}
                    <span className="px-2 py-0.5 rounded-full bg-[var(--ink-100)] text-[var(--muted)] text-xs font-normal">
                      {weekEvents.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {weekEvents.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* ── Map view ────────────────────────────────────────── */}
        {view === 'map' && (
          <>
            <section className="space-y-3">
              <p className="section-label">地图分布版 · 本月活动分布</p>
              <EventMap events={events} />
              <p className="text-xs text-[var(--muted)] px-1">
                紫色大头针 = 活动地点 &nbsp;·&nbsp; 彩色圆圈 = 最近地铁站 &nbsp;·&nbsp; 点击查看详情
              </p>
            </section>
            <section>
              <p className="section-label mb-4">本月全部 {events.length} 场活动</p>
              <EventListView events={events} />
            </section>
          </>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] mt-16 py-6 text-center text-xs text-[var(--muted)]">
        SG AI Oasis · 每日自动抓取 Luma &amp; Eventbrite · 数据由 GitHub Actions + Supabase 驱动 ·{' '}
        <a href="https://github.com/Gukki2021/sg-ai-oasis" target="_blank" rel="noopener noreferrer"
           className="text-[var(--violet-500)] hover:underline">GitHub</a>
      </footer>
    </div>
  );
}
