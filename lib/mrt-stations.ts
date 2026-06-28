export interface RawStation {
  name: string;
  code: string;
  line: string;
  color: string;
  lat: number;
  lng: number;
}

// Line color palette
export const LINE_COLORS: Record<string, string> = {
  EW: '#009645',  // Green
  NS: '#D42E12',  // Red
  CC: '#FA9E0D',  // Orange
  DT: '#005EC4',  // Blue
  NE: '#9900AA',  // Purple
  TE: '#9D5B25',  // Brown
  JR: '#0099AA',  // Teal (JRL)
  BP: '#748477',  // BP LRT
};

export const MRT_STATIONS: RawStation[] = [
  // ─── East-West Line ───────────────────────────────────
  { name: 'Pasir Ris',       code: 'EW1',       line: 'EW', color: LINE_COLORS.EW, lat: 1.3731, lng: 103.9493 },
  { name: 'Tampines',        code: 'EW2/DT32',  line: 'EW', color: LINE_COLORS.EW, lat: 1.3529, lng: 103.9454 },
  { name: 'Simei',           code: 'EW3',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3432, lng: 103.9530 },
  { name: 'Tanah Merah',     code: 'EW4',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3272, lng: 103.9460 },
  { name: 'Bedok',           code: 'EW5',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3240, lng: 103.9301 },
  { name: 'Kembangan',       code: 'EW6',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3205, lng: 103.9128 },
  { name: 'Eunos',           code: 'EW7',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3195, lng: 103.9025 },
  { name: 'Paya Lebar',      code: 'EW8/CC9',    line: 'EW', color: LINE_COLORS.EW, lat: 1.3178, lng: 103.8920 },
  { name: 'Aljunied',        code: 'EW9',        line: 'EW', color: LINE_COLORS.EW, lat: 1.3158, lng: 103.8832 },
  { name: 'Kallang',         code: 'EW10',       line: 'EW', color: LINE_COLORS.EW, lat: 1.3114, lng: 103.8716 },
  { name: 'Lavender',        code: 'EW11',       line: 'EW', color: LINE_COLORS.EW, lat: 1.3073, lng: 103.8622 },
  { name: 'Bugis',           code: 'EW12/DT14',  line: 'EW', color: LINE_COLORS.EW, lat: 1.3009, lng: 103.8559 },
  { name: 'City Hall',       code: 'EW13/NS25',  line: 'EW', color: LINE_COLORS.EW, lat: 1.2930, lng: 103.8520 },
  { name: 'Raffles Place',   code: 'EW14/NS26',  line: 'EW', color: LINE_COLORS.EW, lat: 1.2837, lng: 103.8513 },
  { name: 'Tanjong Pagar',   code: 'EW15',       line: 'EW', color: LINE_COLORS.EW, lat: 1.2766, lng: 103.8456 },
  { name: 'Outram Park',     code: 'EW16/NE3/TE17', line: 'EW', color: LINE_COLORS.EW, lat: 1.2801, lng: 103.8395 },
  { name: 'Queenstown',      code: 'EW19',       line: 'EW', color: LINE_COLORS.EW, lat: 1.2944, lng: 103.8056 },
  { name: 'Buona Vista',     code: 'EW21/CC22',  line: 'EW', color: LINE_COLORS.EW, lat: 1.3073, lng: 103.7906 },
  // ─── North-South Line ─────────────────────────────────
  { name: 'Ang Mo Kio',      code: 'NS16',       line: 'NS', color: LINE_COLORS.NS, lat: 1.3699, lng: 103.8496 },
  { name: 'Bishan',          code: 'NS17/CC15',  line: 'NS', color: LINE_COLORS.NS, lat: 1.3506, lng: 103.8481 },
  { name: 'Toa Payoh',       code: 'NS19',       line: 'NS', color: LINE_COLORS.NS, lat: 1.3325, lng: 103.8474 },
  { name: 'Novena',          code: 'NS20',       line: 'NS', color: LINE_COLORS.NS, lat: 1.3202, lng: 103.8436 },
  { name: 'Newton',          code: 'NS21/DT11',  line: 'NS', color: LINE_COLORS.NS, lat: 1.3127, lng: 103.8383 },
  { name: 'Orchard',         code: 'NS22/TE14',  line: 'NS', color: LINE_COLORS.NS, lat: 1.3040, lng: 103.8318 },
  { name: 'Somerset',        code: 'NS23',       line: 'NS', color: LINE_COLORS.NS, lat: 1.2999, lng: 103.8394 },
  { name: 'Dhoby Ghaut',     code: 'NS24/NE6/CC1', line: 'NS', color: LINE_COLORS.NS, lat: 1.2996, lng: 103.8456 },
  { name: 'Marina Bay',      code: 'NS27/TE20',  line: 'NS', color: LINE_COLORS.NS, lat: 1.2765, lng: 103.8545 },
  // ─── Circle Line ──────────────────────────────────────
  { name: 'Bras Basah',      code: 'CC2',        line: 'CC', color: LINE_COLORS.CC, lat: 1.2964, lng: 103.8514 },
  { name: 'Esplanade',       code: 'CC3',        line: 'CC', color: LINE_COLORS.CC, lat: 1.2933, lng: 103.8553 },
  { name: 'Promenade',       code: 'CC4/DT15',   line: 'CC', color: LINE_COLORS.CC, lat: 1.2935, lng: 103.8610 },
  { name: 'Nicoll Highway',  code: 'CC5',        line: 'CC', color: LINE_COLORS.CC, lat: 1.2994, lng: 103.8633 },
  { name: 'Stadium',         code: 'CC6',        line: 'CC', color: LINE_COLORS.CC, lat: 1.3033, lng: 103.8748 },
  { name: 'Mountbatten',     code: 'CC7',        line: 'CC', color: LINE_COLORS.CC, lat: 1.3061, lng: 103.8830 },
  { name: 'Dakota',          code: 'CC8',        line: 'CC', color: LINE_COLORS.CC, lat: 1.3087, lng: 103.8882 },
  { name: 'MacPherson',      code: 'CC10/DT26',  line: 'CC', color: LINE_COLORS.CC, lat: 1.3265, lng: 103.8897 },
  { name: 'Serangoon',       code: 'CC13/NE12',  line: 'CC', color: LINE_COLORS.CC, lat: 1.3497, lng: 103.8731 },
  { name: 'Caldecott',       code: 'CC17/TE9',   line: 'CC', color: LINE_COLORS.CC, lat: 1.3381, lng: 103.8393 },
  { name: 'Botanic Gardens', code: 'CC19/DT9',   line: 'CC', color: LINE_COLORS.CC, lat: 1.3226, lng: 103.8153 },
  { name: 'Holland Village', code: 'CC21',       line: 'CC', color: LINE_COLORS.CC, lat: 1.3116, lng: 103.7961 },
  { name: 'one-north',       code: 'CC23',       line: 'CC', color: LINE_COLORS.CC, lat: 1.2998, lng: 103.7871 },
  { name: 'Kent Ridge',      code: 'CC24',       line: 'CC', color: LINE_COLORS.CC, lat: 1.2934, lng: 103.7847 },
  { name: 'HarbourFront',    code: 'CC29/NE1',   line: 'CC', color: LINE_COLORS.CC, lat: 1.2655, lng: 103.8217 },
  // ─── Downtown Line ────────────────────────────────────
  { name: 'Beauty World',    code: 'DT5',        line: 'DT', color: LINE_COLORS.DT, lat: 1.3414, lng: 103.7759 },
  { name: 'Tan Kah Kee',     code: 'DT8',        line: 'DT', color: LINE_COLORS.DT, lat: 1.3258, lng: 103.8079 },
  { name: 'Stevens',         code: 'DT10/TE11',  line: 'DT', color: LINE_COLORS.DT, lat: 1.3199, lng: 103.8259 },
  { name: 'Little India',    code: 'DT12/NE7',   line: 'DT', color: LINE_COLORS.DT, lat: 1.3066, lng: 103.8498 },
  { name: 'Rochor',          code: 'DT13',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3048, lng: 103.8525 },
  { name: 'Bayfront',        code: 'DT16/CE1',   line: 'DT', color: LINE_COLORS.DT, lat: 1.2822, lng: 103.8596 },
  { name: 'Downtown',        code: 'DT17',       line: 'DT', color: LINE_COLORS.DT, lat: 1.2793, lng: 103.8527 },
  { name: 'Telok Ayer',      code: 'DT18',       line: 'DT', color: LINE_COLORS.DT, lat: 1.2817, lng: 103.8482 },
  { name: 'Chinatown',       code: 'DT19/NE4',   line: 'DT', color: LINE_COLORS.DT, lat: 1.2836, lng: 103.8444 },
  { name: 'Fort Canning',    code: 'DT20',       line: 'DT', color: LINE_COLORS.DT, lat: 1.2942, lng: 103.8443 },
  { name: 'Bencoolen',       code: 'DT21',       line: 'DT', color: LINE_COLORS.DT, lat: 1.2980, lng: 103.8495 },
  { name: 'Jalan Besar',     code: 'DT22',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3050, lng: 103.8601 },
  { name: 'Bendemeer',       code: 'DT23',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3133, lng: 103.8617 },
  { name: 'Geylang Bahru',   code: 'DT24',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3213, lng: 103.8726 },
  { name: 'Mattar',          code: 'DT25',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3254, lng: 103.8823 },
  { name: 'Ubi',             code: 'DT27',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3296, lng: 103.8997 },
  { name: 'Bedok North',     code: 'DT29',       line: 'DT', color: LINE_COLORS.DT, lat: 1.3325, lng: 103.9228 },
  // ─── North-East Line ──────────────────────────────────
  { name: 'Clarke Quay',     code: 'NE5',        line: 'NE', color: LINE_COLORS.NE, lat: 1.2884, lng: 103.8465 },
  { name: 'Farrer Park',     code: 'NE8',        line: 'NE', color: LINE_COLORS.NE, lat: 1.3124, lng: 103.8523 },
  { name: 'Boon Keng',       code: 'NE9',        line: 'NE', color: LINE_COLORS.NE, lat: 1.3197, lng: 103.8613 },
  { name: 'Potong Pasir',    code: 'NE10',       line: 'NE', color: LINE_COLORS.NE, lat: 1.3313, lng: 103.8698 },
  { name: 'Woodleigh',       code: 'NE11',       line: 'NE', color: LINE_COLORS.NE, lat: 1.3392, lng: 103.8718 },
  { name: 'Kovan',           code: 'NE13',       line: 'NE', color: LINE_COLORS.NE, lat: 1.3600, lng: 103.8850 },
  { name: 'Hougang',         code: 'NE14',       line: 'NE', color: LINE_COLORS.NE, lat: 1.3712, lng: 103.8924 },
  // ─── Thomson-East Coast Line ──────────────────────────
  { name: 'Upper Thomson',   code: 'TE8',        line: 'TE', color: LINE_COLORS.TE, lat: 1.3536, lng: 103.8327 },
  { name: 'Napier',          code: 'TE12',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3056, lng: 103.8152 },
  { name: 'Orchard Boulevard', code: 'TE13',     line: 'TE', color: LINE_COLORS.TE, lat: 1.3037, lng: 103.8236 },
  { name: 'Great World',     code: 'TE15',       line: 'TE', color: LINE_COLORS.TE, lat: 1.2945, lng: 103.8289 },
  { name: 'Havelock',        code: 'TE16',       line: 'TE', color: LINE_COLORS.TE, lat: 1.2894, lng: 103.8338 },
  { name: 'Maxwell',         code: 'TE18',       line: 'TE', color: LINE_COLORS.TE, lat: 1.2797, lng: 103.8443 },
  { name: 'Shenton Way',     code: 'TE19',       line: 'TE', color: LINE_COLORS.TE, lat: 1.2766, lng: 103.8494 },
  { name: 'Gardens by the Bay', code: 'TE22',    line: 'TE', color: LINE_COLORS.TE, lat: 1.2807, lng: 103.8642 },
  { name: 'Tanjong Rhu',     code: 'TE24',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3030, lng: 103.8747 },
  { name: 'Katong Park',     code: 'TE25',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3038, lng: 103.8882 },
  { name: 'Tanjong Katong',  code: 'TE26',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3073, lng: 103.8988 },
  { name: 'Marine Parade',   code: 'TE27',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3026, lng: 103.9070 },
  { name: 'Siglap',          code: 'TE29',       line: 'TE', color: LINE_COLORS.TE, lat: 1.3052, lng: 103.9263 },
];

// ─── Haversine distance (km) ──────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestMrt(lat: number, lng: number, topN = 2) {
  return MRT_STATIONS
    .map((s) => {
      const distKm = haversine(lat, lng, s.lat, s.lng);
      const walkMins = Math.round((distKm / 1.2) * 60); // ~1.2 km/h walking speed indoors with lifts
      return { ...s, distKm, walkMins };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, topN)
    .map(({ distKm, ...rest }) => rest);
}
