'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import type { SgEvent } from '@/lib/types';

interface Props {
  events: SgEvent[];
}

const LEVEL_COLORS: Record<string, string> = {
  beginner:     '#10B981',
  practitioner: '#3B82F6',
  builder:      '#8B5CF6',
};

function buildDayData(events: SgEvent[]) {
  const map = new Map<string, number>();
  events.forEach((e) => {
    const d = new Date(e.startAt);
    const key = d.toLocaleDateString('en-SG', {
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore',
    });
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      // sort by actual date by finding the event
      const dateA = events.find(e =>
        new Date(e.startAt).toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore' }) === a.label
      )?.startAt ?? '';
      const dateB = events.find(e =>
        new Date(e.startAt).toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Singapore' }) === b.label
      )?.startAt ?? '';
      return dateA.localeCompare(dateB);
    });
}

function buildLevelData(events: SgEvent[]) {
  const map: Record<string, number> = { beginner: 0, practitioner: 0, builder: 0 };
  events.forEach((e) => e.levels.forEach((l) => { map[l] = (map[l] ?? 0) + 1; }));
  return Object.entries(map)
    .filter(([, c]) => c > 0)
    .map(([level, count]) => ({ level, count, fill: LEVEL_COLORS[level] }));
}

function buildPlatformData(events: SgEvent[]) {
  const map: Record<string, number> = { luma: 0, eventbrite: 0 };
  events.forEach((e) => { map[e.platform]++; });
  return [
    { name: 'Luma',       value: map.luma,       fill: '#7059F6' },
    { name: 'Eventbrite', value: map.eventbrite,  fill: '#E11D48' },
  ].filter((d) => d.value > 0);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs font-medium shadow-lg">
      <p className="text-[var(--muted)]">{label ?? payload[0]?.name}</p>
      <p className="text-[var(--text)] text-sm font-semibold">{payload[0].value} events</p>
    </div>
  );
};

export default function DistributionPanel({ events }: Props) {
  const dayData      = buildDayData(events);
  const levelData    = buildLevelData(events);
  const platformData = buildPlatformData(events);

  return (
    <section className="space-y-6">
      <p className="section-label">活动分布</p>

      {/* ── Events by day ── */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-4 text-[var(--ink-700)]">Events by Day</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dayData} margin={{ top: 0, right: 8, left: -28, bottom: 0 }} barCategoryGap="35%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--ink-400)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--ink-400)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--ink-100)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {dayData.map((_, i) => (
                <Cell key={i} fill="var(--violet-500)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Level + Platform row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Level donut */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-3 text-[var(--ink-700)]">By Level</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={levelData}
                  dataKey="count"
                  innerRadius={28}
                  outerRadius={46}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {levelData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-col gap-1.5">
              {levelData.map((d) => (
                <li key={d.level} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="capitalize text-[var(--ink-600)]">{d.level}</span>
                  <span className="font-semibold text-[var(--text)] ml-auto">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Platform donut */}
        <div className="card p-5">
          <p className="text-sm font-semibold mb-3 text-[var(--ink-700)]">By Platform</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={platformData}
                  dataKey="value"
                  innerRadius={28}
                  outerRadius={46}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {platformData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex flex-col gap-1.5">
              {platformData.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="text-[var(--ink-600)]">{d.name}</span>
                  <span className="font-semibold text-[var(--text)] ml-auto">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
