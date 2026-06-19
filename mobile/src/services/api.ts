import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Facility, PricingPlan, AvailableSlot } from '../types/facility.types';

// ─── API Configuration ───────────────────────────────
// Ưu tiên EXPO_PUBLIC_API_URL từ .env
// Fallback: Android Emulator dùng 10.0.2.2, iOS Simulator dùng localhost
const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

let API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
if (Platform.OS === 'android' && API_URL.includes('localhost')) {
  API_URL = API_URL.replace('localhost', '10.0.2.2');
}

export const TOKEN_KEY = 'sp_access_token';
export const REFRESH_TOKEN_KEY = 'sp_refresh_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Public Routes
  getPublicFacilities: async (page = 1, limit = 10, search?: string, status?: string, vehicleTypeId?: string) => {
    let url = `/public/facilities?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${status}`;
    if (vehicleTypeId && vehicleTypeId !== 'all') url += `&vehicleTypeId=${vehicleTypeId}`;
    const response = await apiClient.get<any, { success: boolean, data: Facility[], pagination: any }>(url);
    return response.data;
  },
  getPublicPricing: async (facilityId: string) => {
    const response = await apiClient.get<any, { success: boolean, data: PricingPlan[] }>(`/public/facilities/${facilityId}/pricing`);
    return response.data;
  },
  getAvailableSlots: async (facilityId: string) => {
    const response = await apiClient.get<any, { success: boolean, data: AvailableSlot[] }>(`/public/facilities/${facilityId}/available-slots`);
    return response.data;
  },
};

export const sessionApi = {
  getMySessions: (status?: 'active' | 'completed') => {
    return apiClient.get('/sessions/my-sessions', { params: { status } });
  },
};

// Reservation API
export const reservationApi = {
  createReservation: (data: { facilityId: string; vehicleTypeId: string; licensePlate: string; startTime: string; }) => {
    return apiClient.post('/reservations', data);
  },
  getReservations: (status?: 'pending' | 'confirmed' | 'used' | 'cancelled' | 'expired') => {
    return apiClient.get('/reservations', { params: { status } });
  },
  cancelReservation: (id: string) => {
    return apiClient.post(`/reservations/${id}/cancel`);
  }
};

// Vehicle Type API
export const vehicleTypeApi = {
  getVehicleTypes: async (): Promise<any> => {
    return apiClient.get('/vehicle-types');
  }
};

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
