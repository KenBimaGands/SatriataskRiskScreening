import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Star,
  FileText,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Plus,
  Shield,
  TrendingDown,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { MOCK_COMPANIES, getRiskColor, getAvoidanceLabel, type InvestigatorAnnotation } from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { OwnershipGraph } from '../components/OwnershipGraph';

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

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = MOCK_COMPANIES.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<'financial' | 'ownership' | 'documentation'>('financial');
  const [isWatchlisted, setIsWatchlisted] = useState(company?.isWatchlisted ?? false);
  const [annotations, setAnnotations] = useState<InvestigatorAnnotation[]>(company?.annotations ?? []);
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ flag: '', note: '', source: '', severity: 'medium' as 'low' | 'medium' | 'high', dateObserved: '2026-03-23' });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--muted-foreground)' }}>
        <Building2 size={48} className="mb-4" />
        <p>Company not found</p>
        <button onClick={() => navigate('/')} className="mt-4" style={{ color: 'var(--accent)' }}>← Back to Dashboard</button>
      </div>
    );
  }

  const lastFY = company.financials.at(-1)!;
  const prevFY = company.financials.at(-2)!;
  const etrGap = STATUTORY_RATE - lastFY.etr;

  // Chart data
  const etrChartData = company.financials.map(f => ({
    year: f.year.toString(),
    ETR: parseFloat(f.etr.toFixed(1)),
    'Statutory Rate': STATUTORY_RATE,
  }));

  const marginChartData = company.financials.map(f => ({
    year: f.year.toString(),
    'Net Margin': parseFloat(f.netMargin.toFixed(1)),
    'Sector Mean': company.sectorPeerMeanMargin,
  }));

  const signalData = Object.entries(company.signals).map(([key, val]) => ({
    subject: SIGNAL_LABELS[key] ?? key,
    score: val,
    weight: SIGNAL_WEIGHTS[key] ?? 0,
  }));

  const rpPieData = company.rpJurisdictions.map(rp => ({
    name: rp.name,
    value: rp.amount,
    isTaxHaven: rp.isTaxHaven,
    flag: rp.flag,
  }));

  const PIE_COLORS = ['#207FDE', '#BF4D43', '#D97757', '#9B87F5', '#4CAF74'];

  const handleAddAnnotation = () => {
    if (!newAnnotation.flag) return;
    const ann: InvestigatorAnnotation = {
      id: `ann-${Date.now()}`,
      ...newAnnotation,
    };
    setAnnotations(prev => [ann, ...prev]);
    setNewAnnotation({ flag: '', note: '', source: '', severity: 'medium', dateObserved: '2026-03-23' });
    setShowAddAnnotation(false);
  };

  const tabs = [
    { key: 'financial' as const, label: 'Financial Signals' },
    { key: 'ownership' as const, label: 'Ownership & Conduct' },
    { key: 'documentation' as const, label: 'Documentation' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 caption"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Back to Triage Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <RiskGauge score={company.riskScore} size={88} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)', color: 'var(--accent)', fontWeight: 500 }}>
                  {company.ticker}
                </span>
                <RiskBadge tier={company.riskTier} />
                {company.taxHavenCount > 0 && (
                  <span
                    className="caption px-2 py-0.5 rounded"
                    style={{ background: 'rgba(191,77,67,0.15)', color: 'var(--destructive)', border: '1px solid rgba(191,77,67,0.3)', borderRadius: 'var(--radius-sm)' }}
                  >
                    {company.taxHavenCount} tax haven node{company.taxHavenCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h2-size)', color: 'var(--foreground)' }}>
                {company.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="caption flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                  <Building2 size={11} /> {company.sector}
                </span>
                <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  NPWP: {company.npwp}
                </span>
                <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                  Updated: {company.lastUpdated}
                </span>
              </div>
              {company.avoidanceMethods.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {company.avoidanceMethods.map(m => (
                    <span
                      key={m}
                      className="caption px-2 py-0.5 rounded"
                      style={{ background: 'rgba(32,127,222,0.1)', color: 'var(--accent)', border: '1px solid rgba(32,127,222,0.25)', borderRadius: 'var(--radius-sm)' }}
                    >
                      {getAvoidanceLabel(m)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWatchlisted(w => !w)}
              className="flex items-center gap-2 px-3 py-2 rounded"
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

      {/* Alerts */}
      {company.alerts.length > 0 && (
        <div className="flex gap-2">
          {company.alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded"
              style={{ background: 'rgba(191,77,67,0.1)', border: '1px solid rgba(191,77,67,0.25)', borderRadius: 'var(--radius)', color: 'var(--destructive)' }}
            >
              <AlertTriangle size={13} />
              <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)' }}>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Signal Score Breakdown */}
      <div
        className="p-4 rounded-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
      >
        <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
          Risk Score Components
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {Object.entries(company.signals).map(([key, val]) => {
            const color = val >= 70 ? 'var(--destructive)' : val >= 40 ? '#D4A017' : 'var(--accent)';
            const weight = SIGNAL_WEIGHTS[key] ?? 0;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="caption" style={{ color: 'var(--muted-foreground)', lineHeight: 1.3 }}>
                    {SIGNAL_LABELS[key]}
                  </span>
                  <span className="caption" style={{ color: 'var(--muted-foreground)' }}>×{weight / 100}</span>
                </div>
                <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '22px', color, lineHeight: 1 }}>
                  {val}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2.5 relative"
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

      {/* Tab Content */}
      {activeTab === 'financial' && (
        <div className="space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'ETR (2023)', value: `${lastFY.etr.toFixed(1)}%`, sub: `${etrGap > 0 ? '-' : '+'}${Math.abs(etrGap).toFixed(1)}pp vs statutory 22%`, alert: etrGap > 5 },
              { label: 'Net Margin (2023)', value: `${lastFY.netMargin.toFixed(1)}%`, sub: `Z-score: ${company.zScore.toFixed(1)} vs sector peers`, alert: company.zScore < -2 },
              { label: 'RP Payments (2023)', value: `IDR ${lastFY.rpPayments.toFixed(1)}T`, sub: `${((lastFY.rpPayments / lastFY.revenue) * 100).toFixed(0)}% of revenue`, alert: lastFY.rpPayments / lastFY.revenue > 0.3 },
              { label: 'DE Ratio (2023)', value: lastFY.deRatio > 0 ? `${lastFY.deRatio.toFixed(1)}x` : 'Neg. equity', sub: 'Safe harbor: 4:1', alert: lastFY.deRatio > 4 },
            ].map(m => (
              <div
                key={m.label}
                className="p-4 rounded-xl border"
                style={{
                  background: 'var(--card)',
                  borderColor: m.alert ? 'rgba(191,77,67,0.4)' : 'var(--border)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <div className="caption" style={{ color: 'var(--muted-foreground)' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '20px', color: m.alert ? 'var(--destructive)' : 'var(--foreground)', marginTop: '4px' }}>
                  {m.value}
                </div>
                <div className="caption mt-1 flex items-center gap-1" style={{ color: m.alert ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                  {m.alert && <AlertTriangle size={10} />}
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ETR Chart */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-xl border"
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
                    formatter={(v: number) => [`${v}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--text-caption-family)', color: 'var(--muted-foreground)' }} />
                  <Bar dataKey="ETR" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Statutory Rate" fill="var(--muted)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Net Margin Chart */}
            <div
              className="p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '4px' }}>
                F-10 · Net Margin vs Sector Peers
              </h4>
              <p className="caption mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Z-score: <strong style={{ color: company.zScore < -2 ? 'var(--destructive)' : 'var(--foreground)' }}>{company.zScore.toFixed(1)}</strong>
                {' '}· Sector mean: {company.sectorPeerMeanMargin}% ± {company.sectorPeerStdMargin}%
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={marginChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--text-caption-family)' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}
                    labelStyle={{ color: 'var(--foreground)', fontFamily: 'var(--text-p-family)' }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--text-caption-family)', color: 'var(--muted-foreground)' }} />
                  <Line dataKey="Net Margin" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: 'var(--chart-2)', r: 3 }} />
                  <Line dataKey="Sector Mean" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RP Breakdown + Financial Table */}
          <div className="grid grid-cols-5 gap-4">
            {/* RP Donut */}
            <div
              className="col-span-2 p-4 rounded-xl border"
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
                        {rpPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.isTaxHaven ? 'var(--destructive)' : PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12 }}
                        formatter={(v: number, name: string) => [`IDR ${v}T`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-1">
                    {rpPieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: d.isTaxHaven ? 'var(--destructive)' : PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="caption" style={{ color: d.isTaxHaven ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
                            {d.flag} {d.name}
                          </span>
                        </div>
                        <span className="caption" style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                          IDR {d.value}T
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-32 caption" style={{ color: 'var(--muted-foreground)' }}>
                  No RP data available
                </div>
              )}
            </div>

            {/* F-09 Financial Table */}
            <div
              className="col-span-3 p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                F-09 · Multi-Year Financial Summary (IDR Trillion)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full caption" style={{ borderCollapse: 'collapse', color: 'var(--foreground)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Metric', ...company.financials.map(f => f.year)].map((h, i) => (
                        <th key={i} className="text-right pb-2 pr-3 caption" style={{ color: 'var(--muted-foreground)', fontWeight: 500, textAlign: i === 0 ? 'left' : 'right' }}>
                          {h}
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
                    ].map(row => (
                      <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-1.5 pr-3 caption" style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{row.label}</td>
                        {company.financials.map(f => {
                          const val = f[row.key];
                          const isEtr = row.key === 'etr';
                          const isAlert = isEtr ? (val as number) < 20 : false;
                          return (
                            <td
                              key={f.year}
                              className="py-1.5 pr-3 text-right"
                              style={{
                                color: isAlert ? 'var(--destructive)' : 'var(--foreground)',
                                fontWeight: isAlert ? 500 : 400,
                              }}
                            >
                              {row.key === 'etr' || row.key === 'netMargin' ? `${(val as number).toFixed(1)}%` : row.key === 'deRatio' ? (val as number).toFixed(1) : (val as number).toFixed(1)}
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

          {/* F-13 RP Interest Rate Calculator */}
          {company.impliedRPRate > 0 && (
            <div
              className="p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: company.impliedRPRate > company.biRate * 2 ? 'rgba(191,77,67,0.4)' : 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '8px' }}>
                F-13 · Implied RP Loan Interest Rate Calculator
              </h4>
              <div className="flex items-center gap-8">
                <div>
                  <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Implied RP Rate</div>
                  <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: company.impliedRPRate > company.biRate * 2 ? 'var(--destructive)' : 'var(--foreground)' }}>
                    {company.impliedRPRate}%
                  </div>
                </div>
                <div>
                  <div className="caption" style={{ color: 'var(--muted-foreground)' }}>BI Reference Rate</div>
                  <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: 'var(--foreground)' }}>
                    {company.biRate}%
                  </div>
                </div>
                <div>
                  <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Ratio</div>
                  <div style={{ fontFamily: 'var(--text-h2-family)', fontSize: '24px', color: company.impliedRPRate > company.biRate * 2 ? 'var(--destructive)' : '#D4A017' }}>
                    {(company.impliedRPRate / company.biRate).toFixed(1)}x
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded"
                  style={{
                    background: company.impliedRPRate > company.biRate * 2 ? 'rgba(191,77,67,0.1)' : 'rgba(212,160,23,0.1)',
                    borderRadius: 'var(--radius)',
                    color: company.impliedRPRate > company.biRate * 2 ? 'var(--destructive)' : '#D4A017',
                  }}
                >
                  {company.impliedRPRate > company.biRate * 2 ? (
                    <><AlertTriangle size={13} /> <span className="caption">Exceeds 2× BI rate threshold — debt shifting signal</span></>
                  ) : (
                    <><Info size={13} /> <span className="caption">Above BI rate but below 2× threshold</span></>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ownership' && (
        <div className="space-y-4">
          {/* Ownership Graph */}
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
                  F-16 · Ownership Network Graph
                </h3>
                <p className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Built from IDX annual reports + OpenCorporates + ACRA
                </p>
              </div>
              {company.taxHavenCount > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded"
                  style={{ background: 'rgba(191,77,67,0.12)', border: '1px solid rgba(191,77,67,0.3)', borderRadius: 'var(--radius)', color: 'var(--destructive)' }}
                >
                  <AlertTriangle size={13} />
                  <span className="caption">{company.taxHavenCount} tax haven node{company.taxHavenCount > 1 ? 's' : ''} detected</span>
                </div>
              )}
            </div>
            <OwnershipGraph company={company} />
          </div>

          {/* F-17 Tax Haven + F-14 Mystery Entities */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                F-17 · Tax Haven Jurisdiction Badges
              </h4>
              {company.ownershipNodes.filter(n => n.isTaxHaven).length > 0 ? (
                <div className="space-y-2">
                  {company.ownershipNodes.filter(n => n.isTaxHaven).map(node => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2.5 rounded"
                      style={{ background: 'rgba(191,77,67,0.08)', border: '1px solid rgba(191,77,67,0.2)', borderRadius: 'var(--radius)' }}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--destructive)', fontWeight: 500 }}>
                          {node.name}
                        </div>
                        <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          <MapPin size={10} className="inline mr-1" />{node.jurisdiction} · {node.type}
                        </div>
                      </div>
                      <span
                        className="caption px-2 py-1 rounded"
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
              className="p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: company.mysteryEntities.length > 0 ? 'rgba(191,77,67,0.3)' : 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
                F-14 · Flagged Mystery Entities
              </h4>
              {company.mysteryEntities.length > 0 ? (
                <div className="space-y-2">
                  {company.mysteryEntities.map((entity, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded"
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

          {/* F-20 Prior Conduct */}
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
              F-20 · Prior Conduct Flags
            </h4>
            {company.priorConduct.length > 0 ? (
              <div className="space-y-3">
                {company.priorConduct.map((conduct, i) => {
                  const severityColor = conduct.severity === 'high' ? 'var(--destructive)' : conduct.severity === 'medium' ? '#D4A017' : 'var(--accent)';
                  const typeLabel = conduct.type === 'tax_dispute' ? 'Tax Dispute' : conduct.type === 'court_verdict' ? 'Court Verdict' : conduct.type === 'dtl_spike' ? 'DTL Spike' : 'Audit History';
                  return (
                    <div
                      key={i}
                      className="p-3 rounded"
                      style={{
                        background: 'var(--input-background)',
                        border: `1px solid ${severityColor}33`,
                        borderLeft: `3px solid ${severityColor}`,
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="caption px-2 py-0.5 rounded"
                            style={{ background: `${severityColor}15`, color: severityColor, borderRadius: 'var(--radius-sm)' }}
                          >
                            {typeLabel}
                          </span>
                          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{conduct.year}</span>
                        </div>
                        <span
                          className="caption px-2 py-0.5 rounded"
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
          {/* F-24 AI Summary */}
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                F-24 · AI-Generated Suspicion Summary
              </h4>
              <span
                className="caption px-2 py-0.5 rounded ml-2"
                style={{ background: 'rgba(32,127,222,0.12)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(32,127,222,0.25)' }}
              >
                Auto-generated · Public data only
              </span>
            </div>
            <p style={{ fontFamily: 'var(--text-p-family)', fontSize: 'var(--text-p-size)', color: 'var(--foreground)', lineHeight: 1.7 }}>
              {company.aiSummary}
            </p>
          </div>

          {/* F-25 Recommended Actions */}
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)', marginBottom: '12px' }}>
              F-25 · Recommended Next Actions
            </h4>
            <div className="space-y-2">
              {[
                company.riskScore >= 81 && {
                  action: 'Escalate to formal audit referral under PMK-213/PMK.03/2016 (Transfer Pricing Documentation)',
                  urgency: 'critical',
                  ref: 'PMK-213/PMK.03/2016, Pasal 8',
                },
                company.impliedRPRate > company.biRate * 2 && {
                  action: 'Issue information request (SP2) for RP loan documentation — verify arm\'s length interest rate against comparable uncontrolled transactions',
                  urgency: 'high',
                  ref: 'PMK-213/PMK.03/2016, Pasal 12',
                },
                company.taxHavenCount > 0 && {
                  action: 'File MLAT (Mutual Legal Assistance Treaty) request for beneficial ownership disclosure of identified tax haven entities',
                  urgency: 'high',
                  ref: 'UU No.1/2006 tentang MLAT',
                },
                company.mysteryEntities.length > 0 && {
                  action: 'Cross-reference mystery entities with ICIJ Offshore Leaks database and OCCRP Aleph for leaked document matches',
                  urgency: 'medium',
                  ref: 'Internal procedure SOP-TP-04',
                },
                {
                  action: 'Request 5-year Master File and Local File documentation package under PMK-213 Article 8 provisions',
                  urgency: 'medium',
                  ref: 'PMK-213/PMK.03/2016, Pasal 8',
                },
              ].filter(Boolean).map((item: any, i) => {
                const color = item.urgency === 'critical' ? 'var(--destructive)' : item.urgency === 'high' ? '#D4A017' : 'var(--accent)';
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded"
                    style={{ background: 'var(--input-background)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${color}` }}
                  >
                    <div className="mt-0.5">
                      <span
                        className="caption px-1.5 py-0.5 rounded"
                        style={{ background: `${color}15`, color, borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}
                      >
                        {item.urgency}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5 }}>
                        {item.action}
                      </p>
                      <div className="caption mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                        <FileText size={10} /> {item.ref}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* F-23 Investigator Annotations */}
          <div
            className="p-4 rounded-xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                  F-23 · Investigator Annotations
                </h4>
                <p className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Private notes — visible only to you. Does not modify public risk score.
                </p>
              </div>
              <button
                onClick={() => setShowAddAnnotation(a => !a)}
                className="flex items-center gap-2 px-3 py-1.5 rounded"
                style={{
                  background: 'var(--primary)',
                  borderRadius: 'var(--radius)',
                  color: 'white',
                }}
              >
                <Plus size={13} />
                <span className="caption">Add Note</span>
              </button>
            </div>

            {showAddAnnotation && (
              <div
                className="mb-4 p-3 rounded space-y-3"
                style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <div>
                  <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Flag / Title *</label>
                  <input
                    value={newAnnotation.flag}
                    onChange={e => setNewAnnotation(a => ({ ...a, flag: e.target.value }))}
                    placeholder="e.g. DJP internal shows 3 prior audits"
                    className="w-full px-3 py-2 rounded outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Private Note</label>
                  <textarea
                    value={newAnnotation.note}
                    onChange={e => setNewAnnotation(a => ({ ...a, note: e.target.value }))}
                    placeholder="Detailed observation…"
                    rows={3}
                    className="w-full px-3 py-2 rounded outline-none resize-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Source</label>
                    <input
                      value={newAnnotation.source}
                      onChange={e => setNewAnnotation(a => ({ ...a, source: e.target.value }))}
                      placeholder="e.g. DJP SIDJP, 2026-03-23"
                      className="w-full px-3 py-2 rounded outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div>
                    <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Severity</label>
                    <select
                      value={newAnnotation.severity}
                      onChange={e => setNewAnnotation(a => ({ ...a, severity: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Date Observed</label>
                    <input
                      type="date"
                      value={newAnnotation.dateObserved}
                      onChange={e => setNewAnnotation(a => ({ ...a, dateObserved: e.target.value }))}
                      className="w-full px-3 py-2 rounded outline-none"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddAnnotation(false)}
                    className="caption px-3 py-1.5 rounded"
                    style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAnnotation}
                    className="caption px-3 py-1.5 rounded"
                    style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
                  >
                    Save Annotation
                  </button>
                </div>
              </div>
            )}

            {annotations.length > 0 ? (
              <div className="space-y-2">
                {annotations.map(ann => {
                  const sColor = ann.severity === 'high' ? 'var(--destructive)' : ann.severity === 'medium' ? '#D4A017' : 'var(--accent)';
                  return (
                    <div
                      key={ann.id}
                      className="p-3 rounded"
                      style={{ background: 'var(--input-background)', border: `1px solid var(--border)`, borderLeft: `3px solid ${sColor}`, borderRadius: 'var(--radius)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>
                          {ann.flag}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{ann.dateObserved}</span>
                          <span className="caption px-1.5 py-0.5 rounded" style={{ background: `${sColor}15`, color: sColor, borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                            {ann.severity}
                          </span>
                        </div>
                      </div>
                      {ann.note && (
                        <p className="mt-1.5" style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                          {ann.note}
                        </p>
                      )}
                      {ann.source && (
                        <div className="caption mt-1 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                          <FileText size={10} /> {ann.source}
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

          {/* F-26 PDF Export */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
          >
            <div>
              <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
                F-26 · PDF Investigation Report
              </h4>
              <p className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Generates Section A (public data) + Section B (your annotations). Watermarked: "Preliminary — For Investigative Use Only."
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded"
              style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
              onClick={() => alert('PDF generation would invoke Puppeteer/WeasyPrint server-side in production.')}
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
