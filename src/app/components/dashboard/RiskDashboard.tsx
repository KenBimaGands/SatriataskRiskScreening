import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Star, Filter, TrendingDown, AlertTriangle, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { companies, RISK_COLORS, RISK_LABELS, type Company, type RiskTier, alerts } from '../../data/mockData';

type SortKey = 'riskScore' | 'name' | 'etr' | 'zScore';
type FilterMethod = 'all' | 'transferPricing' | 'debtShifting' | 'royaltyStripping' | 'shellLayering';

function RiskBadge({ tier, score }: { tier: RiskTier; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-16 rounded-full overflow-hidden"
        style={{ background: 'var(--muted)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: RISK_COLORS[tier] }}
        />
      </div>
      <span
        className="rounded px-1.5 py-0.5"
        style={{
          background: RISK_COLORS[tier] + '22',
          color: RISK_COLORS[tier],
          fontFamily: 'var(--text-label-family)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          border: `1px solid ${RISK_COLORS[tier]}44`,
        }}
      >
        {RISK_LABELS[tier]}
      </span>
      <span style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-sm)', color: RISK_COLORS[tier], fontWeight: 600 }}>
        {score}
      </span>
    </div>
  );
}

function FlagChip({ label, active, color }: { label: string; active: boolean; color: string }) {
  if (!active) return null;
  return (
    <span
      className="rounded px-1.5 py-0.5"
      style={{
        background: color + '18',
        color: color,
        fontFamily: 'var(--text-caption-family)',
        fontSize: '10px',
        border: `1px solid ${color}33`,
      }}
    >
      {label}
    </span>
  );
}

const FLAG_COLORS = {
  transferPricing: '#d97757',
  debtShifting: '#9b87f5',
  royaltyStripping: '#c9903a',
  shellLayering: '#bf4d43',
};

const METHOD_FILTERS: { key: FilterMethod; label: string }[] = [
  { key: 'all', label: 'All Methods' },
  { key: 'transferPricing', label: 'Transfer Pricing' },
  { key: 'debtShifting', label: 'Debt Shifting' },
  { key: 'royaltyStripping', label: 'Royalty Stripping' },
  { key: 'shellLayering', label: 'Shell Layering' },
];

export function RiskDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<FilterMethod>('all');
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [watchlist, setWatchlist] = useState<Set<string>>(
    new Set(companies.filter(c => c.onWatchlist).map(c => c.id))
  );

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const filtered = useMemo(() => {
    let result = [...companies];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q));
    }
    if (filterMethod !== 'all') {
      result = result.filter(c => c.flags[filterMethod]);
    }
    result.sort((a, b) => {
      let av: number | string = a[sortKey as keyof Company] as number | string;
      let bv: number | string = b[sortKey as keyof Company] as number | string;
      if (sortKey === 'etr') { av = a.currentEtr; bv = b.currentEtr; }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [search, filterMethod, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: companies.length,
    critical: companies.filter(c => c.riskTier === 'critical').length,
    high: companies.filter(c => c.riskTier === 'high').length,
    medium: companies.filter(c => c.riskTier === 'medium').length,
    low: companies.filter(c => c.riskTier === 'low').length,
  }), []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function toggleWatchlist(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)', marginBottom: 4 }}>
            Risk Triage Dashboard
          </h1>
          <p style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-p-size)', color: 'var(--muted-foreground)' }}>
            {companies.length} IDX-listed companies screened · Updated March 2026
          </p>
        </div>
        {unreadAlerts > 0 && (
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors hover:bg-card"
            style={{ borderColor: 'var(--destructive)', background: 'var(--destructive)18' }}
          >
            <AlertTriangle size={14} color="var(--destructive)" />
            <span style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-sm)', color: 'var(--destructive)', fontWeight: 500 }}>
              {unreadAlerts} new alerts
            </span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Screened', value: stats.total, color: 'var(--muted-foreground)', bg: 'var(--card)' },
          { label: 'Critical', value: stats.critical, color: '#bf4d43', bg: '#bf4d4312' },
          { label: 'High Risk', value: stats.high, color: '#d97757', bg: '#d9775712' },
          { label: 'Active Alerts', value: unreadAlerts, color: '#c9903a', bg: '#c9903a12' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: stat.bg, borderColor: 'var(--border)' }}
          >
            <div style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--text-h1-family)', fontSize: '28px', color: stat.color, marginTop: 4, lineHeight: 1 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--muted-foreground)" />
          <input
            type="text"
            placeholder="Search company, ticker, sector..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border pl-9 pr-4 py-2 bg-input-background outline-none focus:ring-1 focus:ring-ring"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} color="var(--muted-foreground)" />
          {METHOD_FILTERS.map(m => (
            <button
              key={m.key}
              onClick={() => setFilterMethod(m.key)}
              className="rounded-lg px-3 py-1.5 border transition-colors"
              style={{
                borderColor: filterMethod === m.key ? 'var(--accent)' : 'var(--border)',
                background: filterMethod === m.key ? 'var(--accent)20' : 'transparent',
                color: filterMethod === m.key ? 'var(--accent)' : 'var(--muted-foreground)',
                fontFamily: 'var(--text-label-family)',
                fontSize: 'var(--text-label-size)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--muted)20' }}
        >
          {[
            { label: '#', cols: 'col-span-1', key: null },
            { label: 'Company', cols: 'col-span-3', key: 'name' as SortKey },
            { label: 'Sector', cols: 'col-span-2', key: null },
            { label: 'Risk Score', cols: 'col-span-3', key: 'riskScore' as SortKey },
            { label: 'ETR', cols: 'col-span-1', key: 'etr' as SortKey },
            { label: 'Flags', cols: 'col-span-2', key: null },
          ].map(col => (
            <div key={col.label} className={col.cols}>
              <button
                onClick={() => col.key && toggleSort(col.key)}
                className="flex items-center gap-1"
                disabled={!col.key}
              >
                <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col.label}
                </span>
                {col.key && <ArrowUpDown size={10} color="var(--muted-foreground)" />}
              </button>
            </div>
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-p-size)' }}>
              No companies match your filters.
            </div>
          ) : (
            filtered.map((company, idx) => (
              <div
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className="grid grid-cols-12 gap-2 px-4 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.03] items-center"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Rank */}
                <div className="col-span-1 hidden sm:flex items-center">
                  <span style={{ fontFamily: 'var(--text-caption-family)', fontSize: 'var(--text-caption-size)', color: 'var(--muted-foreground)' }}>
                    {idx + 1}
                  </span>
                </div>

                {/* Company */}
                <div className="col-span-8 sm:col-span-3 flex items-center gap-2 min-w-0">
                  <button
                    onClick={e => toggleWatchlist(company.id, e)}
                    className="flex-shrink-0"
                  >
                    <Star
                      size={14}
                      fill={watchlist.has(company.id) ? '#c9903a' : 'none'}
                      color={watchlist.has(company.id) ? '#c9903a' : 'var(--muted-foreground)'}
                    />
                  </button>
                  <div className="min-w-0">
                    <div style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-sm)', color: 'var(--foreground)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {company.name}
                    </div>
                    <div style={{ fontFamily: 'var(--text-caption-family)', fontSize: 'var(--text-caption-size)', color: 'var(--muted-foreground)' }}>
                      {company.ticker}
                    </div>
                  </div>
                </div>

                {/* Sector */}
                <div className="col-span-2 hidden sm:block">
                  <span style={{ fontFamily: 'var(--text-caption-family)', fontSize: 'var(--text-caption-size)', color: 'var(--muted-foreground)' }}>
                    {company.sector}
                  </span>
                </div>

                {/* Risk Score */}
                <div className="col-span-4 sm:col-span-3">
                  <RiskBadge tier={company.riskTier} score={company.riskScore} />
                </div>

                {/* ETR */}
                <div className="col-span-1 hidden sm:block">
                  <div className="flex items-center gap-1">
                    <TrendingDown size={11} color={company.currentEtr < 15 ? '#bf4d43' : 'var(--muted-foreground)'} />
                    <span style={{ fontFamily: 'var(--text-sm)', fontSize: 'var(--text-sm)', color: company.currentEtr < 15 ? '#bf4d43' : 'var(--muted-foreground)' }}>
                      {company.currentEtr}%
                    </span>
                  </div>
                </div>

                {/* Flags */}
                <div className="col-span-2 hidden sm:flex items-center gap-1 flex-wrap">
                  <FlagChip label="TP" active={company.flags.transferPricing} color={FLAG_COLORS.transferPricing} />
                  <FlagChip label="DS" active={company.flags.debtShifting} color={FLAG_COLORS.debtShifting} />
                  <FlagChip label="RS" active={company.flags.royaltyStripping} color={FLAG_COLORS.royaltyStripping} />
                  <FlagChip label="SL" active={company.flags.shellLayering} color={FLAG_COLORS.shellLayering} />
                </div>

                {/* Arrow (mobile) */}
                <div className="col-span-1 sm:hidden flex justify-end">
                  <ChevronRight size={14} color="var(--muted-foreground)" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span style={{ fontFamily: 'var(--text-caption-family)', fontSize: 'var(--text-caption-size)', color: 'var(--muted-foreground)' }}>
          Flag legend:
        </span>
        {[
          { code: 'TP', label: 'Transfer Pricing', color: FLAG_COLORS.transferPricing },
          { code: 'DS', label: 'Debt Shifting', color: FLAG_COLORS.debtShifting },
          { code: 'RS', label: 'Royalty Stripping', color: FLAG_COLORS.royaltyStripping },
          { code: 'SL', label: 'Shell Layering', color: FLAG_COLORS.shellLayering },
        ].map(f => (
          <div key={f.code} className="flex items-center gap-1.5">
            <span
              className="rounded px-1.5 py-0.5"
              style={{ background: f.color + '18', color: f.color, fontFamily: 'var(--text-caption-family)', fontSize: '10px', border: `1px solid ${f.color}33` }}
            >
              {f.code}
            </span>
            <span style={{ fontFamily: 'var(--text-caption-family)', fontSize: 'var(--text-caption-size)', color: 'var(--muted-foreground)' }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
