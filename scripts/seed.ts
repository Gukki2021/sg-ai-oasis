/**
 * Seed Supabase with static event + organizer data.
 * Run: npm run seed
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import events     from '../data/events.json';
import organizers from '../data/organizers.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seed() {
  console.log('Seeding organizers…');
  const { error: orgErr } = await supabase
    .from('organizers')
    .upsert(
      (organizers as any[]).map((o) => ({
        id:           o.id,
        name:         o.name,
        luma_handle:  o.lumaHandle ?? null,
        website:      o.website ?? null,
        description:  o.description,
        score:        o.score,
        score_note:   o.scoreNote,
        tags:         o.tags,
        logo_url:     o.logoUrl ?? null,
        type:         o.type,
      })),
      { onConflict: 'id' },
    );
  if (orgErr) { console.error('Organizer seed error:', orgErr); process.exit(1); }
  console.log(`  → ${organizers.length} organizers seeded`);

  console.log('Seeding events…');
  const { error: evtErr } = await supabase
    .from('events')
    .upsert(
      (events as any[]).map((e) => ({
        id:              e.id,
        title:           e.title,
        description:     e.description ?? null,
        start_at:        e.startAt,
        end_at:          e.endAt ?? null,
        venue:           e.venue,
        venue_lat:       e.venueLat ?? null,
        venue_lng:       e.venueLng ?? null,
        mrt_stations:    e.mrtStations ?? [],
        platform:        e.platform,
        source_url:      e.sourceUrl,
        is_free:         e.isFree,
        price:           e.price ?? null,
        cover_image_url: e.coverImageUrl ?? null,
        external_id:     e.externalId ?? null,
        attendee_count:  e.attendeeCount ?? null,
        status:          e.status ?? 'open',
        tags:            e.tags ?? [],
        levels:          e.levels ?? [],
        score:           e.score,
        score_note:      e.scoreNote ?? null,
        is_curator_pick: e.isCuratorPick,
        is_new:          e.isNew,
        scraped_at:      e.scrapedAt,
      })),
      { onConflict: 'id' },
    );
  if (evtErr) { console.error('Event seed error:', evtErr); process.exit(1); }
  console.log(`  → ${events.length} events seeded`);

  console.log('Seeding event_organizers…');
  const junctionRows = (events as any[]).flatMap((e) =>
    (e.organizers ?? []).map((orgId: string) => ({
      event_id: e.id,
      organizer_id: orgId,
    })),
  );
  if (junctionRows.length) {
    const { error: jErr } = await supabase
      .from('event_organizers')
      .upsert(junctionRows, { onConflict: 'event_id,organizer_id' });
    if (jErr) { console.error('Junction seed error:', jErr); process.exit(1); }
    console.log(`  → ${junctionRows.length} event-organizer links seeded`);
  }

  console.log('Seed complete.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
