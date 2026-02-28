/**
 * apiClient.ts
 *
 * Thin HTTP client wrapper.
 *
 * HOW TO SWITCH FROM MOCK → REAL:
 *   1. Set USE_MOCK = false
 *   2. Set BASE_URL to your real API base URL
 *   3. Wire up real auth token storage (AsyncStorage / SecureStore)
 *
 * The service layer (contentService.ts etc.) calls `apiClient.get / .post`
 * and never knows whether it's talking to mock data or a live server.
 */

// ─── Config ───────────────────────────────────────────────────────────────────

import { logger } from '../utils/logger';

/**
 * Flip this to `false` to make all service calls hit the real REST API.
 * Can also be driven by an env var: process.env.USE_MOCK_API !== 'false'
 */
export const USE_MOCK = true;

export const BASE_URL = 'https://api.shortsy.app/v1';

/** Simulated network latency in milliseconds (mock mode only). */
const MOCK_DELAY_MS = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RequestOptions {
  /** Query string parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request body (POST / PATCH / PUT) */
  body?: unknown;
  /** Extra headers (e.g. Authorization) */
  headers?: Record<string, string>;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simulate async network round-trip in mock mode. */
export function mockDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

// In a real implementation, retrieve this from SecureStore / AsyncStorage.
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

// ─── Client ───────────────────────────────────────────────────────────────────

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  // Log outgoing request details at DEBUG level (params + body visible)
  const reqMeta: Record<string, unknown> = { url };
  if (options.params) { reqMeta.params = options.params; }
  if (options.body)   { reqMeta.body   = options.body;   }
  logger.debug('API', `${method} ${path}`, reqMeta);

  const timer = logger.startTimer('API', `${method} ${path}`);

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const err = new ApiClientError(
      response.status,
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      errorBody?.error?.message ?? response.statusText,
    );
    timer.fail({ status: response.status, code: err.code, message: err.message });
    throw err;
  }

  // 204 No Content
  if (response.status === 204) {
    timer.end({ status: 204 });
    return undefined as unknown as T;
  }

  const data = await response.json() as T;
  timer.end(data);
  return data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),

  post: <T>(path: string, options?: RequestOptions) =>
    request<T>('POST', path, options),

  patch: <T>(path: string, options?: RequestOptions) =>
    request<T>('PATCH', path, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, options),
};
