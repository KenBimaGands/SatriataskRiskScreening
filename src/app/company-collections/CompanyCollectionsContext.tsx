import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import type { ApiError } from '../lib/api';
import {
  getAllCompanyCollections,
  getCompanyCollectionById,
  type CompanyCollection,
} from '../lib/companyCollections';

interface CompanyCollectionsContextValue {
  companies: CompanyCollection[];
  isLoading: boolean;
  error: string | null;
  refreshCompanies: () => Promise<void>;
  loadCompanyById: (id: number) => Promise<CompanyCollection | null>;
}

const CompanyCollectionsContext = createContext<CompanyCollectionsContextValue | undefined>(undefined);

export function CompanyCollectionsProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, isBootstrapping, logout } = useAuth();
  const [companies, setCompanies] = useState<CompanyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCompanies = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setCompanies([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllCompanyCollections(token);
      setCompanies(response.data);
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      if (apiError.status === 401) {
        logout();
        return;
      }

      setError(apiError.message || 'Unable to load company collections.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, token]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    void refreshCompanies();
  }, [isBootstrapping, refreshCompanies]);

  const loadCompanyById = useCallback(async (id: number) => {
    const existing = companies.find((company) => company.id === id);
    if (existing) {
      return existing;
    }

    if (!token) {
      return null;
    }

    try {
      const response = await getCompanyCollectionById(id, token);
      setCompanies((current) => {
        if (current.some((company) => company.id === response.data.id)) {
          return current.map((company) =>
            company.id === response.data.id ? response.data : company,
          );
        }

        return [...current, response.data];
      });
      return response.data;
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      if (apiError.status === 401) {
        logout();
        return null;
      }

      throw caughtError;
    }
  }, [companies, logout, token]);

  const value = useMemo<CompanyCollectionsContextValue>(
    () => ({
      companies,
      isLoading,
      error,
      refreshCompanies,
      loadCompanyById,
    }),
    [companies, error, isLoading, loadCompanyById, refreshCompanies],
  );

  return (
    <CompanyCollectionsContext.Provider value={value}>
      {children}
    </CompanyCollectionsContext.Provider>
  );
}

export function useCompanyCollections() {
  const context = useContext(CompanyCollectionsContext);

  if (!context) {
    throw new Error('useCompanyCollections must be used within a CompanyCollectionsProvider');
  }

  return context;
}
