'use client';

import { useEffect, useRef, useState } from 'react';
import type { SgEvent } from '@/lib/types';

interface Props {
  events: SgEvent[];
}

// Dynamically load Leaflet only on client
export default function EventMap({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Inject Leaflet CSS from CDN (avoids SSR bundler issues)
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
      }

      // Fix default icon paths broken by Next.js bundling
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [1.3010, 103.8400],
        zoom:   12,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // ── Event markers ─────────────────────────────────────
      const eventsWithCoords = events.filter(
        (e) => e.venueLat != null && e.venueLng != null,
      );

      eventsWithCoords.forEach((event) => {
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:32px; height:32px;
              background: #7059F6;
              border: 2.5px solid #fff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(112,89,246,0.4);
            "></div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const startDate = new Date(event.startAt).toLocaleDateString('en-SG', {
          weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
        });
        const startTime = new Date(event.startAt).toLocaleTimeString('en-SG', {
          hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Singapore',
        });

        const mrtHtml = (event.mrtStations ?? [])
          .map(s => `
            <span style="
              display:inline-flex; align-items:center; gap:4px;
              background:${s.lineColor}; color:#fff;
              padding:2px 8px 2px 6px; border-radius:99px; font-size:11px; font-weight:600;
            ">
              <span style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.7)"></span>
              ${s.name}${s.walkMins ? ` · ${s.walkMins}m` : ''}
            </span>
          `)
          .join(' ');

        const starsHtml = Array.from({ length: 5 }, (_, i) => `
          <svg width="13" height="13" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="${i < event.score ? '#F59E0B' : 'none'}"
              stroke="${i < event.score ? 'none' : '#C7C7CB'}"
              stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        `).join('');

        L.marker([event.venueLat!, event.venueLng!], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Hanken Grotesk', system-ui, sans-serif; min-width:240px; max-width:280px;">
              <p style="font-size:14px; font-weight:600; margin:0 0 6px; line-height:1.4;">${event.title}</p>
              <p style="font-size:11px; color:#888; margin:0 0 8px;">${startDate} · ${startTime}</p>
              <p style="font-size:11px; color:#555; margin:0 0 8px;">
                <svg style="display:inline;margin-right:3px;vertical-align:-1px" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${event.venue}
              </p>
              ${mrtHtml ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${mrtHtml}</div>` : ''}
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
                <div style="display:flex;gap:2px">${starsHtml}</div>
                <a href="${event.sourceUrl}" target="_blank" rel="noopener noreferrer"
                   style="font-size:11px;font-weight:600;color:#7059F6;text-decoration:none;">
                  Register →
                </a>
              </div>
            </div>
          `, { maxWidth: 300 });
      });

      // ── MRT station layer (visible at zoom >= 13) ──────────
      const mrtLayer = L.layerGroup();

      eventsWithCoords.forEach((event) => {
        (event.mrtStations ?? []).forEach((s) => {
          // Find the station coords from the event's stored MRT data
          // We need lat/lng — if not stored, skip
          const nearbyStation = findMrtCoords(s.name);
          if (!nearbyStation) return;

          const icon = L.divIcon({
            className: '',
            html: `
              <div style="
                width:18px; height:18px;
                background: ${s.lineColor};
                border: 2px solid #fff;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.25);
                display:flex; align-items:center; justify-content:center;
                font-size:7px; font-weight:800; color:#fff; line-height:1;
              ">${s.line}</div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            popupAnchor: [0, -12],
          });

          L.marker([nearbyStation.lat, nearbyStation.lng], { icon })
            .bindPopup(`
              <div style="font-family: system-ui; min-width:120px;">
                <p style="font-size:13px;font-weight:700;margin:0 0 2px">${s.name}</p>
                <p style="font-size:11px;color:#888;margin:0">${s.code} · ${s.line} Line</p>
              </div>
            `)
            .addTo(mrtLayer);
        });
      });

      mrtLayer.addTo(map);

      mapInstanceRef.current = map;
      setLoaded(true);
    };

    initMap();
  }, [events]);

  return (
    <section className="space-y-3">
      <p className="section-label">活动地图 · MRT Proximity</p>
      <div className="card overflow-hidden">
        {!loaded && (
          <div className="flex items-center justify-center h-[420px] text-xs text-[var(--muted)]">
            Loading map…
          </div>
        )}
        <div
          ref={mapRef}
          style={{ height: '420px', width: '100%', display: loaded ? 'block' : 'none' }}
        />
      </div>
      <p className="text-xs text-[var(--muted)] px-1">
        Violet pins = event venues. Coloured circles = nearest MRT stations. Click any pin for details.
      </p>
    </section>
  );
}

// Inline station coordinate lookup (avoids extra imports)
const STATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kallang':          { lat: 1.3114, lng: 103.8716 },
  'Orchard':          { lat: 1.3040, lng: 103.8318 },
  'Somerset':         { lat: 1.2999, lng: 103.8394 },
  'Raffles Place':    { lat: 1.2837, lng: 103.8513 },
  'Tanjong Pagar':    { lat: 1.2766, lng: 103.8456 },
  'Bayfront':         { lat: 1.2822, lng: 103.8596 },
  'Downtown':         { lat: 1.2793, lng: 103.8527 },
  'Bugis':            { lat: 1.3009, lng: 103.8559 },
  'Bras Basah':       { lat: 1.2964, lng: 103.8514 },
  'Bencoolen':        { lat: 1.2980, lng: 103.8495 },
  'Eunos':            { lat: 1.3195, lng: 103.9025 },
  'Paya Lebar':       { lat: 1.3178, lng: 103.8920 },
  'one-north':        { lat: 1.2998, lng: 103.7871 },
  'Kent Ridge':       { lat: 1.2934, lng: 103.7847 },
  'Promenade':        { lat: 1.2935, lng: 103.8610 },
  'City Hall':        { lat: 1.2930, lng: 103.8520 },
  'Outram Park':      { lat: 1.2801, lng: 103.8395 },
  'Marina Bay':       { lat: 1.2765, lng: 103.8545 },
};

function findMrtCoords(name: string) {
  return STATION_COORDS[name] ?? null;
}
