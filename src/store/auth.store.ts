// src/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { client } from '@/lib/api-client'

interface AuthResponse {
    success: boolean
    data: {
        user: {
            _id: string
            email: string
            firstName: string
            lastName: string
            role: string
            roleId: string
            isActive: boolean
            lastLogin: string
            createdAt: string
            updatedAt: string
        }
        tokens: {
            accessToken: string
            refreshToken: string
        }
        role: {
            name: string
            permissions: string[]
        }
    }
}

interface RefreshTokenResponse {
    success: boolean
    data: {
        tokens: {
            accessToken: string
            refreshToken: string
        }
    }
}

interface AuthState {
    user: AuthResponse['data']['user'] | null
    tokens: AuthResponse['data']['tokens'] | null
    role: AuthResponse['data']['role'] | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (credentials: { email: string; password: string }) => Promise<void>
    logout: () => void
    refreshToken: () => Promise<void>
    clearError: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            tokens: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                try {
                    set({ isLoading: true, error: null })

                    const response = await client<AuthResponse>('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                    })

                    set({
                        user: response.data.user,
                        tokens: response.data.tokens,
                        role: response.data.role,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Login failed',
                        isLoading: false,
                    })
                    throw error
                }
            },

            refreshToken: async () => {
                try {
                    const currentTokens = get().tokens
                    if (!currentTokens?.refreshToken) {
                        throw new Error('No refresh token available')
                    }

                    const response = await client<RefreshTokenResponse>('/auth/refresh-token', {
                        method: 'POST',
                        skipAuth: true, // Skip adding the expired access token
                        body: JSON.stringify({
                            refreshToken: currentTokens.refreshToken
                        }),
                    })

                    set((state) => ({
                        tokens: response.data.tokens,
                        isAuthenticated: true,
                        error: null
                    }))

                    return response.data.tokens.accessToken
                } catch (error) {
                    // If refresh token fails, log the user out
                    get().logout()
                    throw error
                }
            },

            logout: () => {
                set({
                    user: null,
                    tokens: null,
                    role: null,
                    isAuthenticated: false,
                    error: null,
                })
            },

            clearError: () => {
                set({ error: null })
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                tokens: state.tokens,
                role: state.role,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)