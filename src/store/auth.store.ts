// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { client } from "@/lib/api-client";

interface DeviceInfo {
  deviceId: string;
  deviceType: "web" | "mobile" | "tablet";
  browserName: string;
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  };
}

interface RefreshTokenResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface LogoutResponse {
  status: string;
  message: string;
}

interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  deviceInfo: DeviceInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthResponse["data"]>;
  logout: (allDevices?: boolean) => Promise<void>;
  refreshToken: () => Promise<string>;
  clearError: () => void;
}

const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const browserName =
    userAgent.match(
      /(chrome|safari|firefox|msie|trident|edg|opera(?=\/))\/?\s*(\d+)/i
    )?.[1] || "Unknown";

  return {
    deviceId: `web-${Math.random().toString(36).substring(2, 15)}`,
    deviceType: "web",
    browserName:
      browserName.charAt(0).toUpperCase() + browserName.slice(1).toLowerCase(),
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      deviceInfo: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const deviceInfo = getDeviceInfo();
          set({ deviceInfo });

          const response = await client<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              ...credentials,
              deviceInfo,
            }),
          });

          if (!response.data.accessToken) {
            throw new Error("No access token received");
          }

          const tokens = {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };

          set({
            user: response.data.user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          console.error("Login error in store:", error);
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const currentTokens = get().tokens;
          if (!currentTokens?.refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await client<RefreshTokenResponse>(
            "/auth/refresh-token",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${currentTokens.accessToken}`,
              },
              body: JSON.stringify({
                refreshToken: currentTokens.refreshToken,
              }),
            }
          );

          const newTokens = {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };

          set(() => ({
            tokens: newTokens,
            isAuthenticated: true,
            error: null,
          }));

          return response.data.accessToken;
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      logout: async (allDevices = false) => {
        try {
          const currentTokens = get().tokens;
          if (!currentTokens?.refreshToken) {
            throw new Error("No refresh token available");
          }

          await client<LogoutResponse>("/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentTokens.accessToken}`,
            },
            body: JSON.stringify({
              refreshToken: currentTokens.refreshToken,
              allDevices,
            }),
          });
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          set({
            user: null,
            tokens: null,
            deviceInfo: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      storage:
        typeof window !== "undefined"
          ? {
              getItem: (name) => {
                const str = localStorage.getItem(name);
                if (!str) return null;
                try {
                  return JSON.parse(str);
                } catch {
                  localStorage.removeItem(name);
                  return null;
                }
              },
              setItem: (name, value) => {
                localStorage.setItem(name, JSON.stringify(value));
              },
              removeItem: (name) => localStorage.removeItem(name),
            }
          : undefined,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        deviceInfo: state.deviceInfo,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (_state) => {
        console.log("Rehydrated state:", get());
      },
    }
  )
);