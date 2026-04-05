import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowUpRight, FolderPlus, RefreshCcw, ShieldAlert, Star } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { useAuth } from '../auth/AuthContext';
import { useBookmarks } from '../bookmarks/BookmarksContext';
import { getRiskColor } from '../data/mockData';
import {
  formatMethodLabel,
  getAllCompanyCollections,
  normalizeCompanyRiskTier,
  type CompanyCollection,
} from '../lib/companyCollections';

function dedupeCompanies(companies: CompanyCollection[]) {
  const byId = new Map<number, CompanyCollection>();
  companies.forEach((company) => {
    byId.set(company.id, company);
  });
  return [...byId.values()].sort((left, right) => right.riskScore - left.riskScore);
}

function formatCollectionNames(names: string[]) {
  if (names.length === 0) {
    return '';
  }

  return names.join(', ');
}

export function Watchlist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, logout } = useAuth();
  const { bookmarks, createNewBookmark, isCreating, error: bookmarkError } = useBookmarks();
  const [watchlist, setWatchlist] = useState<CompanyCollection[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(searchParams.get('createCollection') === '1');
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadWatchlist() {
    if (!token) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [criticalResponse, highResponse] = await Promise.all([
        getAllCompanyCollections(token, { riskTier: 'Critical' }),
        getAllCompanyCollections(token, { riskTier: 'High' }),
      ]);

      setWatchlist(dedupeCompanies([...criticalResponse.data, ...highResponse.data]));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to load watchlist.';
      const status =
        typeof caughtError === 'object' && caughtError !== null && 'status' in caughtError
          ? Number(caughtError.status)
          : undefined;

      if (status === 401) {
        logout();
        return;
      }

      setError(message);
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setShowCreateForm(searchParams.get('createCollection') === '1');
  }, [searchParams]);

  useEffect(() => {
    void loadWatchlist();
  }, [logout, token]);

  const bookmarkMembership = useMemo(() => {
    const memberships = new Map<number, string[]>();

    bookmarks.forEach((bookmark) => {
      bookmark.companies.forEach((company) => {
        const current = memberships.get(company.companyId) ?? [];
        current.push(bookmark.name);
        memberships.set(company.companyId, current);
      });
    });

    return memberships;
  }, [bookmarks]);

  function updateCreateQueryParam(enabled: boolean) {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (enabled) {
      nextSearchParams.set('createCollection', '1');
    } else {
      nextSearchParams.delete('createCollection');
    }
    setSearchParams(nextSearchParams, { replace: true });
  }

  function toggleSelected(companyId: number) {
    setSelectedCompanyIds((current) =>
      current.includes(companyId)
        ? current.filter((id) => id !== companyId)
        : [...current, companyId],
    );
  }

  async function handleCreateCollection() {
    if (!newCollection.name.trim() || selectedCompanyIds.length === 0) {
      return;
    }

    try {
      const created = await createNewBookmark({
        name: newCollection.name.trim(),
        description: newCollection.description.trim() || undefined,
        companyIds: selectedCompanyIds,
        status: 'Active',
      });

      if (!created) {
        return;
      }

      setNewCollection({ name: '', description: '' });
      setSelectedCompanyIds([]);
      updateCreateQueryParam(false);
    } catch {
      // error state is handled in bookmark context and surfaced by the form banner
    }
  }

  const allSelected = watchlist.length > 0 && selectedCompanyIds.length === watchlist.length;

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 style={{ fontFamily: 'var(--text-h1-family)', fontSize: 'var(--text-h1-size)', color: 'var(--foreground)' }}>
            Watchlist
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            {watchlist.length} companies under active monitoring from Critical and High backend risk tiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateCreateQueryParam(true)}
            className="flex items-center gap-2 rounded px-3 py-2"
            style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
          >
            <FolderPlus size={14} />
            <span>New Collection</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void loadWatchlist();
            }}
            className="flex items-center gap-2 rounded px-3 py-2"
            style={{
              background: 'var(--input-background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--muted-foreground)',
            }}
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div
          className="space-y-3 rounded-xl border p-4"
          style={{ background: 'var(--card)', borderColor: 'var(--accent)', borderRadius: 'var(--radius-card)' }}
        >
          <div>
            <h4 style={{ fontFamily: 'var(--text-h4-family)', fontSize: 'var(--text-h4-size)', color: 'var(--foreground)' }}>
              Create New Collection
            </h4>
            <p className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Select one or more watchlist companies, then create a backend bookmark.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="caption mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                Collection Name *
              </label>
              <input
                value={newCollection.name}
                onChange={(event) => setNewCollection((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Priority Audit Batch"
                className="w-full rounded px-3 py-2 outline-none"
                style={{
                  background: 'var(--input-background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label className="caption mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                Description
              </label>
              <input
                value={newCollection.description}
                onChange={(event) => setNewCollection((current) => ({ ...current, description: event.target.value }))}
                placeholder="Optional context note"
                className="w-full rounded px-3 py-2 outline-none"
                style={{
                  background: 'var(--input-background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>
          <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
            Selected companies: {selectedCompanyIds.length}
          </div>
          {bookmarkError && (
            <div
              className="rounded-lg border px-3 py-2 caption"
              style={{
                background: 'rgba(191, 77, 67, 0.12)',
                borderColor: 'rgba(191, 77, 67, 0.4)',
                color: 'rgb(255, 207, 201)',
              }}
            >
              {bookmarkError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => updateCreateQueryParam(false)}
              className="rounded px-3 py-1.5 caption"
              style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                void handleCreateCollection();
              }}
              disabled={isCreating || selectedCompanyIds.length === 0 || !newCollection.name.trim()}
              className="rounded px-3 py-1.5 caption disabled:opacity-60"
              style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
            >
              {isCreating ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ background: 'var(--card)', borderColor: 'rgba(191, 77, 67, 0.4)', borderRadius: 'var(--radius-card)' }}
        >
          <ShieldAlert size={36} style={{ color: 'var(--destructive)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgb(255, 207, 201)' }}>{error}</p>
        </div>
      ) : isLoading ? (
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <p style={{ color: 'var(--muted-foreground)' }}>Loading watchlist from backend company collections...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border py-20"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <Star size={36} style={{ color: 'var(--muted-foreground)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>No high-risk or critical companies found</p>
          <p className="caption mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Watchlist is derived from backend company collections filtered by risk tier
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}>
            <label className="flex items-center gap-2 caption" style={{ color: 'var(--muted-foreground)' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  setSelectedCompanyIds(allSelected ? [] : watchlist.map((company) => company.id))
                }
              />
              Select all watchlist companies
            </label>
            <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
              {selectedCompanyIds.length} selected
            </span>
          </div>

          {watchlist.map((company) => {
            const tier = normalizeCompanyRiskTier(company.riskTier);
            const isSelected = selectedCompanyIds.includes(company.id);
            const membershipNames = bookmarkMembership.get(company.id) ?? [];

            return (
              <div
                key={company.id}
                className="rounded-xl border p-4"
                style={{ background: 'var(--card)', borderColor: isSelected ? getRiskColor(tier) : 'var(--border)', borderRadius: 'var(--radius-card)' }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <label className="flex items-start gap-3 sm:w-24">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(company.id)}
                      className="mt-1"
                    />
                    <div className="hidden sm:block shrink-0">
                      <RiskGauge score={company.riskScore} size={72} />
                    </div>
                  </label>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Star size={12} fill="var(--primary)" color="var(--primary)" />
                          <span style={{ fontFamily: 'var(--text-label-family)', fontSize: 'var(--text-label-size)', color: 'var(--accent)', fontWeight: 500 }}>
                            {company.companyNickname}
                          </span>
                          <RiskBadge tier={tier} size="sm" />
                        </div>
                        <button
                          onClick={() => navigate(`/company/${company.id}`)}
                          className="hover:underline"
                          style={{ fontFamily: 'var(--text-h3-family)', fontSize: 'var(--text-h3-size)', color: 'var(--foreground)', textAlign: 'left' }}
                        >
                          {company.companyName}
                        </button>
                        <div className="caption mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          {company.sector} · ETR: {company.etr_score.toFixed(1)} · Risk score: {company.riskScore}
                        </div>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => navigate(`/company/${company.id}`)}
                          className="flex items-center gap-1.5 rounded px-3 py-1.5 caption"
                          style={{
                            background: 'var(--input-background)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          <ArrowUpRight size={12} /> <span className="hidden sm:inline">View detail</span><span className="sm:hidden">View</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                      {[
                        { label: 'ETR', value: company.etr_score.toFixed(1), alert: company.etr_score < 15 },
                        { label: 'Margin', value: company.margin_score.toFixed(1), alert: company.margin_score > 70 },
                        { label: 'Debt', value: company.debt_score.toFixed(1), alert: company.debt_score > 70 },
                        { label: 'Revenue', value: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(company.revenue), alert: false },
                        { label: 'Methods', value: company.methods.length.toString(), alert: company.methods.length > 1 },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
                            {metric.label}
                          </div>
                          <div style={{ fontFamily: 'var(--text-p-family)', fontSize: '13px', color: metric.alert ? 'var(--destructive)' : 'var(--foreground)', fontWeight: metric.alert ? 500 : 400 }}>
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.methods.map((method) => (
                        <span
                          key={`${company.id}-${method}`}
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
                      ))}
                    </div>

                    {membershipNames.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="caption" style={{ color: 'var(--muted-foreground)' }}>In:</span>
                        <span className="caption" style={{ color: 'var(--foreground)' }}>
                          {formatCollectionNames(membershipNames)}
                        </span>
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
