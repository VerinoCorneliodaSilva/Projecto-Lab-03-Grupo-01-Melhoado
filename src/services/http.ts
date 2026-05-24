/**
 * HTTP Client centralizado
 * Usa o backend PHP com JWT e persiste o token em sessionStorage.
 */

import { config } from './config';

export interface HttpResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

const TOKEN_STORAGE_KEY = 'cn_auth_token';

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') + '/';
    this.authToken = this.readStoredToken();
  }

  private readStoredToken(): string | null {
    if (!canUseSessionStorage()) {
      return null;
    }

    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setAuthToken(token: string | null) {
    this.authToken = token;

    if (!canUseSessionStorage()) {
      return;
    }

    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }

    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private unwrapResponseData<T>(responseData: unknown): T | undefined {
    if (responseData && typeof responseData === 'object' && 'data' in (responseData as Record<string, unknown>)) {
      return (responseData as { data?: T }).data;
    }

    return responseData as T;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${endpoint.replace(/^\//, '')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || config.requestTimeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: this.getHeaders(options.headers),
        signal: options.signal || controller.signal,
      };

      if (data !== undefined && method !== 'GET') {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData: unknown = undefined;

      if (response.status !== 204) {
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof responseData === 'object' && responseData !== null && 'error' in (responseData as Record<string, unknown>)
            ? String((responseData as { error?: string }).error)
            : typeof responseData === 'object' && responseData !== null && 'message' in (responseData as Record<string, unknown>)
              ? String((responseData as { message?: string }).message)
              : `HTTP ${response.status}`;

        return {
          success: false,
          error: errorMessage,
          status: response.status,
          data: this.unwrapResponseData<T>(responseData),
        };
      }

      return {
        success: true,
        data: this.unwrapResponseData<T>(responseData),
        status: response.status,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if ((error as { name?: string }).name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          status: 0,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

export const httpClient = new HttpClient(config.apiBaseUrl);
