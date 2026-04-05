import { useEffect, useMemo, useState } from 'react';
import { AnalysisRecomendationAPIInterface, useFetchData } from '../lib/api-connection';

import { useNavigate, useParams } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Download,
  FileText,
  Info,
  MapPin,
  Plus,
  Shield,
  Star,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OwnershipGraph } from '../components/OwnershipGraph';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { useCompanyCollections } from '../company-collections/CompanyCollectionsContext';
import {
  MOCK_COMPANIES,
  getAvoidanceLabel,
  type AvoidanceMethod,
  type Company,
  type FinancialYear,
  type InvestigatorAnnotation,
} from '../data/mockData';
import {
  formatMethodLabel,
  normalizeCompanyRiskTier,
  normalizeMethod,
  type CompanyCollection,
} from '../lib/companyCollections';

const SIGNAL_LABELS: Record<string, string> = {
  etr: 'ETR Anomaly',
  margin: 'Net Margin',
  rpHaven: 'RP → Tax Havens',
  debt: 'Debt Shifting',
  ownership: 'Shell Layering',
  conduct: 'Prior Conduct',
};

const SIGNAL_WEIGHTS: Record<string, number> = {
  etr: 25,
  margin: 20,
  rpHaven: 20,
  debt: 15,
  ownership: 10,
  conduct: 10,
};

const STATUTORY_RATE = 22;
const PIE_COLORS = ['#207FDE', '#BF4D43', '#D97757', '#9B87F5', '#4CAF74'];

type DetailTab = 'financial' | 'ownership' | 'documentation';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\btbk\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findMockCompany(backendCompany: CompanyCollection) {
  const nickname = backendCompany.companyNickname.trim().toLowerCase();
  const fullName = normalizeName(backendCompany.companyName);

  return (
    MOCK_COMPANIES.find((company) => company.ticker.trim().toLowerCase() === nickname) ??
    MOCK_COMPANIES.find((company) => company.name.trim().toLowerCase() === backendCompany.companyName.trim().toLowerCase()) ??
    MOCK_COMPANIES.find((company) => normalizeName(company.name) === fullName) ??
    null
  );
}

function mapMethods(backendCompany: CompanyCollection, mockCompany: Company | null): AvoidanceMethod[] {
  const normalized = backendCompany.methods
    .map((method) => normalizeMethod(method))
    .filter((method): method is AvoidanceMethod => method !== null);

  if (normalized.length > 0) {
    return normalized;
  }

  return mockCompany?.avoidanceMethods ?? [];
}

function buildFallbackFinancials(backendCompany: CompanyCollection): FinancialYear[] {
  return [
    {
      year: new Date(backendCompany.updatedAt).getFullYear(),
      revenue: backendCompany.revenue,
      ebitda: 0,
      netProfit: 0,
      taxPaid: 0,
      preTaxProfit: 0,
      etr: backendCompany.etr_score,
      netMargin: backendCompany.margin_score,
      totalLiabilities: 0,
      totalEquity: 0,
      deRatio: backendCompany.debt_score,
      rpPayments: backendCompany.rp_haven_score,
    },
  ];
}

function buildDetailCompany(backendCompany: CompanyCollection, mockCompany: Company | null): Company {
  return {
    id: String(backendCompany.id),
    ticker: backendCompany.companyNickname || mockCompany?.ticker || 'N/A',
    name: backendCompany.companyName || mockCompany?.name || 'Unknown company',
    sector: backendCompany.sector || mockCompany?.sector || 'Unknown sector',
    npwp: mockCompany?.npwp || 'No NPWP data available',
    riskScore: backendCompany.riskScore,
    riskTier: normalizeCompanyRiskTier(backendCompany.riskTier),
    signals: {
      etr: Number.isFinite(backendCompany.etr_score) ? backendCompany.etr_score : (mockCompany?.signals.etr ?? 0),
      margin: Number.isFinite(backendCompany.margin_score) ? backendCompany.margin_score : (mockCompany?.signals.margin ?? 0),
      rpHaven: Number.isFinite(backendCompany.rp_haven_score) ? backendCompany.rp_haven_score : (mockCompany?.signals.rpHaven ?? 0),
      debt: Number.isFinite(backendCompany.debt_score) ? backendCompany.debt_score : (mockCompany?.signals.debt ?? 0),
      ownership: Number.isFinite(backendCompany.ownership_score) ? backendCompany.ownership_score : (mockCompany?.signals.ownership ?? 0),
      conduct: Number.isFinite(backendCompany.conduct_score) ? backendCompany.conduct_score : (mockCompany?.signals.conduct ?? 0),
    },
    avoidanceMethods: mapMethods(backendCompany, mockCompany),
    financials: mockCompany?.financials ?? buildFallbackFinancials(backendCompany),
    sectorPeerMeanMargin: mockCompany?.sectorPeerMeanMargin ?? 0,
    sectorPeerStdMargin: mockCompany?.sectorPeerStdMargin ?? 0,
    zScore: mockCompany?.zScore ?? 0,
    ownershipNodes: mockCompany?.ownershipNodes ?? [],
    ownershipEdges: mockCompany?.ownershipEdges ?? [],
    taxHavenCount: mockCompany?.taxHavenCount ?? 0,
    priorConduct: mockCompany?.priorConduct ?? [],
    mysteryEntities: mockCompany?.mysteryEntities ?? [],
    rpJurisdictions: mockCompany?.rpJurisdictions ?? [],
    impliedRPRate: mockCompany?.impliedRPRate ?? 0,
    biRate: mockCompany?.biRate ?? 0,
    isWatchlisted:
      normalizeCompanyRiskTier(backendCompany.riskTier) === 'critical' ||
      normalizeCompanyRiskTier(backendCompany.riskTier) === 'high' ||
      Boolean(mockCompany?.isWatchlisted),
    watchlistNote: mockCompany?.watchlistNote ?? '',
    annotations: mockCompany?.annotations ?? [],
    aiSummary:
      mockCompany?.aiSummary ??
      `${backendCompany.companyName} currently carries a ${backendCompany.riskTier.toLowerCase()} backend risk tier with a risk score of ${backendCompany.riskScore}. Detailed investigative narrative is not available in the backend yet.`,
    lastUpdated: formatDate(backendCompany.updatedAt),
    alerts: mockCompany?.alerts ?? [],
  };
}

function EmptyStateCard({
  title,
  description,
  className = '',
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`.trim()}
      style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
    >
      <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
        {title}
      </h4>
      <p className="caption mt-2" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
    </div>
  );
}

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, loadCompanyById } = useCompanyCollections();
  const [company, setCompany] = useState<CompanyCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('financial');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [annotations, setAnnotations] = useState<InvestigatorAnnotation[]>([]);
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    flag: '',
    note: '',
    source: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    dateObserved: '2026-04-05',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCompany() {
      const numericId = Number(id);

      if (!numericId) {
        if (!cancelled) {
          setCompany(null);
          setIsLoading(false);
          setError('Invalid company ID.');
        }
        return;
      }

      const existing = companies.find((entry) => entry.id === numericId);
      if (existing) {
        if (!cancelled) {
          setCompany(existing);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await loadCompanyById(numericId);
        if (!cancelled) {
          setCompany(response);
          setError(response ? null : 'Company not found.');
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load company.');
          setCompany(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCompany();

    return () => {
      cancelled = true;
    };
  }, [companies, id, loadCompanyById]);

  const mockCompany = useMemo(() => (company ? findMockCompany(company) : null), [company]);
  const detailCompany = useMemo(() => (company ? buildDetailCompany(company, mockCompany) : null), [company, mockCompany]);

  useEffect(() => {
    if (!detailCompany) {
      setIsWatchlisted(false);
      setAnnotations([]);
      return;
    }

    setIsWatchlisted(detailCompany.isWatchlisted);
    setAnnotations(detailCompany.annotations);
  }, [detailCompany]);

  const { data, err, isLoading: isLoad } = useFetchData<AnalysisRecomendationAPIInterface>("/analysis/recommendation/AALI");

  const nextStepData: AnalysisRecomendationAPIInterface = data;

  if (isLoading || isLoad) {
    return (
      <div className="p-4 md:p-6">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <p style={{ color: 'var(--muted-foreground)' }}>Loading company detail...</p>
        </div>
      </div>
    );
  }

  if (error || !company || !detailCompany) {
    return (
      <div className="p-4 md:p-6">
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <Building2 size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>{error || 'Company not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center gap-2 caption"
            style={{ color: 'var(--accent)' }}
          >
            <ArrowLeft size={14} /> Back to Triage Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasMockEnrichment = mockCompany !== null;
  const tier = detailCompany.riskTier;
  const lastFY = detailCompany.financials.at(-1) ?? null;
  const etrGap = lastFY ? STATUTORY_RATE - lastFY.etr : 0;

  const etrChartData = detailCompany.financials.map((financial) => ({
    year: financial.year.toString(),
    ETR: parseFloat(financial.etr.toFixed(1)),
    'Statutory Rate': STATUTORY_RATE,
  }));

  const marginChartData = detailCompany.financials.map((financial) => ({
    year: financial.year.toString(),
    'Net Margin': parseFloat(financial.netMargin.toFixed(1)),
    'Sector Mean': detailCompany.sectorPeerMeanMargin,
  }));

  const rpPieData = detailCompany.rpJurisdictions.map((jurisdiction) => ({
    name: jurisdiction.name,
    value: jurisdiction.amount,
    isTaxHaven: jurisdiction.isTaxHaven,
    flag: jurisdiction.flag,
  }));

  const tabs = [
    { key: 'financial' as const, label: 'Financial Signals' },
    { key: 'ownership' as const, label: 'Ownership & Conduct' },
    { key: 'documentation' as const, label: 'Documentation' },
  ];

  const handleAddAnnotation = () => {
    if (!newAnnotation.flag.trim()) {
      return;
    }

    const annotation: InvestigatorAnnotation = {
      id: `ann-${Date.now()}`,
      ...newAnnotation,
      flag: newAnnotation.flag.trim(),
      note: newAnnotation.note.trim(),
      source: newAnnotation.source.trim(),
    };

    setAnnotations((current) => [annotation, ...current]);
    setNewAnnotation({
      flag: '',
      note: '',
      source: '',
      severity: 'medium',
      dateObserved: '2026-04-05',
    });
    setShowAddAnnotation(false);
  };

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div>
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2 caption"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Back to Triage Dashboard
        </button>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="flex items-start gap-4">
            <RiskGauge score={detailCompany.riskScore} size={88} />
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  style={{
                    fontFamily: 'var(--text-label-family)',
                    fontSize: 'var(--text-label-size)',
                    color: 'var(--accent)',
                    fontWeight: 500,
                  }}
                >
                  {detailCompany.ticker}
                </span>
                <RiskBadge tier={tier} />
                {detailCompany.taxHavenCount > 0 && (
                  <span
                    className="caption rounded px-2 py-0.5"
                    style={{
                      background: 'rgba(191,77,67,0.15)',
                      color: 'var(--destructive)',
                      border: '1px solid rgba(191,77,67,0.3)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {detailCompany.taxHavenCount} tax haven node{detailCompany.taxHavenCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h2-size)', color: 'var(--foreground)' }}>
                {detailCompany.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <span className="caption flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                  <Building2 size={11} /> {detailCompany.sector}
                </span>
                <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  NPWP: {detailCompany.npwp}
                </span>
                <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  Updated: {detailCompany.lastUpdated}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detailCompany.avoidanceMethods.length > 0 ? (
                  detailCompany.avoidanceMethods.map((method) => (
                    <span
                      key={method}
                      className="rounded px-2 py-0.5 caption"
                      style={{
                        background: 'rgba(32,127,222,0.1)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(32,127,222,0.25)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {getAvoidanceLabel(method)}
                    </span>
                  ))
                ) : (
                  company.methods.map((method) => (
                    <span
                      key={method}
                      className="rounded px-2 py-0.5 caption"
                      style={{
                        background: 'rgba(32,127,222,0.1)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(32,127,222,0.25)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {formatMethodLabel(method)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWatchlisted((current) => !current)}
              className="flex items-center gap-2 rounded px-3 py-2"
              style={{
                background: isWatchlisted ? 'rgba(170,83,46,0.15)' : 'var(--card)',
                border: `1px solid ${isWatchlisted ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                color: isWatchlisted ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <Star size={14} fill={isWatchlisted ? 'var(--primary)' : 'none'} />
              <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {detailCompany.alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {detailCompany.alerts.map((alert, index) => (
            <div
              key={`${alert}-${index}`}
              className="flex items-center gap-2 rounded px-3 py-2"
              style={{
                background: 'rgba(191,77,67,0.1)',
                border: '1px solid rgba(191,77,67,0.25)',
                borderRadius: 'var(--radius)',
                color: 'var(--destructive)',
              }}
            >
              <AlertTriangle size={13} />
              <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)' }}>{alert}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
          Risk Score Components
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Object.entries(detailCompany.signals).map(([key, value]) => {
            const color = value >= 70 ? 'var(--destructive)' : value >= 40 ? '#D4A017' : 'var(--accent)';
            const weight = SIGNAL_WEIGHTS[key] ?? 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="caption" style={{ color: 'var(--muted-foreground)', lineHeight: 1.3 }}>
                    {SIGNAL_LABELS[key]}
                  </span>
                  <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                    ×{weight / 100}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '22px', color, lineHeight: 1 }}>
                  {value}
                </div>
                <div className="h-1 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!hasMockEnrichment && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            background: 'rgba(32,127,222,0.08)',
            borderColor: 'rgba(32,127,222,0.22)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p className="caption" style={{ color: 'var(--muted-foreground)' }}>
            Historical charts, ownership mapping, and documentation sections are using empty states because no matching mock enrichment was found for this backend company yet.
          </p>
        </div>
      )}

      <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative px-4 py-2.5"
            style={{
              fontFamily: 'var(--text-p-family)',
              fontSize: 'var(--text-p-size)',
              color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'financial' && (
        <div className="space-y-4">
          {lastFY ? (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'ETR (Latest)',
                    value: `${lastFY.etr.toFixed(1)}%`,
                    sub: `${etrGap > 0 ? '-' : '+'}${Math.abs(etrGap).toFixed(1)}pp vs statutory 22%`,
                    alert: etrGap > 5,
                  },
                  {
                    label: 'Net Margin (Latest)',
                    value: `${lastFY.netMargin.toFixed(1)}%`,
                    sub: hasMockEnrichment
                      ? `Z-score: ${detailCompany.zScore.toFixed(1)} vs sector peers`
                      : 'Using fallback latest-period margin data',
                    alert: hasMockEnrichment && detailCompany.zScore < -2,
                  },
                  {
                    label: 'RP Payments (Latest)',
                    value: `IDR ${lastFY.rpPayments.toFixed(1)}T`,
                    sub: `${lastFY.revenue > 0 ? ((lastFY.rpPayments / lastFY.revenue) * 100).toFixed(0) : '0'}% of revenue`,
                    alert: lastFY.revenue > 0 && lastFY.rpPayments / lastFY.revenue > 0.3,
                  },
                  {
                    label: 'DE Ratio (Latest)',
                    value: lastFY.deRatio > 0 ? `${lastFY.deRatio.toFixed(1)}x` : 'Neg. equity',
                    sub: 'Safe harbor: 4:1',
                    alert: lastFY.deRatio > 4,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border p-4"
                    style={{
                      background: 'var(--card)',
                      borderColor: metric.alert ? 'rgba(191,77,67,0.4)' : 'var(--border)',
                      borderRadius: 'var(--radius-card)',
                    }}
                  >
                    <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
                      {metric.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--text-h2-family)',
                        fontSize: '20px',
                        color: metric.alert ? 'var(--destructive)' : 'var(--foreground)',
                        marginTop: '4px',
                      }}
                    >
                      {metric.value}
                    </div>
                    <div className="caption mt-1 flex items-center gap-1" style={{ color: metric.alert ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                      {metric.alert && <AlertTriangle size={10} />}
                      {metric.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div
                  className="rounded-xl border p-4"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
                >
                  <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '4px' }}>
                    F-08 · Effective Tax Rate vs Statutory Rate
                  </h4>
                  <p className="caption mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    5-year comparison (%). Gap {'>'} 10pp for 2+ years triggers flag.
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={etrChartData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} unit="%" domain={[0, 35]} />
                      <Tooltip
                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}
                        labelStyle={{ color: 'var(--foreground)', fontFamily: 'var(--text-p-family)' }}
                        itemStyle={{ color: 'var(--muted-foreground)' }}
                        formatter={(value: number) => [`${value}%`]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--text-caption-family)', color: 'var(--muted-foreground)' }} />
                      <Bar dataKey="ETR" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Statutory Rate" fill="var(--muted)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
                >
                  <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '4px' }}>
                    F-10 · Net Margin vs Sector Peers
                  </h4>
                  <p className="caption mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    Z-score:{' '}
                    <strong style={{ color: detailCompany.zScore < -2 ? 'var(--destructive)' : 'var(--foreground)' }}>
                      {detailCompany.zScore.toFixed(1)}
                    </strong>
                    {' '}· Sector mean: {detailCompany.sectorPeerMeanMargin}% ± {detailCompany.sectorPeerStdMargin}%
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={marginChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip
                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}
                        labelStyle={{ color: 'var(--foreground)', fontFamily: 'var(--text-p-family)' }}
                        formatter={(value: number) => [`${value}%`]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--text-caption-family)', color: 'var(--muted-foreground)' }} />
                      <Line dataKey="Net Margin" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: 'var(--chart-2)', r: 3 }} />
                      <Line dataKey="Sector Mean" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <div
                  className="rounded-xl border p-4 xl:col-span-2"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
                >
                  <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '4px' }}>
                    F-12 · RP Payments by Jurisdiction
                  </h4>
                  <p className="caption mb-3" style={{ color: 'var(--muted-foreground)' }}>
                    Red = tax haven jurisdiction
                  </p>
                  {rpPieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={rpPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                            {rpPieData.map((entry, index) => (
                              <Cell key={`${entry.name}-${index}`} fill={entry.isTaxHaven ? 'var(--destructive)' : PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}
                            formatter={(value: number, name: string) => [`IDR ${value}T`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-1 space-y-1">
                        {rpPieData.map((entry, index) => (
                          <div key={`${entry.name}-legend-${index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: entry.isTaxHaven ? 'var(--destructive)' : PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                              <span className="caption" style={{ color: entry.isTaxHaven ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                                {entry.flag} {entry.name}
                              </span>
                            </div>
                            <span className="caption" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                              IDR {entry.value}T
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-32 items-center justify-center caption" style={{ color: 'var(--muted-foreground)' }}>
                      No RP jurisdiction enrichment available
                    </div>
                  )}
                </div>

                <div
                  className="rounded-xl border p-4 xl:col-span-3"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
                >
                  <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                    F-09 · Multi-Year Financial Summary (IDR Trillion)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full caption" style={{ borderCollapse: 'collapse', color: 'var(--foreground)' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Metric', ...detailCompany.financials.map((financial) => financial.year)].map((header, index) => (
                            <th
                              key={`${header}-${index}`}
                              className="pb-2 pr-3 text-right caption"
                              style={{ color: 'var(--muted-foreground)', fontWeight: 500, textAlign: index === 0 ? 'left' : 'right' }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Revenue', key: 'revenue' as const },
                          { label: 'Net Profit', key: 'netProfit' as const },
                          { label: 'ETR (%)', key: 'etr' as const },
                          { label: 'Net Margin (%)', key: 'netMargin' as const },
                          { label: 'DE Ratio', key: 'deRatio' as const },
                          { label: 'RP Payments', key: 'rpPayments' as const },
                        ].map((row) => (
                          <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="py-1.5 pr-3 caption" style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>
                              {row.label}
                            </td>
                            {detailCompany.financials.map((financial) => {
                              const value = financial[row.key];
                              const isEtr = row.key === 'etr';
                              const isAlert = isEtr ? (value as number) < 20 : false;
                              return (
                                <td
                                  key={`${row.key}-${financial.year}`}
                                  className="py-1.5 pr-3 text-right"
                                  style={{ color: isAlert ? 'var(--destructive)' : 'var(--foreground)', fontWeight: isAlert ? 500 : 400 }}
                                >
                                  {row.key === 'etr' || row.key === 'netMargin'
                                    ? `${(value as number).toFixed(1)}%`
                                    : `${(value as number).toFixed(1)}`}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {detailCompany.impliedRPRate > 0 && detailCompany.biRate > 0 ? (
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: 'var(--card)',
                    borderColor: detailCompany.impliedRPRate > detailCompany.biRate * 2 ? 'rgba(191,77,67,0.4)' : 'var(--border)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '8px' }}>
                    F-13 · Implied RP Loan Interest Rate Calculator
                  </h4>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                    <div>
                      <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Implied RP Rate</div>
                      <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: detailCompany.impliedRPRate > detailCompany.biRate * 2 ? 'var(--destructive)' : 'var(--foreground)' }}>
                        {detailCompany.impliedRPRate}%
                      </div>
                    </div>
                    <div>
                      <div className="caption" style={{ color: 'var(--muted-foreground)' }}>BI Reference Rate</div>
                      <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: 'var(--foreground)' }}>
                        {detailCompany.biRate}%
                      </div>
                    </div>
                    <div>
                      <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Ratio</div>
                      <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: detailCompany.impliedRPRate > detailCompany.biRate * 2 ? 'var(--destructive)' : '#D4A017' }}>
                        {(detailCompany.impliedRPRate / detailCompany.biRate).toFixed(1)}x
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 rounded px-3 py-2"
                      style={{
                        background: detailCompany.impliedRPRate > detailCompany.biRate * 2 ? 'rgba(191,77,67,0.1)' : 'rgba(212,160,23,0.1)',
                        borderRadius: 'var(--radius)',
                        color: detailCompany.impliedRPRate > detailCompany.biRate * 2 ? 'var(--destructive)' : '#D4A017',
                      }}
                    >
                      {detailCompany.impliedRPRate > detailCompany.biRate * 2 ? (
                        <>
                          <AlertTriangle size={13} />
                          <span className="caption">Exceeds 2× BI rate threshold — debt shifting signal</span>
                        </>
                      ) : (
                        <>
                          <Info size={13} />
                          <span className="caption">Above BI rate but below 2× threshold</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyStateCard
                  title="F-13 · Implied RP Loan Interest Rate Calculator"
                  description="No mock enrichment is available for RP loan-rate analysis on this company."
                />
              )}
            </>
          ) : (
            <EmptyStateCard
              title="Financial Signals"
              description="No historical financial enrichment is available for this backend company yet."
            />
          )}
        </div>
      )}

      {activeTab === 'ownership' && (
        <div className="space-y-4">
          {detailCompany.ownershipNodes.length > 0 ? (
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
                    F-16 · Ownership Network Graph
                  </h3>
                  <p className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Built from the previous mock ownership dataset
                  </p>
                </div>
                {detailCompany.taxHavenCount > 0 && (
                  <div
                    className="flex items-center gap-2 rounded px-3 py-1.5"
                    style={{
                      background: 'rgba(191,77,67,0.12)',
                      border: '1px solid rgba(191,77,67,0.3)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--destructive)',
                    }}
                  >
                    <AlertTriangle size={13} />
                    <span className="caption">{detailCompany.taxHavenCount} tax haven node{detailCompany.taxHavenCount > 1 ? 's' : ''} detected</span>
                  </div>
                )}
              </div>
              <OwnershipGraph company={detailCompany} />
            </div>
          ) : (
            <EmptyStateCard
              title="F-16 · Ownership Network Graph"
              description="No historical/mock ownership enrichment is available for this company."
            />
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                F-17 · Tax Haven Jurisdiction Badges
              </h4>
              {detailCompany.ownershipNodes.filter((node) => node.isTaxHaven).length > 0 ? (
                <div className="space-y-2">
                  {detailCompany.ownershipNodes.filter((node) => node.isTaxHaven).map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between rounded p-2.5"
                      style={{ background: 'rgba(191,77,67,0.08)', border: '1px solid rgba(191,77,67,0.2)', borderRadius: 'var(--radius)' }}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--destructive)', fontWeight: 500 }}>
                          {node.name}
                        </div>
                        <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          <MapPin size={10} className="mr-1 inline" />
                          {node.jurisdiction} · {node.type}
                        </div>
                      </div>
                      <span
                        className="caption rounded px-2 py-1"
                        style={{ background: 'rgba(191,77,67,0.15)', color: 'var(--destructive)', borderRadius: 'var(--radius-sm)' }}
                      >
                        TAX HAVEN
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 caption" style={{ color: '#4CAF74' }}>
                  <CheckCircle size={13} /> No tax haven nodes detected
                </div>
              )}
            </div>

            <div
              className="rounded-xl border p-4"
              style={{
                background: 'var(--card)',
                borderColor: detailCompany.mysteryEntities.length > 0 ? 'rgba(191,77,67,0.3)' : 'var(--border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                F-14 · Flagged Mystery Entities
              </h4>
              {detailCompany.mysteryEntities.length > 0 ? (
                <div className="space-y-2">
                  {detailCompany.mysteryEntities.map((entity, index) => (
                    <div
                      key={`${entity.name}-${index}`}
                      className="rounded p-2.5"
                      style={{ background: 'rgba(191,77,67,0.08)', border: '1px solid rgba(191,77,67,0.2)', borderRadius: 'var(--radius)' }}
                    >
                      <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--destructive)', fontWeight: 500 }}>
                        {entity.name}
                      </div>
                      <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {entity.jurisdiction} · IDR {entity.rpAmount}T RP flow
                      </div>
                      <div className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        ⚠ {entity.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 caption" style={{ color: '#4CAF74' }}>
                  <CheckCircle size={13} /> No mystery entities detected — all RP counterparties accounted for
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
              F-20 · Prior Conduct Flags
            </h4>
            {detailCompany.priorConduct.length > 0 ? (
              <div className="space-y-3">
                {detailCompany.priorConduct.map((conduct, index) => {
                  const severityColor =
                    conduct.severity === 'high' ? 'var(--destructive)' : conduct.severity === 'medium' ? '#D4A017' : 'var(--accent)';
                  const typeLabel =
                    conduct.type === 'tax_dispute'
                      ? 'Tax Dispute'
                      : conduct.type === 'court_verdict'
                        ? 'Court Verdict'
                        : conduct.type === 'dtl_spike'
                          ? 'DTL Spike'
                          : 'Audit History';

                  return (
                    <div
                      key={`${conduct.description}-${index}`}
                      className="rounded p-3"
                      style={{
                        background: 'var(--input-background)',
                        border: `1px solid ${severityColor}33`,
                        borderLeft: `3px solid ${severityColor}`,
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="caption rounded px-2 py-0.5"
                            style={{ background: `${severityColor}15`, color: severityColor, borderRadius: 'var(--radius-sm)' }}
                          >
                            {typeLabel}
                          </span>
                          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{conduct.year}</span>
                        </div>
                        <span
                          className="caption rounded px-2 py-0.5"
                          style={{ background: `${severityColor}15`, color: severityColor, borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}
                        >
                          {conduct.severity}
                        </span>
                      </div>
                      <p className="mt-2" style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)' }}>
                        {conduct.description}
                      </p>
                      <div className="caption mt-1.5 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                        <FileText size={10} /> {conduct.source}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 caption" style={{ color: '#4CAF74' }}>
                <CheckCircle size={13} /> No prior conduct flags found in public records
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="space-y-4">
          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Shield size={14} style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                F-24 · AI-Generated Suspicion Summary
              </h4>
              <span
                className="ml-2 rounded px-2 py-0.5 caption"
                style={{
                  background: 'rgba(32,127,222,0.12)',
                  color: 'var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(32,127,222,0.25)',
                }}
              >
                Auto-generated · Public data only
              </span>
            </div>
            <p style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-p-size)', color: 'var(--foreground)', lineHeight: 1.7 }}>
              {detailCompany.aiSummary}
            </p>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
              F-25 · Recommended Next Actions
            </h4>
            <div className="space-y-2">
              {/* nyusahin ajg */}
              {data.recommendations.map((d, idx) => {
                const color =
                  d.status.includes('Critical')
                    ? 'var(--destructive)'
                    : d.status.includes('High')
                      ? '#D4A017'
                      : 'var(--accent)';

                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded"
                    style={{
                      background: 'var(--input-background)',
                      borderRadius: 'var(--radius)',
                      borderLeft: `3px solid ${color}`,
                    }}
                  >
                    <div className="mt-0.5">
                      <span
                        className="caption px-1.5 py-0.5 rounded"
                        style={{
                          background: `${color}15`,
                          color,
                          borderRadius: 'var(--radius-sm)',
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          fontWeight: 500,
                        }}
                      >
                        {d.status}
                      </span>
                    </div>

                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--text-p-family)',
                          fontSize: '13px',
                          color: 'var(--foreground)',
                          lineHeight: 1.5,
                        }}
                      >
                        {d.recommendation}
                      </p>

                      <div
                        className="caption mt-1 flex items-center gap-1"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <FileText size={10} /> {d.code} - {d.year}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                  F-23 · Investigator Annotations
                </h4>
                <p className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Private notes — visible only to you. Does not modify public risk score.
                </p>
              </div>
              <button
                onClick={() => setShowAddAnnotation((current) => !current)}
                className="flex items-center gap-2 rounded px-3 py-1.5"
                style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
              >
                <Plus size={13} />
                <span className="caption">Add Note</span>
              </button>
            </div>

            {showAddAnnotation && (
              <div
                className="mb-4 space-y-3 rounded p-3"
                style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <div>
                  <label className="mb-1 block caption" style={{ color: 'var(--muted-foreground)' }}>Flag / Title *</label>
                  <input
                    value={newAnnotation.flag}
                    onChange={(event) => setNewAnnotation((current) => ({ ...current, flag: event.target.value }))}
                    placeholder="e.g. DJP internal shows 3 prior audits"
                    className="w-full rounded px-3 py-2 outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block caption" style={{ color: 'var(--muted-foreground)' }}>Private Note</label>
                  <textarea
                    value={newAnnotation.note}
                    onChange={(event) => setNewAnnotation((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Detailed observation…"
                    rows={3}
                    className="w-full resize-none rounded px-3 py-2 outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block caption" style={{ color: 'var(--muted-foreground)' }}>Source</label>
                    <input
                      value={newAnnotation.source}
                      onChange={(event) => setNewAnnotation((current) => ({ ...current, source: event.target.value }))}
                      placeholder="e.g. DJP SIDJP, 2026-04-05"
                      className="w-full rounded px-3 py-2 outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block caption" style={{ color: 'var(--muted-foreground)' }}>Severity</label>
                    <select
                      value={newAnnotation.severity}
                      onChange={(event) => setNewAnnotation((current) => ({ ...current, severity: event.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full rounded px-3 py-2 outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block caption" style={{ color: 'var(--muted-foreground)' }}>Date Observed</label>
                    <input
                      type="date"
                      value={newAnnotation.dateObserved}
                      onChange={(event) => setNewAnnotation((current) => ({ ...current, dateObserved: event.target.value }))}
                      className="w-full rounded px-3 py-2 outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddAnnotation(false)}
                    className="rounded px-3 py-1.5 caption"
                    style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAnnotation}
                    className="rounded px-3 py-1.5 caption"
                    style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
                  >
                    Save Annotation
                  </button>
                </div>
              </div>
            )}

            {annotations.length > 0 ? (
              <div className="space-y-2">
                {annotations.map((annotation) => {
                  const severityColor =
                    annotation.severity === 'high'
                      ? 'var(--destructive)'
                      : annotation.severity === 'medium'
                        ? '#D4A017'
                        : 'var(--accent)';

                  return (
                    <div
                      key={annotation.id}
                      className="rounded p-3"
                      style={{
                        background: 'var(--input-background)',
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${severityColor}`,
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>
                          {annotation.flag}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{annotation.dateObserved}</span>
                          <span
                            className="rounded px-1.5 py-0.5 caption"
                            style={{ background: `${severityColor}15`, color: severityColor, borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}
                          >
                            {annotation.severity}
                          </span>
                        </div>
                      </div>
                      {annotation.note && (
                        <p className="mt-1.5" style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                          {annotation.note}
                        </p>
                      )}
                      {annotation.source && (
                        <div className="caption mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                          <FileText size={10} /> {annotation.source}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center caption" style={{ color: 'var(--muted-foreground)' }}>
                No private annotations yet. Add your first note above.
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div>
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                F-26 · PDF Investigation Report
              </h4>
              <p className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Generates Section A (public data) + Section B (your annotations). Watermarked for investigative use only.
              </p>
            </div>
            <button
              className="flex items-center gap-2 rounded px-4 py-2"
              style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
              onClick={() => window.alert('PDF generation is not connected to the backend in this environment.')}
            >
              <Download size={14} />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
