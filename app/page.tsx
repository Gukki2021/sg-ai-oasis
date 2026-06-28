import dynamic from 'next/dynamic';
import type { SgEvent, Organizer } from '@/lib/types';
import staticEventsRaw  from '@/data/events.json';
import staticOrgsRaw    from '@/data/organizers.json';
import EventCard        from '@/components/EventCard';
import StatsRow         from '@/components/StatsRow';
import DistributionPanel from '@/components/DistributionPanel';
import OrganizerCard    from '@/components/OrganizerCard';

// Leaflet must be client-side only
const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

// ─── Hydrate static JSON into typed objects ─────────────────
function loadStaticEvents(): SgEvent[] {
  const orgMap = Object.fromEntries(
    (staticOrgsRaw as any[]).map((o) => [o.id, o as Organizer]),
  );
  return (staticEventsRaw as any[]).map((e) => ({
    ...e,
    organizers: (e.organizers ?? []).map((id: string) => orgMap[id]).filter(Boolean),
  })) as SgEvent[];
}

// ─── Fetch events (Supabase if configured, else static JSON) ─
async function getEvents(): Promise<SgEvent[]> {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    // No DB configured — use static data immediately
    return loadStaticEvents();
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const { data, error } = await supabase
      .from('events_full')
      .select('*')
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true });
    if (error) throw error;
    // Map snake_case DB row to camelCase SgEvent
    return (data ?? []).map((row: any): SgEvent => ({
      id:            row.id,
      title:         row.title,
      description:   row.description,
      startAt:       row.start_at,
      endAt:         row.end_at,
      venue:         row.venue,
      venueLat:      row.venue_lat,
      venueLng:      row.venue_lng,
      mrtStations:   row.mrt_stations ?? [],
      platform:      row.platform,
      sourceUrl:     row.source_url,
      isFree:        row.is_free,
      price:         row.price,
      coverImageUrl: row.cover_image_url,
      externalId:    row.external_id,
      attendeeCount: row.attendee_count,
      status:        row.status,
      tags:          row.tags ?? [],
      levels:        row.levels ?? [],
      score:         row.score,
      scoreNote:     row.score_note,
      isCuratorPick: row.is_curator_pick,
      isNew:         row.is_new,
      organizers:    row.organizers ?? [],
      scrapedAt:     row.scraped_at,
      createdAt:     row.created_at,
    }));
  } catch {
    return loadStaticEvents();
  }
}

// ─── Group events by day label ───────────────────────────────
function groupByDay(events: SgEvent[]) {
  const groups = new Map<string, SgEvent[]>();
  events.forEach((e) => {
    const label = new Date(e.startAt).toLocaleDateString('en-SG', {
      weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
    });
    const arr = groups.get(label) ?? [];
    arr.push(e);
    groups.set(label, arr);
  });
  return groups;
}

// ─── Deduplicate organizers across all events ────────────────
function getUniqueOrganizers(events: SgEvent[]) {
  const map = new Map<string, { org: Organizer; count: number }>();
  events.forEach((e) => {
    (e.organizers ?? []).forEach((o: Organizer) => {
      const existing = map.get(o.id);
      if (existing) existing.count++;
      else map.set(o.id, { org: o, count: 1 });
    });
  });
  return Array.from(map.values()).sort((a, b) => b.org.score - a.org.score);
}

export default async function Home() {
  const events     = await getEvents();
  const byDay      = groupByDay(events);
  const organizers = getUniqueOrganizers(events);
  const lastScan   = events[0]?.scrapedAt
    ? new Date(events[0].scrapedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' })
    : 'Unknown';

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      {/* ── Sticky header ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] bg-[var(--bg)]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight">SG AI Oasis</span>
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted)] hidden sm:block">
            Last scan: {lastScan}
          </p>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            Singapore AI Events
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Curated radar · next 2 weeks · {events.length} events
          </p>
        </div>

        {/* Stats */}
        <StatsRow events={events} />

        {/* Distribution charts */}
        <DistributionPanel events={events} />

        {/* Map */}
        <EventMap events={events} />

        {/* Events by day */}
        <section className="space-y-8">
          <p className="section-label">All Events</p>
          {Array.from(byDay.entries()).map(([day, dayEvents]) => (
            <div key={day} className="space-y-4">
              <h2 className="text-base font-semibold text-[var(--ink-700)] flex items-center gap-2">
                {day}
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--ink-100)] text-[var(--muted)] text-xs font-normal">
                  {dayEvents.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Organizers */}
        <section className="space-y-4">
          <p className="section-label">主办方 · Organizers</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {organizers.map(({ org, count }) => (
              <OrganizerCard key={org.id} organizer={org} eventCount={count} />
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] mt-16 py-6 text-center text-xs text-[var(--muted)]">
        SG AI Oasis · Updated every 6 hours via GitHub Actions ·{' '}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--violet-500)] hover:underline"
        >
          View source
        </a>
      </footer>
    </div>
  );
}
