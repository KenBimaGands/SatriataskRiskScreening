import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  LogOut,
  Star,
  FolderOpen,
  Bell,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useBookmarks } from '../../bookmarks/BookmarksContext';
import { useCompanyCollections } from '../../company-collections/CompanyCollectionsContext';
import { normalizeCompanyRiskTier } from '../../lib/companyCollections';

const COLLECTION_COLORS = ['#BF4D43', '#D97757', '#207FDE', '#9B87F5', '#4CAF74', '#D4A017'];

const navItems = [
  { to: '/', label: 'Triage Dashboard', icon: LayoutDashboard },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/collections', label: 'Collections', icon: FolderOpen },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeBookmarks, isLoading } = useBookmarks();
  const { companies } = useCompanyCollections();
  const watchlistCount = companies.filter((company) => {
    const tier = normalizeCompanyRiskTier(company.riskTier);
    return tier === 'critical' || tier === 'high';
  }).length;
  const alertCount = 0;
  const initials = user?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.username.slice(0, 2).toUpperCase() || 'SA';
  const displayName = user?.fullName || user?.username || 'SATRIA User';

  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0 border-r"
      style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2.5">
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
        {/* Close button — only shown on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded md:hidden"
            style={{ color: 'var(--sidebar-foreground)', borderRadius: 'var(--radius)' }}
          >
            <X size={16} />
          </button>
        )}
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
              onClick={onClose}
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
          {isLoading ? (
            <div className="px-2.5 py-1.5 caption" style={{ color: 'var(--muted-foreground)' }}>
              Loading collections...
            </div>
          ) : activeBookmarks.length === 0 ? (
            <div className="px-2.5 py-1.5 caption" style={{ color: 'var(--muted-foreground)' }}>
              No active collections
            </div>
          ) : (
            activeBookmarks.map((bookmark, index) => (
              <NavLink
                key={bookmark.id}
                to={`/collections?bookmark=${bookmark.id}`}
                onClick={onClose}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors"
                style={{ borderRadius: 'var(--radius)', color: 'var(--sidebar-foreground)' }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: COLLECTION_COLORS[index % COLLECTION_COLORS.length] }}
                />
                <span className="truncate" style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)' }}>
                  {bookmark.name}
                </span>
                <span className="caption ml-auto shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  {bookmark.companies.length}
                </span>
              </NavLink>
            ))
          )}
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
          <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '11px', color: 'white', fontWeight: 500 }}>{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName}
          </div>
          <div className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'Authenticated session'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="rounded p-1.5 transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
