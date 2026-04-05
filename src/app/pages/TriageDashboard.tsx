import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  Building2,
  Filter,
  RefreshCcw,
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { useCompanyCollections } from '../company-collections/CompanyCollectionsContext';
import { getRiskColor, type AvoidanceMethod, type RiskTier } from '../data/mockData';
import {
  formatMethodLabel,
  formatMethodShort,
  normalizeCompanyRiskTier,
  normalizeMethod,
  type CompanyCollection,
} from '../lib/companyCollections';

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

function getLastSync(companies: CompanyCollection[]) {
  if (companies.length === 0) {
    return 'No data';
  }

  const latest = [...companies].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0];

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(latest.updatedAt));
}

export function TriageDashboard() {
  const navigate = useNavigate();
  const { companies, isLoading, error, refreshCompanies } = useCompanyCollections();
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<RiskTier | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState<AvoidanceMethod | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const counts = useMemo(
    () => ({
      critical: companies.filter((company) => normalizeCompanyRiskTier(company.riskTier) === 'critical').length,
      high: companies.filter((company) => normalizeCompanyRiskTier(company.riskTier) === 'high').length,
      medium: companies.filter((company) => normalizeCompanyRiskTier(company.riskTier) === 'medium').length,
      low: companies.filter((company) => normalizeCompanyRiskTier(company.riskTier) === 'low').length,
    }),
    [companies],
  );

  const filtered = useMemo(() => {
    let list = [...companies];

    if (search) {
      const query = search.toLowerCase();
      list = list.filter(
        (company) =>
          company.companyName.toLowerCase().includes(query) ||
          company.companyNickname.toLowerCase().includes(query) ||
          company.sector.toLowerCase().includes(query),
      );
    }

    if (filterTier !== 'all') {
      list = list.filter(
        (company) => normalizeCompanyRiskTier(company.riskTier) === filterTier,
      );
    }

    if (filterMethod !== 'all') {
      list = list.filter((company) =>
        company.methods.some((method) => normalizeMethod(method) === filterMethod),
      );
    }

    list.sort((left, right) => {
      let leftValue: number | string;
      let rightValue: number | string;

      if (sortKey === 'riskScore') {
        leftValue = left.riskScore;
        rightValue = right.riskScore;
      } else if (sortKey === 'name') {
        leftValue = left.companyName;
        rightValue = right.companyName;
      } else if (sortKey === 'sector') {
        leftValue = left.sector;
        rightValue = right.sector;
      } else {
        leftValue = left.etr_score;
        rightValue = right.etr_score;
      }

      if (typeof leftValue === 'string') {
        return sortDir === 'asc'
          ? leftValue.localeCompare(rightValue as string)
          : (rightValue as string).localeCompare(leftValue);
      }

      return sortDir === 'asc'
        ? leftValue - (rightValue as number)
        : (rightValue as number) - leftValue;
    });

    return list;
  }, [companies, filterMethod, filterTier, search, sortDir, sortKey]);

  const topRisk = useMemo(
    () =>
      [...filtered]
        .filter((company) => {
          const tier = normalizeCompanyRiskTier(company.riskTier);
          return tier === 'critical' || tier === 'high';
        })
        .sort((left, right) => right.riskScore - left.riskScore)
        .slice(0, 3),
    [filtered],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir('desc');
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1
            style={{
              fontFamily: 'var(--text-h1-family)',
              fontSize: 'var(--text-h1-size)',
              color: 'var(--foreground)',
            }}
          >
            Triage Dashboard
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Risk-ranked screening of {companies.length} backend companies
          </p>
        </div>
        <div className="shrink-0">
          <div
            className="rounded px-3 py-1.5 caption"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            Last sync: <span style={{ color: 'var(--foreground)' }}>{getLastSync(companies)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            background: 'rgba(191, 77, 67, 0.12)',
            borderColor: 'rgba(191, 77, 67, 0.4)',
            color: 'rgb(255, 207, 201)',
          }}
        >
          <div>{error}</div>
          <button
            type="button"
            onClick={() => {
              void refreshCompanies();
            }}
            className="mt-2 inline-flex items-center gap-1.5 caption"
            style={{ color: 'rgb(255, 207, 201)' }}
          >
            <RefreshCcw size={12} /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Critical Risk', value: counts.critical, tier: 'critical' as RiskTier, sub: 'Escalate to formal audit' },
          { label: 'High Risk', value: counts.high, tier: 'high' as RiskTier, sub: 'Recommend screening' },
          { label: 'Medium Risk', value: counts.medium, tier: 'medium' as RiskTier, sub: 'Add to watchlist' },
          { label: 'Low Risk', value: counts.low, tier: 'low' as RiskTier, sub: 'No immediate action' },
        ].map((stat) => (
          <div
            key={stat.tier}
            className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--text-h1-family)',
                    fontSize: '28px',
                    color: getRiskColor(stat.tier),
                    lineHeight: 1.2,
                    marginTop: '4px',
                  }}
                >
                  {stat.value}
                </div>
                <div className="caption" style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  {stat.sub}
                </div>
              </div>
              <div className="mt-1 h-2 w-2 rounded-full" style={{ background: getRiskColor(stat.tier) }} />
            </div>
          </div>
        ))}
      </div>

      {topRisk.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={14} color="var(--destructive)" />
            <h3
              style={{
                fontFamily: 'var(--text-h3-family)',
                fontSize: 'var(--text-h3-size)',
                color: 'var(--foreground)',
              }}
            >
              Priority for Review
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topRisk.map((company) => {
              const tier = normalizeCompanyRiskTier(company.riskTier);
              return (
                <button
                  key={company.id}
                  onClick={() => navigate(`/company/${company.id}`)}
                  className="rounded-xl border p-4 text-left transition-all hover:border-opacity-80"
                  style={{
                    background: 'var(--card)',
                    border: `1px solid ${getRiskColor(tier)}33`,
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        {company.companyNickname}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--text-h3-family)',
                          fontSize: 'var(--text-h3-size)',
                          color: 'var(--foreground)',
                          marginTop: '2px',
                        }}
                      >
                        {company.companyName.replace('PT ', '').split(' ').slice(0, 3).join(' ')}
                      </div>
                    </div>
                    <RiskGauge score={company.riskScore} size={64} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge tier={tier} size="sm" />
                    <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                      {company.sector}
                    </span>
                  </div>
                  <div
                    className="mt-2 rounded px-2 py-1 caption"
                    style={{ background: 'rgba(0,0,0,0.35)', color: getRiskColor(tier), borderRadius: 'var(--radius-sm)' }}
                  >
                    Methods: {company.methods.slice(0, 2).map(formatMethodLabel).join(', ') || 'None'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <input
              type="text"
              placeholder="Search company name, nickname, or sector..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded py-2 pl-9 pr-4 outline-none"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-input)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters((current) => !current)}
            className="flex shrink-0 items-center gap-2 rounded px-3 py-2"
            style={{
              background: showFilters ? 'var(--accent)' : 'var(--input-background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: showFilters ? 'white' : 'var(--foreground)',
            }}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filters</span>
            {(filterTier !== 'all' || filterMethod !== 'all') && (
              <span
                className="caption flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background: 'var(--destructive)', color: 'white' }}
              >
                {[filterTier !== 'all', filterMethod !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div
            className="mt-3 flex flex-col flex-wrap items-start gap-3 border-t pt-3 sm:flex-row sm:items-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                Risk tier:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterTier('all')}
                  className="rounded px-2.5 py-1 caption"
                  style={{
                    background: filterTier === 'all' ? 'var(--accent)' : 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: filterTier === 'all' ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  All
                </button>
                {RISK_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    onClick={() => setFilterTier(tier.value)}
                    className="rounded px-2.5 py-1 caption"
                    style={{
                      background: filterTier === tier.value ? `${getRiskColor(tier.value)}22` : 'var(--input-background)',
                      border: `1px solid ${filterTier === tier.value ? getRiskColor(tier.value) + '66' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: filterTier === tier.value ? getRiskColor(tier.value) : 'var(--muted-foreground)',
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden h-5 w-px sm:block" style={{ background: 'var(--border)' }} />

            <div className="flex flex-wrap items-center gap-2">
              <span className="caption" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                Method:
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterMethod('all')}
                  className="rounded px-2.5 py-1 caption"
                  style={{
                    background: filterMethod === 'all' ? 'var(--accent)' : 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: filterMethod === 'all' ? 'white' : 'var(--muted-foreground)',
                  }}
                >
                  All
                </button>
                {AVOIDANCE_METHODS.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setFilterMethod(method.value)}
                    className="rounded px-2.5 py-1 caption"
                    style={{
                      background: filterMethod === method.value ? 'rgba(32,127,222,0.15)' : 'var(--input-background)',
                      border: `1px solid ${filterMethod === method.value ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: filterMethod === method.value ? 'var(--accent)' : 'var(--muted-foreground)',
                    }}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="overflow-hidden rounded-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        {isLoading ? (
          <div className="px-4 py-10 text-center" style={{ color: 'var(--muted-foreground)' }}>
            Loading company collections from `/api/company-collections`...
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <div
                className="grid items-center border-b px-4 py-3"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 8rem 7rem 7rem 8rem 6rem 5rem',
                  borderColor: 'var(--border)',
                  minWidth: '720px',
                }}
              >
                {[
                  { key: null, label: '#' },
                  { key: 'name' as SortKey, label: 'Company' },
                  { key: 'sector' as SortKey, label: 'Sector' },
                  { key: 'riskScore' as SortKey, label: 'Risk Score' },
                  { key: 'etr' as SortKey, label: 'ETR Score' },
                  { key: null, label: 'Method' },
                  { key: null, label: 'Status' },
                  { key: null, label: '' },
                ].map(({ key, label }, index) => (
                  <button
                    key={index}
                    onClick={() => key && handleSort(key)}
                    className={`flex items-center gap-1 caption ${key ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
                    style={{ color: key && sortKey === key ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  >
                    {label}
                    {key && sortKey === key && (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                  </button>
                ))}
              </div>

              <div style={{ minWidth: '720px' }}>
                {filtered.map((company, index) => {
                  const tier = normalizeCompanyRiskTier(company.riskTier);

                  return (
                    <button
                      key={company.id}
                      onClick={() => navigate(`/company/${company.id}`)}
                      className="grid w-full items-center border-b px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                      style={{
                        gridTemplateColumns: '2.5rem 1fr 8rem 7rem 7rem 8rem 6rem 5rem',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                        {index + 1}
                      </span>

                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontFamily: 'var(--text-p-family)',
                              fontSize: '14px',
                              color: 'var(--foreground)',
                              fontWeight: 500,
                            }}
                          >
                            {company.companyNickname}
                          </span>
                        </div>
                        <div className="caption mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {company.companyName}
                        </div>
                      </div>

                      <span className="caption truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {company.sector}
                      </span>

                      <div className="flex items-center gap-2">
                        <div
                          className="max-w-[60px] flex-1 overflow-hidden rounded-full"
                          style={{ background: 'var(--muted)', height: '6px' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${company.riskScore}%`, background: getRiskColor(tier) }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--text-p-family)',
                            fontSize: '14px',
                            color: getRiskColor(tier),
                            fontWeight: 500,
                          }}
                        >
                          {company.riskScore}
                        </span>
                      </div>

                      <span
                        style={{
                          fontFamily: 'var(--text-p-family)',
                          fontSize: '14px',
                          color: company.etr_score < 12 ? 'var(--destructive)' : company.etr_score < 20 ? '#D4A017' : 'var(--foreground)',
                          fontWeight: company.etr_score < 20 ? 500 : 400,
                        }}
                      >
                        {company.etr_score.toFixed(1)}
                        {company.etr_score < 22 && (
                          <TrendingDown
                            size={11}
                            className="ml-1 inline"
                            style={{ color: company.etr_score < 12 ? 'var(--destructive)' : '#D4A017' }}
                          />
                        )}
                      </span>

                      <div className="flex flex-wrap gap-1">
                        {company.methods.slice(0, 2).map((method) => (
                          <span
                            key={`${company.id}-${method}`}
                            className="rounded px-1.5 py-0.5 caption"
                            style={{
                              background: 'rgba(32,127,222,0.12)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(32,127,222,0.2)',
                              borderRadius: 'var(--radius-sm)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatMethodShort(method)}
                          </span>
                        ))}
                      </div>

                      <RiskBadge tier={tier} size="sm" />

                      <div className="flex justify-end">
                        <ArrowUpRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y md:hidden" style={{ borderColor: 'var(--border)' }}>
              {filtered.map((company, index) => {
                const tier = normalizeCompanyRiskTier(company.riskTier);
                return (
                  <button
                    key={company.id}
                    onClick={() => navigate(`/company/${company.id}`)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="caption w-5 shrink-0 text-center" style={{ color: 'var(--muted-foreground)' }}>
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          style={{
                            fontFamily: 'var(--text-p-family)',
                            fontSize: '14px',
                            color: 'var(--foreground)',
                            fontWeight: 500,
                          }}
                        >
                          {company.companyNickname}
                        </span>
                        <RiskBadge tier={tier} size="sm" />
                      </div>
                      <div className="caption mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {company.companyName}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="caption" style={{ color: company.etr_score < 12 ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                          ETR {company.etr_score.toFixed(1)}
                        </span>
                        <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                          {company.sector}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        style={{
                          fontFamily: 'var(--text-p-family)',
                          fontSize: '16px',
                          color: getRiskColor(tier),
                          fontWeight: 500,
                        }}
                      >
                        {company.riskScore}
                      </span>
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

            <div className="flex flex-col items-start justify-between gap-1 px-4 py-3 sm:flex-row sm:items-center">
              <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                Showing {filtered.length} of {companies.length} backend companies
              </span>
              <span className="hidden caption md:inline" style={{ color: 'var(--muted-foreground)' }}>
                TP = Transfer Pricing · DS = Debt Shifting · RS = Royalty Stripping · SL = Shell Layering
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
