import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Star,
  FolderOpen,
  Bell,
  Shield,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { MOCK_COMPANIES, MOCK_COLLECTIONS } from '../../data/mockData';

const navItems = [
  { to: '/', label: 'Triage Dashboard', icon: LayoutDashboard },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/collections', label: 'Collections', icon: FolderOpen },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

export function Sidebar() {
  const location = useLocation();
  const watchlistCount = MOCK_COMPANIES.filter(c => c.isWatchlisted).length;
  const alertCount = MOCK_COMPANIES.reduce((sum, c) => sum + c.alerts.length, 0);

  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0 border-r"
      style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ background: 'var(--primary)', borderRadius: 'var(--radius)' }}
        >
          <Shield size={16} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', fontWeight: 500, letterSpacing: '0.06em' }}>
            SATRIA
          </div>
          <div className="caption" style={{ color: 'var(--sidebar-foreground)', lineHeight: 1 }}>
            Tax Risk Screening
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="caption px-2 pb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Navigation
        </div>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded transition-colors group"
              style={{
                borderRadius: 'var(--radius)',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--sidebar-foreground)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-p-size)' }}>{label}</span>
              </div>
              <div className="flex items-center gap-1">
                {label === 'Watchlist' && watchlistCount > 0 && (
                  <span className="caption px-1.5 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    {watchlistCount}
                  </span>
                )}
                {label === 'Alerts' && alertCount > 0 && (
                  <span className="caption px-1.5 py-0.5 rounded-full" style={{ background: 'var(--destructive)', color: 'white' }}>
                    {alertCount}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Active Collections */}
      <div className="px-3 pb-4">
        <div className="caption px-2 pb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Collections
        </div>
        <div className="space-y-0.5">
          {MOCK_COLLECTIONS.filter(c => c.status === 'active').map(col => (
            <NavLink
              key={col.id}
              to={`/collections`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors"
              style={{ borderRadius: 'var(--radius)', color: 'var(--sidebar-foreground)' }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: col.color }}
              />
              <span className="truncate" style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)' }}>
                {col.name}
              </span>
              <span className="caption ml-auto shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {col.companyIds.length}
              </span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User */}
      <div
        className="px-4 py-3 border-t flex items-center gap-2.5"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--primary)', borderRadius: '50%' }}
        >
          <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '11px', color: 'white', fontWeight: 500 }}>BS</span>
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Budi Santoso
          </div>
          <div className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            DJP Transfer Pricing
          </div>
        </div>
      </div>
    </aside>
  );
}
