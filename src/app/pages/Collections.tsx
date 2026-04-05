import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Archive, BarChart2, FolderOpen, RefreshCcw } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { useBookmarks } from '../bookmarks/BookmarksContext';
import { getRiskColor, type RiskTier } from '../data/mockData';
import { normalizeRiskTier, type Bookmark, type BookmarkCompanyData } from '../lib/bookmarks';

const COLLECTION_COLORS = ['#BF4D43', '#D97757', '#207FDE', '#9B87F5', '#4CAF74', '#D4A017'];

function getBookmarkColor(id: number) {
  return COLLECTION_COLORS[id % COLLECTION_COLORS.length];
}

function getAverageTier(score: number): RiskTier {
  if (score >= 81) return 'critical';
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  return 'low';
}

function formatMethods(methods: string[]) {
  if (methods.length === 0) {
    return 'No methods listed';
  }

  return methods
    .map((method) =>
      method
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    )
    .join(', ');
}

function formatRevenue(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function CollectionCompanyRow({
  company,
}: {
  company: BookmarkCompanyData;
}) {
  const tier = normalizeRiskTier(company.riskTier);

  return (
    <div
      className="flex items-start gap-3 border-b px-4 py-3 md:gap-4"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded"
        style={{
          background: `${getRiskColor(tier)}22`,
          border: `1px solid ${getRiskColor(tier)}44`,
          borderRadius: 'var(--radius)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--text-p-family)',
            fontSize: '13px',
            color: getRiskColor(tier),
            fontWeight: 500,
          }}
        >
          {company.riskScore}
        </span>
      </div>

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
          {company.companyName} · {company.sector}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span
            className="caption rounded px-2 py-1"
            style={{ background: 'var(--input-background)', color: 'var(--muted-foreground)' }}
          >
            Revenue {formatRevenue(company.revenue)}
          </span>
          <span
            className="caption rounded px-2 py-1"
            style={{ background: 'var(--input-background)', color: 'var(--muted-foreground)' }}
          >
            ETR {company.etr_score.toFixed(1)}
          </span>
          <span
            className="caption rounded px-2 py-1"
            style={{ background: 'var(--input-background)', color: 'var(--muted-foreground)' }}
          >
            Debt {company.debt_score.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="hidden max-w-64 text-right md:block">
        <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
          Methods
        </div>
        <div className="caption mt-1" style={{ color: 'var(--foreground)' }}>
          {formatMethods(company.methods)}
        </div>
      </div>
    </div>
  );
}

function CollectionCard({
  bookmark,
  expanded,
  updating,
  archiveLabel,
  onToggle,
  onStatusChange,
}: {
  bookmark: Bookmark;
  expanded: boolean;
  updating: boolean;
  archiveLabel: 'Archive Collection' | 'Restore';
  onToggle: () => void;
  onStatusChange: () => Promise<void>;
}) {
  const companies = bookmark.companies.map((entry) => entry.company);
  const averageRisk = companies.length
    ? Math.round(companies.reduce((sum, company) => sum + company.riskScore, 0) / companies.length)
    : 0;
  const averageTier = getAverageTier(averageRisk);
  const topRiskCompany = [...companies].sort((left, right) => right.riskScore - left.riskScore)[0];
  const color = getBookmarkColor(bookmark.id);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
    >
      <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
          <div className="min-w-0">
            <div
              style={{
                fontFamily: 'var(--text-h3-family)',
                fontSize: 'var(--text-h3-size)',
                color: 'var(--foreground)',
              }}
            >
              {bookmark.name}
            </div>
            <div className="caption mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
              {bookmark.description || bookmark.notes || `Updated ${formatDate(bookmark.updatedAt)}`}
            </div>
          </div>
        </div>

        <div className="mr-4 hidden shrink-0 items-center gap-4 sm:flex md:gap-6">
          <div className="text-right">
            <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
              Companies
            </div>
            <div style={{ color: 'var(--foreground)', fontWeight: 500 }}>{companies.length}</div>
          </div>
          <div className="text-right">
            <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
              Avg Risk
            </div>
            <div style={{ color: getRiskColor(averageTier), fontWeight: 500 }}>
              {averageRisk || '—'}
            </div>
          </div>
          <div className="hidden text-right md:block">
            <div className="caption" style={{ color: 'var(--muted-foreground)' }}>
              Highest Risk
            </div>
            <div className="caption" style={{ color: topRiskCompany ? getRiskColor(normalizeRiskTier(topRiskCompany.riskTier)) : 'var(--muted-foreground)', fontWeight: 500 }}>
              {topRiskCompany ? `${topRiskCompany.companyNickname} (${topRiskCompany.riskScore})` : '—'}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="caption sm:hidden" style={{ color: 'var(--muted-foreground)' }}>
            {companies.length} co.
          </span>
          <span className="caption" style={{ color: 'var(--muted-foreground)' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          {companies.length === 0 ? (
            <div className="py-8 text-center caption" style={{ color: 'var(--muted-foreground)' }}>
              No companies were returned for this collection.
            </div>
          ) : (
            companies.map((company) => (
              <CollectionCompanyRow key={company.id} company={company} />
            ))
          )}

          <div className="flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded px-3 py-1.5 caption"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--muted-foreground)',
              }}
              onClick={() => alert('Batch PDF export is not integrated yet.')}
            >
              <BarChart2 size={12} /> Export Batch PDF
            </button>

            <button
              type="button"
              onClick={() => {
                void onStatusChange();
              }}
              disabled={updating}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 caption disabled:opacity-60"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--muted-foreground)',
              }}
            >
              <Archive size={12} /> {updating ? 'Saving...' : archiveLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Collections() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    activeBookmarks,
    archivedBookmarks,
    isLoading,
    error,
    updatingBookmarkIds,
    refreshBookmarks,
    updateBookmarkStatus,
  } = useBookmarks();
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<number | null>(null);

  useEffect(() => {
    const selectedBookmarkId = Number(searchParams.get('bookmark'));
    const allBookmarks = [...activeBookmarks, ...archivedBookmarks];

    if (selectedBookmarkId && allBookmarks.some((bookmark) => bookmark.id === selectedBookmarkId)) {
      setExpandedBookmarkId(selectedBookmarkId);
      return;
    }

    if (expandedBookmarkId && allBookmarks.some((bookmark) => bookmark.id === expandedBookmarkId)) {
      return;
    }

    setExpandedBookmarkId(activeBookmarks[0]?.id ?? archivedBookmarks[0]?.id ?? null);
  }, [activeBookmarks, archivedBookmarks, expandedBookmarkId, searchParams]);

  function toggleExpanded(bookmarkId: number) {
    const nextId = expandedBookmarkId === bookmarkId ? null : bookmarkId;
    setExpandedBookmarkId(nextId);

    const nextSearchParams = new URLSearchParams(searchParams);
    if (nextId) {
      nextSearchParams.set('bookmark', String(nextId));
    } else {
      nextSearchParams.delete('bookmark');
    }
    setSearchParams(nextSearchParams, { replace: true });
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
            Collections
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Backend-backed bookmarks grouped by active and archived status.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => navigate('/watchlist?createCollection=1')}
            className="flex items-center gap-2 rounded px-3 py-2"
            style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'white' }}
          >
            <FolderOpen size={14} />
            <span>New Collection</span>
          </button>
          <p className="caption text-right" style={{ color: 'var(--muted-foreground)' }}>
            Create a new collection from selected Watchlist companies.
          </p>
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
              void refreshBookmarks();
            }}
            className="mt-2 inline-flex items-center gap-1.5 caption"
            style={{ color: 'rgb(255, 207, 201)' }}
          >
            <RefreshCcw size={12} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          className="rounded-xl border px-4 py-10 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
        >
          <p style={{ color: 'var(--muted-foreground)' }}>Loading collections from `/api/bookmarks`...</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3
                style={{
                  fontFamily: 'var(--text-h3-family)',
                  fontSize: 'var(--text-h3-size)',
                  color: 'var(--foreground)',
                }}
              >
                Active Collections ({activeBookmarks.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  void refreshBookmarks();
                }}
                className="inline-flex items-center gap-1.5 caption"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <RefreshCcw size={12} /> Refresh
              </button>
            </div>

            {activeBookmarks.length === 0 ? (
              <div
                className="rounded-xl border px-4 py-8 text-center"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}
              >
                <p style={{ color: 'var(--muted-foreground)' }}>No active collections found.</p>
              </div>
            ) : (
              activeBookmarks.map((bookmark) => (
                <CollectionCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  expanded={expandedBookmarkId === bookmark.id}
                  updating={updatingBookmarkIds.includes(bookmark.id)}
                  archiveLabel="Archive Collection"
                  onToggle={() => toggleExpanded(bookmark.id)}
                  onStatusChange={async () => {
                    await updateBookmarkStatus(bookmark.id, 'Archived');
                  }}
                />
              ))
            )}
          </div>

          {archivedBookmarks.length > 0 && (
            <div className="space-y-3">
              <h3
                style={{
                  fontFamily: 'var(--text-h3-family)',
                  fontSize: 'var(--text-h3-size)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Archived ({archivedBookmarks.length})
              </h3>

              {archivedBookmarks.map((bookmark) => (
                <CollectionCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  expanded={expandedBookmarkId === bookmark.id}
                  updating={updatingBookmarkIds.includes(bookmark.id)}
                  archiveLabel="Restore"
                  onToggle={() => toggleExpanded(bookmark.id)}
                  onStatusChange={async () => {
                    await updateBookmarkStatus(bookmark.id, 'Active');
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
