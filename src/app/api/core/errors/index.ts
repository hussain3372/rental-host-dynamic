/**
 * Base API Error class that all other API errors extend from
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public data?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Network related errors (timeouts, offline, etc)
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication related errors
 */
export class AuthError extends ApiError {
  constructor(
    message: string,
    status: number = 401,
    code?: string,
    data?: string
  ) {
    super(message, status, code, data);
    this.name = 'AuthError';
  }
} 