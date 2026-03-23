import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  SlidersHorizontal,
  Star,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  Building2,
  Filter,
} from 'lucide-react';
import {
  MOCK_COMPANIES,
  SECTOR_STATS,
  getRiskColor,
  getRiskLabel,
  getAvoidanceLabel,
  type AvoidanceMethod,
  type RiskTier,
  type Company,
} from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';

type SortKey = 'riskScore' | 'name' | 'sector' | 'etr';
type SortDir = 'asc' | 'desc';

const AVOIDANCE_METHODS: { value: AvoidanceMethod; label: string }[] = [
  { value: 'transfer_pricing', label: 'Transfer Pricing' },
  { value: 'debt_shifting', label: 'Debt Shifting' },
  { value: 'royalty_stripping', label: 'Royalty Stripping' },
  { value: 'shell_layering', label: 'Shell Layering' },
];

const RISK_TIERS: { value: RiskTier; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TriageDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<RiskTier | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState<AvoidanceMethod | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = [...MOCK_COMPANIES];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q));
    }
    if (filterTier !== 'all') list = list.filter(c => c.riskTier === filterTier);
    if (filterMethod !== 'all') list = list.filter(c => c.avoidanceMethods.includes(filterMethod));
    list.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortKey === 'riskScore') { av = a.riskScore; bv = b.riskScore; }
      else if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'sector') { av = a.sector; bv = b.sector; }
      else { av = a.financials.at(-1)?.etr ?? 0; bv = b.financials.at(-1)?.etr ?? 0; }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av - (bv as number)) : ((bv as number) - av);
    });
    return list;
  }, [search, filterTier, filterMethod, sortKey, sortDir]);

  const topRisk = filtered.filter(c => c.riskTier === 'critical' || c.riskTier === 'high').slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)' }}>
            Triage Dashboard
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Risk-ranked screening of {SECTOR_STATS.totalCompanies} IDX-listed companies · Updated March 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded caption"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
          >
            Last sync: <span style={{ color: 'var(--foreground)' }}>20 Mar 2026</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Critical Risk', value: SECTOR_STATS.criticalCount, tier: 'critical' as RiskTier, sub: 'Escalate to formal audit' },
          { label: 'High Risk', value: SECTOR_STATS.highCount, tier: 'high' as RiskTier, sub: 'Recommend screening' },
          { label: 'Medium Risk', value: SECTOR_STATS.mediumCount, tier: 'medium' as RiskTier, sub: 'Add to watchlist' },
          { label: 'Low Risk', value: SECTOR_STATS.lowCount, tier: 'low' as RiskTier, sub: 'No immediate action' },
        ].map(stat => (
          <div
            key={stat.tier}
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="caption" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</div>
                <div style={{ fontFamily: 'var(--text-h1-family)', fontSize: '28px', color: getRiskColor(stat.tier), lineHeight: 1.2, marginTop: '4px' }}>
                  {stat.value}
                </div>
                <div className="caption" style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>{stat.sub}</div>
              </div>
              <div
                className="w-2 h-2 rounded-full mt-1"
                style={{ background: getRiskColor(stat.tier) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top Risk Spotlight */}
      {topRisk.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} color="var(--destructive)" />
            <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
              Priority for Review
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topRisk.map(company => (
              <button
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className="text-left p-4 rounded-xl border transition-all hover:border-opacity-80"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${getRiskColor(company.riskTier)}33`,
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {company.ticker}
                    </div>
                    <div style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', marginTop: '2px' }}>
                      {company.name.replace('PT ', '').split(' ').slice(0, 3).join(' ')}
                    </div>
                  </div>
                  <RiskGauge score={company.riskScore} size={64} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge tier={company.riskTier} size="sm" />
                  <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{company.sector}</span>
                </div>
                {company.alerts.length > 0 && (
                  <div
                    className="mt-2 px-2 py-1 rounded caption"
                    style={{ background: 'rgba(0,0,0,0.85)', color: 'var(--destructive)', borderRadius: 'var(--radius-sm)' }}
                  >
                    {company.alerts[0]}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Search company name, ticker, or sector…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded outline-none"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-input)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-3 py-2 rounded"
            style={{
              background: showFilters ? 'var(--accent)' : 'var(--input-background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: showFilters ? 'white' : 'var(--foreground)',
            }}
          >
            <Filter size={14} />
            <span>Filters</span>
            {(filterTier !== 'all' || filterMethod !== 'all') && (
              <span
                className="caption w-4 h-4 flex items-center justify-center rounded-full"
                style={{ background: 'var(--destructive)', color: 'white' }}
              >
                {[filterTier !== 'all', filterMethod !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>Risk tier:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterTier('all')}
                  className="caption px-2.5 py-1 rounded"
                  style={{
                    background: filterTier === 'all' ? 'var(--accent)' : 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: filterTier === 'all' ? 'white' : 'var(--muted-foreground)',
                  }}
                >All</button>
                {RISK_TIERS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setFilterTier(t.value)}
                    className="caption px-2.5 py-1 rounded"
                    style={{
                      background: filterTier === t.value ? `${getRiskColor(t.value)}22` : 'var(--input-background)',
                      border: `1px solid ${filterTier === t.value ? getRiskColor(t.value) + '66' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: filterTier === t.value ? getRiskColor(t.value) : 'var(--muted-foreground)',
                    }}
                  >{t.label}</button>
                ))}
              </div>
            </div>
            <div className="w-px h-5" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-2">
              <span className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>Method:</span>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setFilterMethod('all')}
                  className="caption px-2.5 py-1 rounded"
                  style={{
                    background: filterMethod === 'all' ? 'var(--accent)' : 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: filterMethod === 'all' ? 'white' : 'var(--muted-foreground)',
                  }}
                >All</button>
                {AVOIDANCE_METHODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setFilterMethod(m.value)}
                    className="caption px-2.5 py-1 rounded"
                    style={{
                      background: filterMethod === m.value ? 'rgba(32,127,222,0.15)' : 'var(--input-background)',
                      border: `1px solid ${filterMethod === m.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: filterMethod === m.value ? 'var(--accent)' : 'var(--muted-foreground)',
                    }}
                  >{m.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Company Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        {/* Table Header */}
        <div
          className="grid items-center px-4 py-3 border-b"
          style={{
            gridTemplateColumns: '2.5rem 1fr 8rem 7rem 7rem 7rem 6rem 5rem',
            borderColor: 'var(--border)',
          }}
        >
          {[
            { key: null, label: '#' },
            { key: 'name' as SortKey, label: 'Company' },
            { key: 'sector' as SortKey, label: 'Sector' },
            { key: 'riskScore' as SortKey, label: 'Risk Score' },
            { key: 'etr' as SortKey, label: 'ETR (2023)' },
            { key: null, label: 'Method' },
            { key: null, label: 'Status' },
            { key: null, label: '' },
          ].map(({ key, label }, i) => (
            <button
              key={i}
              onClick={() => key && handleSort(key)}
              className={`flex items-center gap-1 caption ${key ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
              style={{ color: key && sortKey === key ? 'var(--foreground)' : 'var(--muted-foreground)' }}
            >
              {label}
              {key && sortKey === key && (
                sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
              )}
            </button>
          ))}
        </div>

        {/* Table Rows */}
        <div>
          {filtered.map((company, idx) => {
            const lastFY = company.financials.at(-1)!;
            return (
              <button
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className="w-full grid items-center px-4 py-3 border-b text-left transition-colors hover:bg-white/[0.03]"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 8rem 7rem 7rem 7rem 6rem 5rem',
                  borderColor: 'var(--border)',
                }}
              >
                {/* Rank */}
                <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  {idx + 1}
                </span>

                {/* Company */}
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    {company.isWatchlisted && (
                      <Star size={12} fill="var(--primary)" color="var(--primary)" />
                    )}
                    <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: 'var(--foreground)', fontWeight: 500 }}>
                      {company.ticker}
                    </span>
                    {company.alerts.length > 0 && (
                      <span
                        className="caption px-1.5 rounded"
                        style={{ background: 'rgba(191,77,67,0.15)', color: 'var(--destructive)', borderRadius: 'var(--radius-sm)' }}
                      >
                        {company.alerts.length} alert{company.alerts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="caption truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {company.name}
                  </div>
                </div>

                {/* Sector */}
                <span className="caption truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {company.sector}
                </span>

                {/* Risk Score */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 rounded-full overflow-hidden flex-1 max-w-[60px]"
                    style={{ background: 'var(--muted)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${company.riskScore}%`,
                        background: getRiskColor(company.riskTier),
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: getRiskColor(company.riskTier), fontWeight: 500 }}>
                    {company.riskScore}
                  </span>
                </div>

                {/* ETR */}
                <span style={{
                  fontFamily: 'var(--text-p-family)',
                  fontSize: '14px',
                  color: lastFY.etr < 12 ? 'var(--destructive)' : lastFY.etr < 20 ? '#D4A017' : 'var(--foreground)',
                  fontWeight: lastFY.etr < 20 ? 500 : 400,
                }}>
                  {lastFY.etr.toFixed(1)}%
                  {lastFY.etr < 22 && (
                    <TrendingDown size={11} className="inline ml-1" style={{ color: lastFY.etr < 12 ? 'var(--destructive)' : '#D4A017' }} />
                  )}
                </span>

                {/* Methods */}
                <div className="flex gap-1 flex-wrap">
                  {company.avoidanceMethods.slice(0, 2).map(m => (
                    <span
                      key={m}
                      className="caption px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(32,127,222,0.12)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(32,127,222,0.2)',
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m === 'transfer_pricing' ? 'TP' : m === 'debt_shifting' ? 'DS' : m === 'royalty_stripping' ? 'RS' : 'SL'}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <RiskBadge tier={company.riskTier} size="sm" />

                {/* Arrow */}
                <div className="flex justify-end">
                  <ArrowUpRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Building2 size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>No companies match your filters</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
            Showing {filtered.length} of {MOCK_COMPANIES.length} companies (demo dataset)
          </span>
          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
            TP = Transfer Pricing · DS = Debt Shifting · RS = Royalty Stripping · SL = Shell Layering
          </span>
        </div>
      </div>
    </div>
  );
}