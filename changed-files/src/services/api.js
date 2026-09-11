import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Pre-configured Axios instance for KnowPass
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Attach JWT Bearer token to all outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle response errors (401 Unauthorized, Token Expiry)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          let accessToken;
          let newRefreshToken;
          if (supabase) {
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !data.session) throw refreshError || new Error('Session expired.');
            accessToken = data.session.access_token;
            newRefreshToken = data.session.refresh_token;
          } else {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
            ({ accessToken, newRefreshToken } = response.data);
          }
          tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) {
            tokenStorage.setRefreshToken(newRefreshToken);
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, purge auth storage and notify
          tokenStorage.clearAuth();
          window.dispatchEvent(new Event('auth:unauthorized'));
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, purge credentials
        tokenStorage.clearAuth();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
