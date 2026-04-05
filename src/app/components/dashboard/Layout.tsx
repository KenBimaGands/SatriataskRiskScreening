import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Bookmark,
  Star,
  Bell,
  ChevronRight,
  Shield,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { alerts } from "../../data/mockData";

const unreadCount = alerts.filter((a) => !a.isRead).length;

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Risk Dashboard" },
  { to: "/watchlist", icon: Star, label: "Watchlist" },
  { to: "/collections", icon: Bookmark, label: "Collections" },
  { to: "/alerts", icon: Bell, label: "Alerts", badge: unreadCount },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar border-r lg:relative lg:translate-x-0 transition-transform duration-200"
        style={{
          borderColor: "var(--sidebar-border)",
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo area */}
        <div
          className="flex h-16 items-center gap-3 px-5 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: "var(--primary)" }}
          >
            <Shield size={16} color="white" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--text-h3-family)",
                fontSize: "var(--text-h3-size)",
                color: "var(--foreground)",
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              SATRIA
            </div>
            <div
              style={{
                fontFamily: "var(--text-caption-family)",
                fontSize: "var(--text-caption-size)",
                color: "var(--sidebar-foreground)",
                lineHeight: 1,
              }}
            >
              Tax Risk Screening
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <div
            style={{
              fontFamily: "var(--text-label-family)",
              fontSize: "var(--text-label-size)",
              color: "var(--sidebar-foreground)",
              padding: "8px 8px 4px",
              opacity: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Navigation
          </div>
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors relative"
              style={({ isActive }) => ({
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                color: isActive
                  ? "var(--foreground)"
                  : "var(--sidebar-foreground)",
              })}
            >
              <Icon size={16} />
              <span
                style={{
                  fontFamily: "var(--text-p-family)",
                  fontSize: "var(--text-p-size)",
                }}
              >
                {label}
              </span>
              {badge && badge > 0 && (
                <span
                  className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1"
                  style={{
                    background: "var(--destructive)",
                    color: "white",
                    fontFamily: "var(--text-caption-family)",
                    fontSize: "10px",
                  }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          <div
            style={{
              fontFamily: "var(--text-label-family)",
              fontSize: "var(--text-label-size)",
              color: "var(--sidebar-foreground)",
              padding: "16px 8px 4px",
              opacity: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Risk Tiers
          </div>
          <div className="space-y-1 px-3">
            {[
              { label: "Critical (81–100)", color: "#bf4d43", count: 1 },
              { label: "High (61–80)", color: "#d97757", count: 3 },
              { label: "Medium (31–60)", color: "#c9903a", count: 6 },
              { label: "Low (0–30)", color: "#4a9d6e", count: 3 },
            ].map((tier) => (
              <div key={tier.label} className="flex items-center gap-2 py-1">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: tier.color }}
                />
                <span
                  style={{
                    fontFamily: "var(--text-caption-family)",
                    fontSize: "var(--text-caption-size)",
                    color: "var(--sidebar-foreground)",
                  }}
                >
                  {tier.label}
                </span>
                <span
                  className="ml-auto"
                  style={{
                    fontFamily: "var(--text-caption-family)",
                    fontSize: "var(--text-caption-size)",
                    color: "var(--sidebar-foreground)",
                    opacity: 0.6,
                  }}
                >
                  {tier.count}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div
          className="border-t p-4"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 items-center justify-center rounded-full flex-shrink-0"
              style={{
                background: "var(--primary)",
                color: "white",
                fontFamily: "var(--text-p-family)",
                fontSize: "var(--text-sm)",
              }}
            >
              BS
            </div>
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: "var(--text-p-family)",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  fontWeight: 500,
                }}
              >
                Budi Santoso
              </div>
              <div
                style={{
                  fontFamily: "var(--text-caption-family)",
                  fontSize: "var(--text-caption-size)",
                  color: "var(--sidebar-foreground)",
                  lineHeight: 1.2,
                }}
              >
                DJP Transfer Pricing Unit
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar (mobile only) */}
        <div
          className="flex h-14 items-center gap-3 border-b px-4 lg:hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={20} color="var(--foreground)" />
          </button>
          <div
            style={{
              fontFamily: "var(--text-h3-family)",
              fontSize: "var(--text-h3-size)",
              color: "var(--foreground)",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            SATRIA
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
