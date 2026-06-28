#!/usr/bin/env python3
"""
SG AI Oasis — Event Scraper
Runs on GitHub Actions every 6 hours.
Fetches Luma + Eventbrite events, enriches with MRT proximity, upserts to Supabase.

Usage: python scripts/scrape.py
Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import json
import math
import time
import logging
from datetime import datetime, timezone
from typing import Optional
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────
SUPABASE_URL  = os.environ['SUPABASE_URL']
SUPABASE_KEY  = os.environ['SUPABASE_SERVICE_ROLE_KEY']

LUMA_SOURCES = [
    'https://lu.ma/singapore',
    'https://lu.ma/ai',
    'https://lu.ma/tech',
]
EVENTBRITE_SOURCES = [
    'https://www.eventbrite.com/d/singapore/ai/',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

# ─── MRT stations (abridged — for server-side enrichment) ────
MRT_STATIONS = [
    {'name': 'Kallang',         'code': 'EW10',      'line': 'EW', 'color': '#009645', 'lat': 1.3114, 'lng': 103.8716},
    {'name': 'Orchard',         'code': 'NS22/TE14', 'line': 'NS', 'color': '#D42E12', 'lat': 1.3040, 'lng': 103.8318},
    {'name': 'Somerset',        'code': 'NS23',      'line': 'NS', 'color': '#D42E12', 'lat': 1.2999, 'lng': 103.8394},
    {'name': 'Raffles Place',   'code': 'EW14/NS26', 'line': 'EW', 'color': '#009645', 'lat': 1.2837, 'lng': 103.8513},
    {'name': 'Tanjong Pagar',   'code': 'EW15',      'line': 'EW', 'color': '#009645', 'lat': 1.2766, 'lng': 103.8456},
    {'name': 'Bayfront',        'code': 'DT16',      'line': 'DT', 'color': '#005EC4', 'lat': 1.2822, 'lng': 103.8596},
    {'name': 'Downtown',        'code': 'DT17',      'line': 'DT', 'color': '#005EC4', 'lat': 1.2793, 'lng': 103.8527},
    {'name': 'Bugis',           'code': 'EW12/DT14', 'line': 'EW', 'color': '#009645', 'lat': 1.3009, 'lng': 103.8559},
    {'name': 'Bras Basah',      'code': 'CC2',       'line': 'CC', 'color': '#FA9E0D', 'lat': 1.2964, 'lng': 103.8514},
    {'name': 'Eunos',           'code': 'EW7',       'line': 'EW', 'color': '#009645', 'lat': 1.3195, 'lng': 103.9025},
    {'name': 'Paya Lebar',      'code': 'EW8/CC9',   'line': 'EW', 'color': '#009645', 'lat': 1.3178, 'lng': 103.8920},
    {'name': 'one-north',       'code': 'CC23',      'line': 'CC', 'color': '#FA9E0D', 'lat': 1.2998, 'lng': 103.7871},
    {'name': 'Kent Ridge',      'code': 'CC24',      'line': 'CC', 'color': '#FA9E0D', 'lat': 1.2934, 'lng': 103.7847},
    {'name': 'Promenade',       'code': 'CC4/DT15',  'line': 'CC', 'color': '#FA9E0D', 'lat': 1.2935, 'lng': 103.8610},
    {'name': 'City Hall',       'code': 'EW13/NS25', 'line': 'EW', 'color': '#009645', 'lat': 1.2930, 'lng': 103.8520},
    {'name': 'Marina Bay',      'code': 'NS27/TE20', 'line': 'NS', 'color': '#D42E12', 'lat': 1.2765, 'lng': 103.8545},
    {'name': 'Outram Park',     'code': 'EW16/NE3',  'line': 'EW', 'color': '#009645', 'lat': 1.2801, 'lng': 103.8395},
    {'name': 'Bencoolen',       'code': 'DT21',      'line': 'DT', 'color': '#005EC4', 'lat': 1.2980, 'lng': 103.8495},
]

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def get_nearest_mrt(lat, lng, top_n=2):
    if lat is None or lng is None:
        return []
    results = []
    for s in MRT_STATIONS:
        dist_km = haversine(lat, lng, s['lat'], s['lng'])
        walk_mins = round((dist_km / 1.2) * 60)
        results.append({**s, 'walk_mins': walk_mins, '_dist': dist_km})
    results.sort(key=lambda x: x['_dist'])
    return [
        {
            'name': r['name'], 'code': r['code'],
            'line': r['line'], 'lineColor': r['color'],
            'walkMins': r['walk_mins'],
        }
        for r in results[:top_n]
    ]

# ─── Geocoding (via Nominatim — free, no API key) ─────────────
def geocode(venue: str) -> tuple[Optional[float], Optional[float]]:
    if not venue:
        return None, None
    try:
        resp = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={'q': f'{venue}, Singapore', 'format': 'json', 'limit': 1},
            headers={'User-Agent': 'sg-ai-oasis/1.0'},
            timeout=8,
        )
        data = resp.json()
        if data:
            return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        log.warning(f'Geocode failed for "{venue}": {e}')
    return None, None

# ─── Luma scraper ─────────────────────────────────────────────
def scrape_luma(url: str) -> list[dict]:
    log.info(f'Scraping Luma: {url}')
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        log.error(f'Failed to fetch {url}: {e}')
        return []

    soup = BeautifulSoup(resp.text, 'html.parser')
    events = []

    # Extract OG metadata as a fallback for the page itself
    # For listing pages, Luma is client-rendered — event slugs are in JSON-LD or data attrs
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string or '')
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                items = [data]
            else:
                continue
            for item in items:
                if item.get('@type') == 'Event':
                    event_url = item.get('url', '')
                    slug = event_url.rstrip('/').split('/')[-1]
                    events.append({
                        'id':             slug,
                        'title':          item.get('name', ''),
                        'description':    item.get('description', ''),
                        'start_at':       item.get('startDate', ''),
                        'end_at':         item.get('endDate', ''),
                        'venue':          (item.get('location') or {}).get('name', ''),
                        'platform':       'luma',
                        'source_url':     event_url or f'https://lu.ma/{slug}',
                        'is_free':        True,
                        'cover_image_url': item.get('image', ''),
                        'external_id':    slug,
                        'tags':           [],
                        'levels':         [],
                        'score':          3,
                        'is_curator_pick': False,
                        'is_new':         False,
                    })
        except Exception:
            continue

    log.info(f'  → found {len(events)} events via JSON-LD')
    return events

# ─── Eventbrite scraper ───────────────────────────────────────
def scrape_eventbrite(url: str) -> list[dict]:
    log.info(f'Scraping Eventbrite: {url}')
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        log.error(f'Failed to fetch {url}: {e}')
        return []

    soup = BeautifulSoup(resp.text, 'html.parser')
    events = []

    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string or '')
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get('@type') == 'Event':
                    event_url = item.get('url', '')
                    eid_match = re.search(r'/e/.*-(\d+)', event_url)
                    eid = eid_match.group(1) if eid_match else event_url.split('/')[-1]
                    image = item.get('image', '')
                    if isinstance(image, list): image = image[0] if image else ''
                    events.append({
                        'id':             f'eb-{eid}',
                        'title':          item.get('name', ''),
                        'description':    item.get('description', ''),
                        'start_at':       item.get('startDate', ''),
                        'end_at':         item.get('endDate', ''),
                        'venue':          (item.get('location') or {}).get('name', ''),
                        'platform':       'eventbrite',
                        'source_url':     event_url,
                        'is_free':        False,
                        'cover_image_url': image,
                        'external_id':    eid,
                        'tags':           [],
                        'levels':         [],
                        'score':          3,
                        'is_curator_pick': False,
                        'is_new':         False,
                    })
        except Exception:
            continue

    log.info(f'  → found {len(events)} events via JSON-LD')
    return events

# ─── Enrich event with coordinates + MRT ──────────────────────
def enrich(event: dict) -> dict:
    lat, lng = geocode(event.get('venue', ''))
    event['venue_lat'] = lat
    event['venue_lng'] = lng
    event['mrt_stations'] = get_nearest_mrt(lat, lng)
    return event

# ─── Upsert to Supabase ───────────────────────────────────────
def upsert_events(supabase: Client, events: list[dict]):
    now = datetime.now(timezone.utc).isoformat()
    for event in events:
        event['scraped_at'] = now

    if not events:
        log.info('No events to upsert.')
        return

    result = supabase.table('events').upsert(events, on_conflict='id').execute()
    log.info(f'Upserted {len(events)} events. Errors: {result.data is None}')

# ─── Main ─────────────────────────────────────────────────────
def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    all_events = []
    for src in LUMA_SOURCES:
        all_events.extend(scrape_luma(src))
        time.sleep(1.5)  # polite delay

    for src in EVENTBRITE_SOURCES:
        all_events.extend(scrape_eventbrite(src))
        time.sleep(1.5)

    # Deduplicate by id
    seen = set()
    unique = []
    for e in all_events:
        if e['id'] not in seen:
            seen.add(e['id'])
            unique.append(e)

    log.info(f'Total unique events: {len(unique)}')

    # Enrich with geocoords + MRT
    enriched = []
    for e in unique:
        try:
            enriched.append(enrich(e))
            time.sleep(1.1)  # Nominatim rate limit: 1 req/sec
        except Exception as ex:
            log.warning(f'Enrich failed for {e["id"]}: {ex}')
            enriched.append(e)

    upsert_events(supabase, enriched)
    log.info('Scrape complete.')

if __name__ == '__main__':
    main()
