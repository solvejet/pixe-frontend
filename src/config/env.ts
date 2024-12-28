// src/config/env.ts
const requiredEnvVars = ['VITE_API_URL'] as const;

// Check for required environment variables
requiredEnvVars.forEach((envVar) => {
    if (!import.meta.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

/**
 * Environment-specific feature flags
 */
const featureFlags = {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    debugMode: import.meta.env.DEV,
    maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
} as const;

/**
 * API Configuration
 */
const apiConfig = {
    baseUrl: import.meta.env.VITE_API_URL,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT ?? '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS ?? '3'),
} as const;

/**
 * Authentication Configuration
 */
const authConfig = {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: parseInt(import.meta.env.VITE_TOKEN_EXPIRY ?? '3600'),
} as const;

/**
 * Application Theme Configuration
 */
const themeConfig = {
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME ?? 'system',
    availableThemes: ['light', 'dark', 'system'] as const,
} as const;

/**
 * Cache Configuration
 */
const cacheConfig = {
    defaultTTL: parseInt(import.meta.env.VITE_CACHE_TTL ?? '3600'),
    prefix: import.meta.env.VITE_CACHE_PREFIX ?? 'app_cache_',
} as const;

/**
 * Main configuration object
 */
export const config = {
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    version: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
    buildDate: new Date().toISOString(),
    api: apiConfig,
    auth: authConfig,
    theme: themeConfig,
    cache: cacheConfig,
    features: featureFlags,
    sentryDSN: import.meta.env.VITE_SENTRY_DSN,
    googleAnalyticsId: import.meta.env.VITE_GA_ID,
} as const;

/**
 * Type definitions
 */
export type Environment = typeof config.environment;
export type ThemeType = typeof themeConfig.availableThemes[number];
export type Config = typeof config;

/**
 * Environment-specific configuration getter
 */
export function getEnvironmentConfig(env: Environment = config.environment) {
    switch (env) {
        case 'development':
            return {
                ...config,
                features: {
                    ...config.features,
                    debugMode: true,
                },
            };
        case 'production':
            return {
                ...config,
                features: {
                    ...config.features,
                    debugMode: false,
                },
            };
        default:
            return config;
    }
}

/**
 * Validate environment configuration
 */
export function validateConfig(configuration: Partial<Config> = config): boolean {
    const requiredKeys = [
        'environment',
        'api.baseUrl',
        'auth.tokenKey',
        'auth.refreshTokenKey',
    ];

    return requiredKeys.every((key) => {
        const value = key.split('.').reduce((obj, key) => obj?.[key], configuration as any);
        return value !== undefined && value !== null && value !== '';
    });
}

// Validate configuration on load
if (!validateConfig()) {
    throw new Error('Invalid environment configuration');
}

export default config;