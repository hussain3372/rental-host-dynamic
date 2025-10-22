/**
 * Core API response type used across all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: null | string[] | Record<string, string[]> | ApiError[];
  meta: null | Record<string, string>;
}

/**
 * Common pagination metadata
 */
export interface PaginationMeta {
  page: number; total: number;
  total_pages: number;
  limit: number;
  offset: number;
}

/**
 * Generic paginated response type
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Standard API error shape
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
  status?: number;
}

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request options for API client
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  cache?: RequestCache;
  timeout?: number;
  cacheExpiry?: number;
  showError?: boolean;
  showLoader?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
}

/**
 * Configuration for the API client
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  withCredentials?: boolean;
  defaultHeaders?: Record<string, string>;
}

/**
 * Base API response type (alias for ApiResponse for backward compatibility)
 */
export type BaseResponse<T> = ApiResponse<T>; 