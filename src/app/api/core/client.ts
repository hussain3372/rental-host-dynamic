import Cookies from "js-cookie";

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  status?: string;
  message: string;
  errors: string[] | null;
  meta: unknown;
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  withCredentials?: boolean;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  timeout?: number;
  cache?: "no-store" | "force-cache";
  cacheExpiry?: number;
  responseType?: "json" | "blob" | "text";

}

/**
 * Cache storage for API responses
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheItem<unknown>> = {};

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: ApiConfig = {
  timeout: 60000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

/**
 * Current API configuration
 */
let apiConfig: ApiConfig = { ...DEFAULT_CONFIG };

/**
 * Get the base API URL
 */
function getApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL || "";
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');

  return cleanBaseUrl ? `${cleanBaseUrl}/${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Build a URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = getApiUrl(endpoint);

  if (!params) return url;

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout?: number
): Promise<Response> {
  const actualTimeout = timeout ?? apiConfig.timeout ?? 60000;

  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      const timeoutSeconds = Math.round(actualTimeout / 1000);
      reject(
        new NetworkError(
          `Request timeout after ${timeoutSeconds} seconds. The server might be busy or the request is taking longer than expected. Please try again.`
        )
      );
    }, actualTimeout);

    fetch(url, {
      ...options,
      signal: controller.signal,
    })
      .then(resolve)
      .catch((error) => {
        if (error.name === "AbortError") {
          const timeoutSeconds = Math.round(actualTimeout / 1000);
          reject(
            new NetworkError(
              `Request timeout after ${timeoutSeconds} seconds. The server might be busy or the request is taking longer than expected. Please try again.`
            )
          );
        } else {
          reject(error);
        }
      })
      .finally(() => clearTimeout(timeoutId));
  });
}

export async function getAuthToken(): Promise<string | null> {
  // 1. Try to get token from cookies (most secure for accessToken)
  const cookieToken = Cookies.get("accessToken");

  // 2. If not found, fall back to localStorage
  const localToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // 3. You can prioritize cookie over local storage
  return cookieToken || localToken;
}

/**
 * Clear the API cache
 */
export function clearCache(url?: string): void {
  if (url) {
    const cacheKey = url.startsWith("http") ? url : getApiUrl(url);
    delete cache[cacheKey];
  } else {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }
}

/**
 * Main request function with caching support
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      requiresAuth = true,
      timeout = apiConfig.timeout,
      cache: cacheConfig = "no-store",
      cacheExpiry,
    } = options;

    // Build the URL with query parameters
    const url = buildUrl(endpoint, params);
    const cacheKey = `${url}-${JSON.stringify({ method, body })}`;

    // Check cache if enabled and it's a GET request
    if (method === "GET" && cacheConfig !== "no-store" && cacheExpiry) {
      const now = Date.now();
      const cachedItem = cache[cacheKey] as CacheItem<T> | undefined;

      if (cachedItem && now - cachedItem.timestamp < cacheExpiry) {
        return {
          success: true,
          data: cachedItem.data,
          message: "Cached response",
          errors: null,
          meta: null,
        };
      }
    }

    // Get auth token if required
    let authToken: string | null = null;
    if (requiresAuth) {
      authToken = await getAuthToken();
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      ...apiConfig.defaultHeaders,
      ...headers,
    };

    // Don't override Content-Type if it's multipart/form-data
    if (!headers["Content-Type"]?.includes("multipart/form-data")) {
      requestHeaders["Content-Type"] = "application/json";
    }

    // Add auth token if available
    if (authToken) {
      requestHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: apiConfig.withCredentials ? "include" : "same-origin",
    };

    // Add body if provided
    if (body !== undefined) {
      if (body instanceof FormData) {
        delete requestHeaders["Content-Type"];
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Make the request
    const response = await fetchWithTimeout(url, requestOptions, timeout);

    // Parse response regardless of status code to get actual backend error
    let responseData: unknown = {};
    let parseError: string | null = null;

    try {
      // Only try to parse JSON if there's content
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.includes("application/json") &&
        response.status !== 204
      ) {
        responseData = await response.json();
      } else if (response.status !== 204) {
        responseData = { message: await response.text() };
      }
    } catch (error) {
      parseError =
        error instanceof Error ? error.message : "Failed to parse response";
    }

    // Handle HTTP error responses - PRESERVE ACTUAL BACKEND ERROR
    if (!response.ok) {
      // Use the actual backend error structure if available
      const responseObj = responseData as Record<string, unknown>;
      const backendMessage = (responseObj.message || (responseObj.error as Record<string, unknown>)?.message || `HTTP error ${response.status}`) as string;
      const backendCode = (responseObj.code || (responseObj.error as Record<string, unknown>)?.code) as string | undefined;
      const backendErrors = (responseObj.errors || (responseObj.message ? [responseObj.message] : null)) as string[] | null;

      return {
        success: false,
        data: null as T,
        message: backendMessage, // Use actual backend message
        errors: backendErrors || [backendMessage],
        meta: {
          status: response.status,
          code: backendCode,
          ...responseObj,
          timestamp: (responseObj.timestamp || (responseObj.error as Record<string, unknown>)?.timestamp) as number | undefined,
          stack: (responseObj.stack || (responseObj.error as Record<string, unknown>)?.stack) as string | undefined
        },
      };
    }

    // Handle empty responses
    if (response.status === 204) {
      return {
        success: true,
        data: {} as T,
        message: "No content",
        errors: null,
        meta: null,
      };
    }

    // Handle parse errors for successful responses
    if (parseError) {
      return {
        success: false,
        data: null as T,
        message: parseError,
        errors: [parseError],
        meta: { type: "ParseError" },
      };
    }

    // Check if the response follows our ApiResponse structure
    if (responseData && typeof responseData === 'object' && 'success' in (responseData as Record<string, unknown>)) {
      const apiResponse = responseData as ApiResponse<T>;

      // Cache successful GET responses if caching is enabled
      if (
        method === "GET" &&
        cacheConfig !== "no-store" &&
        cacheExpiry &&
        apiResponse.success
      ) {
        cache[cacheKey] = {
          data: apiResponse.data,
          timestamp: Date.now(),
        };
      }

      return apiResponse;
    }

    // If not, wrap it in our ApiResponse structure
    const apiResponse: ApiResponse<T> = {
      success: true,
      data: responseData as T,
      message: "Success",
      errors: null,
      meta: null,
    };

    // Cache successful GET responses if caching is enabled
    if (method === "GET" && cacheConfig !== "no-store" && cacheExpiry) {
      cache[cacheKey] = {
        data: apiResponse.data,
        timestamp: Date.now(),
      };
    }

    return apiResponse;
  } catch (error) {
    // Handle different error types and always return ApiResponse
    console.error("API request error:", error);

    if (error instanceof NetworkError) {
      return {
        success: false,
        data: null as T,
        message: error.message,
        errors: [error.message],
        meta: { type: "NetworkError" },
      };
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        data: null as T,
        message: error.message,
        errors: [error.message],
        meta: {
          type: "AuthError",
          status: error.status,
          code: error.code,
          data: error.data,
        },
      };
    }

    if (error instanceof ApiError) {
      return {
        success: false,
        data: null as T,
        message: error.message,
        errors: [error.message],
        meta: {
          type: "ApiError",
          status: error.status,
          code: error.code,
          data: error.data,
        },
      };
    }

    // Fallback for unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      data: null as T,
      message: errorMessage,
      errors: [errorMessage],
      meta: { type: "UnexpectedError" },
    };
  }
}

/**
 * Main request function with streaming support
 */
export async function apiStreamRequest(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    method = "POST",
    headers = {},
    body,
    requiresAuth = true,
    timeout = apiConfig.timeout,
  } = options;

  // Build the URL
  const url = getApiUrl(endpoint);

  // Get auth token if required
  let authToken: string | null = null;
  if (requiresAuth) {
    authToken = await getAuthToken();
  }

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...apiConfig.defaultHeaders,
    ...headers,
  };

  // Add auth token if available
  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: apiConfig.withCredentials ? "include" : "same-origin",
    keepalive: true,
  };

  // Add body if provided
  if (body !== undefined) {
    if (body instanceof FormData) {
      delete requestHeaders["Content-Type"];
      requestOptions.body = body;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  // Make the request
  const response = await fetchWithTimeout(url, requestOptions, timeout);

  // Check for HTTP errors - but don't throw, let the consumer handle the stream
  if (!response.ok) {
    // For streaming, we might still want to read the error from the stream
    // So we return the response as-is and let the consumer handle it
    console.warn(`Stream request returned status ${response.status}`);
  }

  return response;
}

/**
 * Helper methods for common HTTP verbs
 */
export const apiClient = {
  /**
   * Initialize the API client with custom configuration
   */
  initialize(config: Partial<ApiConfig>): void {
    apiConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  },

  /**
   * Get the current API configuration
   */
  getConfig(): ApiConfig {
    return { ...apiConfig };
  },

  /**
   * Clear the API cache for a specific URL or all URLs
   */
  clearCache(url?: string): void {
    clearCache(url);
  },

  /**
   * Make a GET request
   */
  get<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: "GET" });
  },

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'POST', body: data });
  },

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data });
  },

  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: data });
  },

  /**
   * Make a DELETE request
   */
  delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method"> = {}
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
  },

  /**
   * Make a streaming request
   */
  stream(endpoint: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<Response> {
    return apiStreamRequest(endpoint, { ...options, method: 'POST', body: data });
  },
};
