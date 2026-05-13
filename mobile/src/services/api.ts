import axios from 'axios';
import { Platform } from 'react-native';

// Use standard local IP for Android Emulator, or localhost for iOS simulator
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach token
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Fetch token from secure storage and append here
    // const token = await SecureStore.getItemAsync('userToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized -> logout)
    return Promise.reject(error.response?.data || error.message);
  }
);
