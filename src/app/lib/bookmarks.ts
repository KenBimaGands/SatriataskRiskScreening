import type { RiskTier } from '../data/mockData';
import { apiRequest } from './api';

export type BookmarkStatus = 'Active' | 'Archived';
type BackendRiskTier = 'Critical' | 'High' | 'Medium' | 'Low';

export interface BookmarkCompanyData {
  id: number;
  userId: number;
  companyName: string;
  companyNickname: string;
  sector: string;
  riskScore: number;
  riskTier: BackendRiskTier;
  methods: string[];
  revenue: number;
  etr_score: number;
  margin_score: number;
  rp_haven_score: number;
  debt_score: number;
  ownership_score: number;
  conduct_score: number;
  persistence_multiplier: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkCompany {
  id: number;
  bookmarkId: number;
  companyId: number;
  bookmarkedAt: string;
  createdAt: string;
  updatedAt: string;
  company: BookmarkCompanyData;
}

export interface Bookmark {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  status: BookmarkStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  companies: BookmarkCompany[];
}

interface BookmarkListResponse {
  success: boolean;
  data: Bookmark[];
}

interface BookmarkResponse {
  success: boolean;
  data: Bookmark;
}

export interface CreateBookmarkInput {
  name: string;
  companyIds: number[];
  description?: string;
  status?: BookmarkStatus;
  notes?: string;
}

export interface UpdateBookmarkInput {
  name?: string;
  description?: string;
  companyIds?: number[];
  status?: BookmarkStatus;
  notes?: string;
}

export function getBookmarks(token: string) {
  return apiRequest<BookmarkListResponse>('/api/bookmarks', {
    method: 'GET',
    token,
  });
}

export function createBookmark(input: CreateBookmarkInput, token: string) {
  return apiRequest<BookmarkResponse>('/api/bookmarks', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export function updateBookmark(id: number, input: UpdateBookmarkInput, token: string) {
  return apiRequest<BookmarkResponse>(`/api/bookmarks/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  });
}

export function normalizeRiskTier(tier: BackendRiskTier): RiskTier {
  switch (tier) {
    case 'Critical':
      return 'critical';
    case 'High':
      return 'high';
    case 'Medium':
      return 'medium';
    case 'Low':
      return 'low';
  }
}
