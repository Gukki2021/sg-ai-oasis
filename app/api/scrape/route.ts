import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/scrape
 * Triggered by GitHub Actions cron job.
 * Validates the CRON_SECRET header, then returns a placeholder.
 *
 * The actual scraping runs in .github/workflows/scrape.yml via
 * a Python script (scripts/scrape.py) that writes directly to Supabase.
 * This route can be used as a lightweight webhook trigger if preferred.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In a full implementation, call the scraper here.
  // For now, return success so GitHub Actions can confirm the endpoint is live.
  return NextResponse.json({
    ok: true,
    message: 'Scrape endpoint reached. Use GitHub Actions workflow for actual scraping.',
    timestamp: new Date().toISOString(),
  });
}
