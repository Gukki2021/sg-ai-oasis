'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PageNav() {
  const pathname = usePathname();
  const isWeek  = pathname === '/';
  const isMonth = pathname === '/month';

  return (
    <nav className="flex items-center gap-1" aria-label="Page navigation">
      <Link
        href="/"
        className={`page-nav-tab ${isWeek ? 'page-nav-tab--active' : ''}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        本周活动
      </Link>
      <Link
        href="/month"
        className={`page-nav-tab ${isMonth ? 'page-nav-tab--active' : ''}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        本月活动
      </Link>
    </nav>
  );
}
