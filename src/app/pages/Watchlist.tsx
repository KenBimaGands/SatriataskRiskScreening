import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Star, ArrowUpRight, FileText, Trash2, FolderPlus } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_COLLECTIONS, getRiskColor } from '../data/mockData';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';

export function Watchlist() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_COMPANIES.filter(c => c.isWatchlisted).map(c => [c.id, c.watchlistNote]))
  );
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const watchlisted = MOCK_COMPANIES.filter(c => c.isWatchlisted);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)' }}>
            Watchlist
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            {watchlisted.length} companies under active monitoring · Private to Budi Santoso
          </p>
        </div>
      </div>

      {watchlisted.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <Star size={36} style={{ color: 'var(--muted-foreground)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>No companies watchlisted yet</p>
          <p className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Star a company from the Triage Dashboard or company detail page
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlisted.map(company => {
            const lastFY = company.financials.at(-1)!;
            const isEditing = editingNote === company.id;
            return (
              <div
                key={company.id}
                className="p-4 rounded-xl border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
              >
                <div className="flex items-start gap-4">
                  <RiskGauge score={company.riskScore} size={72} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={12} fill="var(--primary)" color="var(--primary)" />
                          <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)', color: 'var(--accent)', fontWeight: 500 }}>
                            {company.ticker}
                          </span>
                          <RiskBadge tier={company.riskTier} size="sm" />
                        </div>
                        <button
                          onClick={() => navigate(`/company/${company.id}`)}
                          style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', textAlign: 'left' }}
                          className="hover:underline"
                        >
                          {company.name}
                        </button>
                        <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          {company.sector} · ETR: {lastFY.etr.toFixed(1)}% · Risk score: {company.riskScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/company/${company.id}`)}
                          className="flex items-center gap-1.5 caption px-3 py-1.5 rounded"
                          style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
                        >
                          <ArrowUpRight size={12} /> View detail
                        </button>
                      </div>
                    </div>

                    {/* Key signals row */}
                    <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      {[
                        { label: 'ETR', val: `${lastFY.etr.toFixed(1)}%`, alert: lastFY.etr < 15 },
                        { label: 'DE Ratio', val: `${lastFY.deRatio.toFixed(1)}x`, alert: lastFY.deRatio > 4 },
                        { label: 'Tax Havens', val: `${company.taxHavenCount}`, alert: company.taxHavenCount > 0 },
                        { label: 'RP Payments', val: `IDR ${lastFY.rpPayments.toFixed(1)}T`, alert: false },
                        { label: 'Prior Conduct', val: `${company.priorConduct.length} flag${company.priorConduct.length !== 1 ? 's' : ''}`, alert: company.priorConduct.length > 0 },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="caption" style={{ color: 'var(--muted-foreground)' }}>{m.label}</div>
                          <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: m.alert ? 'var(--destructive)' : 'var(--foreground)', fontWeight: m.alert ? 500 : 400 }}>
                            {m.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    <div className="mt-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={notes[company.id] ?? ''}
                            onChange={e => setNotes(n => ({ ...n, [company.id]: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 rounded outline-none resize-none caption"
                            style={{ background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--foreground)' }}
                            placeholder="Add private note…"
                          />
                          <button
                            onClick={() => setEditingNote(null)}
                            className="caption px-3 py-1 rounded"
                            style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
                          >
                            Save note
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNote(company.id)}
                          className="flex items-start gap-2 w-full text-left"
                        >
                          {notes[company.id] ? (
                            <div
                              className="w-full px-3 py-2 rounded caption"
                              style={{ background: 'var(--input-background)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                            >
                              <FileText size={10} className="inline mr-1.5" />
                              {notes[company.id]}
                            </div>
                          ) : (
                            <span className="caption" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                              + Add private note…
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Collections this company belongs to */}
                    {MOCK_COLLECTIONS.filter(col => col.companyIds.includes(company.id)).length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="caption" style={{ color: 'var(--muted-foreground)' }}>In:</span>
                        {MOCK_COLLECTIONS.filter(col => col.companyIds.includes(company.id)).map(col => (
                          <span
                            key={col.id}
                            className="caption px-2 py-0.5 rounded"
                            style={{ background: `${col.color}15`, color: col.color, border: `1px solid ${col.color}33`, borderRadius: 'var(--radius-sm)' }}
                          >
                            {col.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
