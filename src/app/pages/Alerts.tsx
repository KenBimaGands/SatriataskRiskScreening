import { useNavigate } from 'react-router';
import { Bell, AlertTriangle, TrendingDown, ArrowUpRight } from 'lucide-react';
import { MOCK_COMPANIES, getRiskColor } from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';

export function Alerts() {
  const navigate = useNavigate();

  const allAlerts = MOCK_COMPANIES.flatMap(c =>
    c.alerts.map(a => ({ company: c, alert: a }))
  );

  const systemAlerts = [
    { type: 'sync', message: 'IDX Q4 2023 annual reports fully ingested — 891 companies updated', date: '2026-03-20', severity: 'info' as const },
    { type: 'new_filing', message: '12 new companies filed 2023 annual reports since last scan', date: '2026-03-19', severity: 'info' as const },
    { type: 'haven', message: '3 new tax haven entity registrations detected in ownership disclosures', date: '2026-03-18', severity: 'warning' as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)' }}>
          Alerts
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
          {allAlerts.length} company-level alerts · Updated March 2026
        </p>
      </div>

      {/* Company Alerts */}
      {allAlerts.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <AlertTriangle size={14} color="var(--destructive)" />
            <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
              Company-Level Alerts ({allAlerts.length})
            </h3>
          </div>
          <div>
            {allAlerts.map(({ company, alert }, i) => (
              <button
                key={i}
                onClick={() => navigate(`/company/${company.id}`)}
                className="w-full flex items-center gap-4 px-4 py-3 border-b text-left hover:bg-white/[0.03] transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: 'var(--destructive)' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>
                      {company.ticker}
                    </span>
                    <RiskBadge tier={company.riskTier} size="sm" />
                    <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{company.sector}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: 'var(--foreground)' }}>
                    {alert}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    style={{ fontFamily: 'var(--text-h2-family)', fontSize: '18px', color: getRiskColor(company.riskTier) }}
                  >
                    {company.riskScore}
                  </span>
                  <ArrowUpRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* System Alerts */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Bell size={14} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
            System Alerts
          </h3>
        </div>
        <div>
          {systemAlerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ background: alert.severity === 'warning' ? '#D4A017' : 'var(--accent)' }}
              />
              <div>
                <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: 'var(--foreground)' }}>
                  {alert.message}
                </div>
                <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {alert.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
