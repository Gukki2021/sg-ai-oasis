-- Migration 002: Add enrichment fields for audience, partner, oneliner
-- Run this in Supabase SQL Editor after 001_init.sql

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS one_liner       TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS find_partner    TEXT;

-- Update the events_full view to include new fields
DROP VIEW IF EXISTS events_full;

CREATE VIEW events_full AS
SELECT
  e.*,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id',          o.id,
          'name',        o.name,
          'lumaHandle',  o.luma_handle,
          'website',     o.website,
          'description', o.description,
          'score',       o.score,
          'scoreNote',   o.score_note,
          'tags',        o.tags,
          'logoUrl',     o.logo_url,
          'type',        o.type
        )
        ORDER BY eo.sort_order
      )
      FROM event_organizers eo
      JOIN organizers o ON o.id = eo.organizer_id
      WHERE eo.event_id = e.id
    ),
    '[]'::jsonb
  ) AS organizers
FROM events e;

-- Grant read access
GRANT SELECT ON events_full TO anon, authenticated;
