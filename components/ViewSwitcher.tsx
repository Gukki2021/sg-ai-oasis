'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const VIEWS = [
  {
    key: 'cards',
    label: '本周版',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: 'list',
    label: '完全版',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    key: 'map',
    label: '地图版',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  },
] as const;

export default function ViewSwitcher() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const current     = searchParams.get('view') || 'cards';

  return (
    <div className="view-switcher" role="tablist" aria-label="View mode">
      {VIEWS.map((v) => {
        const isActive = current === v.key;
        return (
          <Link
            key={v.key}
            href={`${pathname}?view=${v.key}`}
            role="tab"
            aria-selected={isActive}
            className={`view-tab ${isActive ? 'view-tab--active' : ''}`}
          >
            {v.icon}
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
