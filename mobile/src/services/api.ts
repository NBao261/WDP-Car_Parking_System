import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─── API Configuration ───────────────────────────────
// Ưu tiên EXPO_PUBLIC_API_URL từ .env
// Fallback: Android Emulator dùng 10.0.2.2, iOS Simulator dùng localhost
const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export const TOKEN_KEY = 'sp_access_token';
export const REFRESH_TOKEN_KEY = 'sp_refresh_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach token ────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Global error handling ──────
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Auto refresh token on 401 (one retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          // Save new tokens
          await SecureStore.setItemAsync(TOKEN_KEY, data.data.tokens.accessToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.data.tokens.refreshToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear tokens (force re-login)
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    }

    return Promise.reject(error.response?.data || error.message);
  },
);

// ─── Token Helpers ────────────────────────────────────
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};
