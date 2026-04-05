import type { AvoidanceMethod, RiskTier } from '../data/mockData';
import { apiRequest } from './api';

type BackendRiskTier = 'Critical' | 'High' | 'Medium' | 'Low';

export interface GetCompanyCollectionsFilters {
  riskTier?: BackendRiskTier;
  method?: string[];
}

export interface CompanyCollection {
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

interface CompanyCollectionListResponse {
  success: boolean;
  data: CompanyCollection[];
}

interface CompanyCollectionResponse {
  success: boolean;
  data: CompanyCollection;
}

export function getAllCompanyCollections(token: string, filters: GetCompanyCollectionsFilters = {}) {
  const params = new URLSearchParams();

  if (filters.riskTier) {
    params.set('riskTier', filters.riskTier);
  }

  filters.method?.forEach((method) => {
    params.append('method', method);
  });

  const query = params.toString();

  return apiRequest<CompanyCollectionListResponse>(`/api/company-collections${query ? `?${query}` : ''}`, {
    method: 'GET',
    token,
  });
}

export function getCompanyCollectionById(id: number, token: string) {
  return apiRequest<CompanyCollectionResponse>(`/api/company-collections/${id}`, {
    method: 'GET',
    token,
  });
}

export function normalizeCompanyRiskTier(tier: BackendRiskTier): RiskTier {
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

export function normalizeMethod(method: string): AvoidanceMethod | null {
  const normalized = method.trim().toLowerCase().replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'transfer_pricing':
      return 'transfer_pricing';
    case 'debt_shifting':
      return 'debt_shifting';
    case 'royalty_stripping':
      return 'royalty_stripping';
    case 'shell_layering':
      return 'shell_layering';
    default:
      return null;
  }
}

export function formatMethodLabel(method: string) {
  const normalized = normalizeMethod(method);

  if (normalized) {
    switch (normalized) {
      case 'transfer_pricing':
        return 'Transfer Pricing';
      case 'debt_shifting':
        return 'Debt Shifting';
      case 'royalty_stripping':
        return 'Royalty Stripping';
      case 'shell_layering':
        return 'Shell Layering';
    }
  }

  return method
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatMethodShort(method: string) {
  const normalized = normalizeMethod(method);

  switch (normalized) {
    case 'transfer_pricing':
      return 'TP';
    case 'debt_shifting':
      return 'DS';
    case 'royalty_stripping':
      return 'RS';
    case 'shell_layering':
      return 'SL';
    default:
      return formatMethodLabel(method);
  }
}
