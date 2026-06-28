-- ============================================================
-- SG AI Oasis — Supabase Schema
-- Run: supabase db push  (or paste into Supabase SQL editor)
-- ============================================================

-- ─── Enums ──────────────────────────────────────────────────
CREATE TYPE platform_type    AS ENUM ('luma', 'eventbrite');
CREATE TYPE event_level      AS ENUM ('beginner', 'practitioner', 'builder');
CREATE TYPE event_status     AS ENUM ('open', 'full', 'closed', 'approval', 'fast', 'urgent');
CREATE TYPE organizer_type   AS ENUM ('tech_company', 'community', 'academic', 'individual', 'startup');

-- ─── Organizers ─────────────────────────────────────────────
CREATE TABLE organizers (
  id           TEXT PRIMARY KEY,           -- e.g. "aws-sg"
  name         TEXT NOT NULL,
  luma_handle  TEXT,
  website      TEXT,
  description  TEXT NOT NULL DEFAULT '',
  score        SMALLINT NOT NULL DEFAULT 3 CHECK (score BETWEEN 1 AND 5),
  score_note   TEXT NOT NULL DEFAULT '',
  tags         TEXT[]       NOT NULL DEFAULT '{}',
  logo_url     TEXT,
  type         organizer_type NOT NULL DEFAULT 'community',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Events ─────────────────────────────────────────────────
CREATE TABLE events (
  id               TEXT PRIMARY KEY,       -- Luma slug or custom ID
  title            TEXT NOT NULL,
  description      TEXT,
  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ,
  venue            TEXT NOT NULL DEFAULT '',
  venue_lat        DOUBLE PRECISION,
  venue_lng        DOUBLE PRECISION,
  mrt_stations     JSONB        NOT NULL DEFAULT '[]',
  platform         platform_type NOT NULL,
  source_url       TEXT NOT NULL,
  is_free          BOOLEAN      NOT NULL DEFAULT TRUE,
  price            TEXT,
  cover_image_url  TEXT,
  external_id      TEXT,
  attendee_count   INTEGER,
  status           event_status NOT NULL DEFAULT 'open',
  tags             TEXT[]       NOT NULL DEFAULT '{}',
  levels           event_level[] NOT NULL DEFAULT '{}',
  score            SMALLINT     NOT NULL DEFAULT 3 CHECK (score BETWEEN 1 AND 5),
  score_note       TEXT,
  is_curator_pick  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_new           BOOLEAN      NOT NULL DEFAULT FALSE,
  scraped_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Event ↔ Organizer junction ─────────────────────────────
CREATE TABLE event_organizers (
  event_id      TEXT REFERENCES events(id)     ON DELETE CASCADE,
  organizer_id  TEXT REFERENCES organizers(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, organizer_id)
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX events_start_at_idx     ON events (start_at);
CREATE INDEX events_platform_idx     ON events (platform);
CREATE INDEX events_curator_pick_idx ON events (is_curator_pick) WHERE is_curator_pick = TRUE;

-- ─── Updated-at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER organizers_updated_at
  BEFORE UPDATE ON organizers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security (read-only public access) ────────────
ALTER TABLE events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events"
  ON events FOR SELECT USING (TRUE);

CREATE POLICY "Public read organizers"
  ON organizers FOR SELECT USING (TRUE);

CREATE POLICY "Public read event_organizers"
  ON event_organizers FOR SELECT USING (TRUE);

-- ─── Handy view: events with organizer array ─────────────────
CREATE VIEW events_full AS
SELECT
  e.*,
  COALESCE(
    (SELECT jsonb_agg(o.*)
       FROM event_organizers eo
       JOIN organizers o ON o.id = eo.organizer_id
      WHERE eo.event_id = e.id),
    '[]'::jsonb
  ) AS organizers
FROM events e;
