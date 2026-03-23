import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FolderOpen, Plus, Archive, ArrowUpRight, BarChart2, AlertTriangle } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_COLLECTIONS, getRiskColor, type RiskTier } from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';

const COLLECTION_COLORS = ['#BF4D43', '#D97757', '#207FDE', '#9B87F5', '#4CAF74', '#D4A017'];

export function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  const [showCreate, setShowCreate] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', description: '', color: COLLECTION_COLORS[0] });
  const [expandedCol, setExpandedCol] = useState<string | null>(collections[0]?.id ?? null);

  const handleCreate = () => {
    if (!newCol.name) return;
    setCollections(prev => [...prev, {
      id: `col-${Date.now()}`,
      name: newCol.name,
      description: newCol.description,
      color: newCol.color,
      status: 'active',
      companyIds: [],
      createdAt: '2026-03-23',
    }]);
    setNewCol({ name: '', description: '', color: COLLECTION_COLORS[0] });
    setShowCreate(false);
  };

  const handleArchive = (id: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' as const } : c));
  };

  const active = collections.filter(c => c.status === 'active');
  const archived = collections.filter(c => c.status === 'archived');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)' }}>
            Collections
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Named case folders for organizing watchlist companies into investigation batches
          </p>
        </div>
        <button
          onClick={() => setShowCreate(s => !s)}
          className="flex items-center gap-2 px-3 py-2 rounded"
          style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
        >
          <Plus size={14} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div
          className="p-4 rounded-xl border space-y-3"
          style={{ background: 'var(--card)', borderColor: 'var(--accent)', borderRadius: 'var(--radius-card)' }}
        >
          <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
            Create New Collection
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Collection Name *</label>
              <input
                value={newCol.name}
                onChange={e => setNewCol(n => ({ ...n, name: e.target.value }))}
                placeholder="e.g. Q2 2026 Priority Cases"
                className="w-full px-3 py-2 rounded outline-none"
                style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="caption block mb-1" style={{ color: 'var(--muted-foreground)' }}>Description</label>
              <input
                value={newCol.description}
                onChange={e => setNewCol(n => ({ ...n, description: e.target.value }))}
                placeholder="Optional context note"
                className="w-full px-3 py-2 rounded outline-none"
                style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div>
            <label className="caption block mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Color Label</label>
            <div className="flex gap-2">
              {COLLECTION_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCol(n => ({ ...n, color }))}
                  className="w-7 h-7 rounded-full transition-transform"
                  style={{
                    background: color,
                    transform: newCol.color === color ? 'scale(1.2)' : 'scale(1)',
                    outline: newCol.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="caption px-3 py-1.5 rounded"
              style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="caption px-3 py-1.5 rounded"
              style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
            >
              Create Collection
            </button>
          </div>
        </div>
      )}

      {/* Active Collections */}
      <div className="space-y-3">
        <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
          Active Collections ({active.length})
        </h3>
        {active.map(col => {
          const companies = MOCK_COMPANIES.filter(c => col.companyIds.includes(c.id));
          const avgScore = companies.length > 0 ? Math.round(companies.reduce((s, c) => s + c.riskScore, 0) / companies.length) : 0;
          const topRisk = companies.sort((a, b) => b.riskScore - a.riskScore)[0];
          const totalFlags = companies.reduce((s, c) => s + c.priorConduct.length + c.alerts.length, 0);
          const isExpanded = expandedCol === col.id;

          return (
            <div
              key={col.id}
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
            >
              {/* Collection Header */}
              <button
                onClick={() => setExpandedCol(isExpanded ? null : col.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: col.color }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)' }}>
                      {col.name}
                    </div>
                    {col.description && (
                      <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {col.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="flex items-center gap-6 mr-4">
                  <div className="text-right">
                    <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Companies</div>
                    <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '15px', color: 'var(--foreground)', fontWeight: 500 }}>
                      {companies.length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Avg Risk</div>
                    <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '15px', color: getRiskColor(avgScore >= 81 ? 'critical' : avgScore >= 61 ? 'high' : avgScore >= 31 ? 'medium' : 'low'), fontWeight: 500 }}>
                      {avgScore || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Total Flags</div>
                    <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '15px', color: totalFlags > 0 ? 'var(--destructive)' : 'var(--foreground)', fontWeight: 500 }}>
                      {totalFlags}
                    </div>
                  </div>
                  {topRisk && (
                    <div className="text-right">
                      <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Highest Risk</div>
                      <div className="caption" style={{ color: getRiskColor(topRisk.riskTier), fontWeight: 500 }}>
                        {topRisk.ticker} ({topRisk.riskScore})
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded company list */}
              {isExpanded && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  {companies.length === 0 ? (
                    <div className="py-8 text-center caption" style={{ color: 'var(--muted-foreground)' }}>
                      No companies in this collection yet. Add companies from their detail pages.
                    </div>
                  ) : (
                    <>
                      {companies.map((company, idx) => {
                        const lastFY = company.financials.at(-1)!;
                        return (
                          <div
                            key={company.id}
                            className="flex items-center gap-4 px-4 py-3 border-b"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <span className="caption w-5 text-center" style={{ color: 'var(--muted-foreground)' }}>
                              {idx + 1}
                            </span>
                            <div
                              className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                              style={{ background: `${getRiskColor(company.riskTier)}22`, border: `1px solid ${getRiskColor(company.riskTier)}44`, borderRadius: 'var(--radius)' }}
                            >
                              <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: getRiskColor(company.riskTier), fontWeight: 500 }}>
                                {company.riskScore}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: 'var(--foreground)', fontWeight: 500 }}>
                                  {company.ticker}
                                </span>
                                <RiskBadge tier={company.riskTier} size="sm" />
                              </div>
                              <div className="caption truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {company.name} · {company.sector}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div>
                                <div className="caption" style={{ color: 'var(--muted-foreground)' }}>ETR</div>
                                <div className="caption" style={{ color: lastFY.etr < 15 ? 'var(--destructive)' : 'var(--foreground)', fontWeight: 500 }}>
                                  {lastFY.etr.toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="caption" style={{ color: 'var(--muted-foreground)' }}>Tax Havens</div>
                                <div className="caption" style={{ color: company.taxHavenCount > 0 ? 'var(--destructive)' : 'var(--muted-foreground)', fontWeight: company.taxHavenCount > 0 ? 500 : 400 }}>
                                  {company.taxHavenCount}
                                </div>
                              </div>
                              {company.alerts.length > 0 && (
                                <div className="flex items-center gap-1 caption" style={{ color: 'var(--destructive)' }}>
                                  <AlertTriangle size={11} />
                                  {company.alerts.length} alert{company.alerts.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/company/${company.id}`)}
                              className="flex items-center gap-1.5 caption px-3 py-1.5 rounded"
                              style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                            >
                              <ArrowUpRight size={12} /> View
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Collection actions */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-1.5 caption px-3 py-1.5 rounded"
                        style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                        onClick={() => alert('Batch PDF would generate a single report covering all companies in this collection.')}
                      >
                        <BarChart2 size={12} /> Export Batch PDF
                      </button>
                    </div>
                    <button
                      onClick={() => handleArchive(col.id)}
                      className="flex items-center gap-1.5 caption px-3 py-1.5 rounded"
                      style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                    >
                      <Archive size={12} /> Archive Collection
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Archived Collections */}
      {archived.length > 0 && (
        <div className="space-y-3">
          <h3 style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--muted-foreground)' }}>
            Archived ({archived.length})
          </h3>
          {archived.map(col => (
            <div
              key={col.id}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)', opacity: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <Archive size={14} style={{ color: 'var(--muted-foreground)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                    {col.name}
                  </div>
                  <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
                    Archived · Created {col.createdAt}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCollections(prev => prev.map(c => c.id === col.id ? { ...c, status: 'active' as const } : c))}
                className="caption px-3 py-1.5 rounded"
                style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
