import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../lib/api';

const AUTH_TOKEN_KEY = 'satria.auth.token';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  fullName?: string | null;
  createdAt?: string;
}

interface AuthEnvelope {
  success: boolean;
  message?: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

interface CurrentUserResponse {
  success: boolean;
  data: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  username: string;
  fullName?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function persistToken(token: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const response = await apiRequest<CurrentUserResponse>('/api/auth/me', {
          method: 'GET',
          token,
        });

        if (!cancelled) {
          setUser(response.data);
        }
      } catch (error) {
        const status =
          typeof error === 'object' && error !== null && 'status' in error
            ? Number(error.status)
            : undefined;

        if (!cancelled) {
          if (status === 401 || status === 404) {
            persistToken(null);
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function authenticate(path: '/api/auth/login' | '/api/auth/register', input: LoginInput | RegisterInput) {
    const response = await apiRequest<AuthEnvelope>(path, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    persistToken(response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
  }

  async function login(input: LoginInput) {
    await authenticate('/api/auth/login', input);
  }

  async function register(input: RegisterInput) {
    await authenticate('/api/auth/register', input);
  }

  function logout() {
    persistToken(null);
    setToken(null);
    setUser(null);
    setIsBootstrapping(false);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [isBootstrapping, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
