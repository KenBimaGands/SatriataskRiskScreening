const DEFAULT_API_BASE_URL = 'https://backend-satria.onrender.com';
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? ''
    : DEFAULT_API_BASE_URL;

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

function buildHeaders(initHeaders: HeadersInit | undefined, token?: string | null) {
  const headers = new Headers(initHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function createApiError(message: string, status?: number, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.details = details;
  return error;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, options.token),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.error?.message ??
      payload?.error ??
      'Request failed';

    throw createApiError(message, response.status, payload);
  }

  return payload as T;
}
