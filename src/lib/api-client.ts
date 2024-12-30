// src/lib/api-client.ts
import { useAuthStore } from "@/store/auth.store";

// Error Classes
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(`Network Error: ${message}`);
    this.name = "NetworkError";
  }
}

// Types
type CustomOptions = {
  token?: string;
  skipAuth?: boolean;
  skipRetry?: boolean;
};

type FetchInit = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export type FetchOptions = FetchInit & CustomOptions;

// Request interceptor
function addRequestHeaders(options: FetchOptions): RequestInit {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  // Convert HeadersInit to Record<string, string>
  if (options.headers) {
    const headerEntries =
      options.headers instanceof Headers
        ? Array.from(options.headers.entries())
        : Array.isArray(options.headers)
          ? options.headers
          : Object.entries(options.headers);

    headerEntries.forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  // Remove custom properties before returning RequestInit
  const { token, skipAuth, skipRetry, ...fetchOptions } = options;

  return {
    ...fetchOptions,
    headers,
  };
}

// Response handler
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorData;
    try {
      if (contentType?.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
    } catch {
      errorData = response.statusText;
    }
    throw new ApiError(response.status, response.statusText, errorData);
  }

  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      throw new NetworkError("Invalid JSON response");
    }
  }

  throw new NetworkError("Unexpected response type");
}

// Token refresh handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  failedQueue = [];
}

async function handleTokenRefresh() {
  try {
    if (!isRefreshing) {
      isRefreshing = true;
      const authStore = useAuthStore.getState();
      const newToken = await authStore.refreshToken();
      processQueue(null, newToken);
      return newToken;
    }

    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

// Retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = 3,
  backoffFactor: number = 2
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error; // Let the main client function handle auth errors
    }

    if (
      retries > 0 &&
      !options.signal?.aborted &&
      error instanceof NetworkError
    ) {
      const delay = Math.pow(backoffFactor, 4 - retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, options, retries - 1, backoffFactor);
    }
    throw error;
  }
}

// Main API client function
export async function client<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const apiUrl = import.meta.env.VITE_API_URL?.trim() || "";

  if (!apiUrl) {
    throw new NetworkError("API URL is not configured");
  }

  try {
    const authStore = useAuthStore.getState();
    const currentToken = options.token || authStore.tokens?.accessToken;

    const config = addRequestHeaders({
      ...options,
      token: currentToken,
    });

    // Format the URL with explicit port 4001
    const baseUrl = "http://localhost:4001/api/v1";
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${path}`;

    try {
      return await fetchWithRetry<T>(url, config, options.skipRetry ? 1 : 3);
    } catch (error) {
      // Handle 401 errors by attempting token refresh
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        !options.skipAuth
      ) {
        try {
          const newToken = await handleTokenRefresh();
          // Retry the original request with the new token
          const newConfig = addRequestHeaders({
            ...options,
            token: newToken,
          });
          return await fetchWithRetry<T>(url, newConfig, 1);
        } catch (refreshError) {
          // If refresh fails, logout and trigger event
          authStore.logout();
          window.dispatchEvent(new CustomEvent("auth-error"));
          throw refreshError;
        }
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

// API methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) => {
    return client<T>(endpoint, { ...options, method: "GET" });
  },

  post: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
    return client<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
    return client<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
    return client<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: <T>(endpoint: string, options?: FetchOptions) => {
    return client<T>(endpoint, { ...options, method: "DELETE" });
  },
};
