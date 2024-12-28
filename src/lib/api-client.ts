// src/lib/api-client.ts
import { useAuthStore } from '@/store/auth.store'

// Error Classes
export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data: any
    ) {
        super(`API Error: ${status} ${statusText}`)
        this.name = 'ApiError'
    }
}

export class NetworkError extends Error {
    constructor(message: string) {
        super(`Network Error: ${message}`)
        this.name = 'NetworkError'
    }
}

// Types
export interface FetchOptions extends RequestInit {
    token?: string
    skipAuth?: boolean
    skipRetry?: boolean
}

// Request interceptor
function addRequestHeaders(options: FetchOptions): FetchOptions {
    const headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers as Record<string, string>)
    });

    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    return {
        ...options,
        headers
    }
}

// Response handler
async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (!response.ok) {
        let errorData;
        try {
            if (contentType?.includes('application/json')) {
                errorData = await response.json();
            } else {
                errorData = await response.text();
            }
        } catch {
            errorData = response.statusText;
        }
        throw new ApiError(response.status, response.statusText, errorData);
    }

    if (contentType?.includes('application/json')) {
        try {
            return await response.json();
        } catch (error) {
            throw new NetworkError('Invalid JSON response');
        }
    }

    throw new NetworkError('Unexpected response type');
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

        return new Promise((resolve, reject) => {
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
    options: FetchOptions,
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

        if (retries > 0 && !options.skipRetry && error instanceof NetworkError) {
            const delay = Math.pow(backoffFactor, 4 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry<T>(url, options, retries - 1, backoffFactor);
        }
        throw error;
    }
}

// Main API client function
export async function client<T>(
    endpoint: string,
    { token, skipAuth = false, skipRetry = false, ...customConfig }: FetchOptions = {}
): Promise<T> {
    const apiUrl = import.meta.env.VITE_API_URL?.trim() || '';

    if (!apiUrl) {
        throw new NetworkError('API URL is not configured');
    }

    try {
        const config = addRequestHeaders({
            ...customConfig,
            token: token || useAuthStore.getState().tokens?.accessToken,
        });

        const url = `${apiUrl}/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        try {
            return await fetchWithRetry<T>(url, config, skipRetry ? 1 : 3);
        } catch (error) {
            // Handle 401 errors by attempting token refresh
            if (error instanceof ApiError && error.status === 401 && !skipAuth) {
                try {
                    const newToken = await handleTokenRefresh();
                    // Retry the original request with the new token
                    const newConfig = addRequestHeaders({
                        ...customConfig,
                        token: newToken,
                    });
                    return await fetchWithRetry<T>(url, newConfig, 1);
                } catch (refreshError) {
                    // If refresh fails, logout and trigger event
                    useAuthStore.getState().logout();
                    window.dispatchEvent(new CustomEvent('auth-error'));
                    throw refreshError;
                }
            }
            throw error;
        }
    } catch (error) {
        if (error instanceof ApiError || error instanceof NetworkError) {
            throw error;
        }
        throw new NetworkError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

// Rate limiting
const rateLimit = {
    timestamp: 0,
    count: 0,
    reset() {
        this.timestamp = Date.now();
        this.count = 0;
    },
    check(limit: number = 50, interval: number = 1000) {
        const now = Date.now();
        if (now - this.timestamp > interval) {
            this.reset();
        }
        this.count++;
        return this.count <= limit;
    }
};

// Convenience methods with rate limiting
export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) => {
        if (!rateLimit.check()) {
            throw new Error('Rate limit exceeded');
        }
        return client<T>(endpoint, { ...options, method: 'GET' });
    },

    post: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
        if (!rateLimit.check()) {
            throw new Error('Rate limit exceeded');
        }
        return client<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
        if (!rateLimit.check()) {
            throw new Error('Rate limit exceeded');
        }
        return client<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    patch: <T>(endpoint: string, data: unknown, options?: FetchOptions) => {
        if (!rateLimit.check()) {
            throw new Error('Rate limit exceeded');
        }
        return client<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    delete: <T>(endpoint: string, options?: FetchOptions) => {
        if (!rateLimit.check()) {
            throw new Error('Rate limit exceeded');
        }
        return client<T>(endpoint, { ...options, method: 'DELETE' });
    }
};