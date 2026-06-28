import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import staticEvents from '@/data/events.json';
import staticOrganizers from '@/data/organizers.json';
import type { SgEvent } from '@/lib/types';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useDB = SUPABASE_URL && SUPABASE_ANON;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const level    = searchParams.get('level');
  const freeOnly = searchParams.get('free') === 'true';

  try {
    let events: SgEvent[] = [];

    if (useDB) {
      // ── Supabase fetch ─────────────────────────────────────
      const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON!);
      let query = supabase
        .from('events_full')
        .select('*')
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true });

      if (platform) query = query.eq('platform', platform);
      if (freeOnly) query = query.eq('is_free', true);
      if (level)    query = query.contains('levels', [level]);

      const { data, error } = await query;
      if (error) throw error;

      // Map snake_case → camelCase
      events = (data ?? []).map(mapRow);
    } else {
      // ── Static JSON fallback ────────────────────────────────
      const orgMap = Object.fromEntries(
        (staticOrganizers as any[]).map((o) => [o.id, o]),
      );

      events = (staticEvents as any[]).map((e) => ({
        ...e,
        organizers: (e.organizers ?? []).map((id: string) => orgMap[id]).filter(Boolean),
      }));

      if (platform) events = events.filter((e) => e.platform === platform);
      if (freeOnly) events = events.filter((e) => e.isFree);
      if (level)    events = events.filter((e) => e.levels.includes(level as any));
    }

    return NextResponse.json({ events, source: useDB ? 'supabase' : 'static' });
  } catch (err: any) {
    console.error('[events/GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Snake_case DB row → camelCase SgEvent
function mapRow(row: any): SgEvent {
  return {
    id:             row.id,
    title:          row.title,
    description:    row.description,
    startAt:        row.start_at,
    endAt:          row.end_at,
    venue:          row.venue,
    venueLat:       row.venue_lat,
    venueLng:       row.venue_lng,
    mrtStations:    row.mrt_stations ?? [],
    platform:       row.platform,
    sourceUrl:      row.source_url,
    isFree:         row.is_free,
    price:          row.price,
    coverImageUrl:  row.cover_image_url,
    externalId:     row.external_id,
    attendeeCount:  row.attendee_count,
    status:         row.status,
    tags:           row.tags ?? [],
    levels:         row.levels ?? [],
    score:          row.score,
    scoreNote:      row.score_note,
    isCuratorPick:  row.is_curator_pick,
    isNew:          row.is_new,
    organizers:     row.organizers ?? [],
    scrapedAt:      row.scraped_at,
    createdAt:      row.created_at,
  };
}
