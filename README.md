# SG AI Oasis

Singapore AI Events dashboard — curated, real-time, with MRT directions.

**Features**
- Live event cards with cover images, star ratings, and source links
- Distribution charts (events by day, level, platform)
- Interactive Leaflet map with event pins + nearest MRT station overlay
- Organizer profiles with credibility scores and background info
- GitHub Actions scraper running every 6 hours
- Supabase (PostgreSQL) backend with static JSON fallback

---

## Quick Start (static mode — no database needed)

```bash
git clone https://github.com/<your-username>/sg-ai-oasis
cd sg-ai-oasis-app
npm install
npm run dev
```

Open `http://localhost:3000`. The app works out of the box using `data/events.json` and `data/organizers.json`.

---

## Full Setup (live database mode)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Run the schema: paste `supabase/migrations/001_init.sql` into the SQL editor
3. Copy your project URL and API keys

### 2. Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL + keys
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set the same env vars in Vercel dashboard → Settings → Environment Variables.

---

## GitHub Actions (auto-scraping)

Add these secrets to your GitHub repo (Settings → Secrets):

| Secret                   | Value                              |
|--------------------------|------------------------------------|
| `SUPABASE_URL`           | Your Supabase project URL          |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase  |

The workflow in `.github/workflows/scrape.yml` runs at 00:00, 06:00, 12:00, 18:00 UTC (every 6 hours).

You can also trigger it manually from the Actions tab.

---

## Project Structure

```
sg-ai-oasis-app/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── page.tsx            # Main dashboard (Server Component)
│   ├── globals.css         # Design tokens + base styles
│   └── api/
│       ├── events/route.ts # GET /api/events (Supabase or static)
│       └── scrape/route.ts # POST /api/scrape (webhook trigger)
├── components/
│   ├── EventCard.tsx       # Single event card
│   ├── StatsRow.tsx        # 4-stat summary row
│   ├── DistributionPanel.tsx # Recharts distribution charts
│   ├── EventMap.tsx        # Leaflet map (SSR disabled)
│   ├── OrganizerCard.tsx   # Organizer profile card
│   └── StarRating.tsx      # SVG star rating (1–5)
├── lib/
│   ├── types.ts            # TypeScript types
│   ├── supabase.ts         # Supabase client
│   └── mrt-stations.ts     # SG MRT station data + proximity util
├── data/
│   ├── events.json         # Static event data (fallback)
│   └── organizers.json     # Static organizer profiles
├── scripts/
│   ├── seed.ts             # Seed Supabase from JSON files
│   └── scrape.py           # Python scraper (GitHub Actions)
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # Database schema
└── .github/
    └── workflows/
        └── scrape.yml      # Cron job definition
```

---

## Adding / updating events

**Static mode**: Edit `data/events.json` directly.

**Database mode**: Run the scraper manually:
```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python scripts/scrape.py
```

Or add events manually via the Supabase dashboard table editor.

---

## Design System

Stay SG / Notion-inspired:
- Background: `#F7F6F3` (`--ink-50`)
- Accent: `#7059F6` (`--violet-500`)
- Fonts: Hanken Grotesk + Noto Sans SC + JetBrains Mono
- Borders: 1.5px hairline at `#D9D7D2`
- Radii: 18–28px for cards
