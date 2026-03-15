import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL+'/api' || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nitk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('nitk-refresh-token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const newToken = data.session?.access_token;
          const newRefresh = data.session?.refresh_token;
          if (newToken) {
            localStorage.setItem('nitk-token', newToken);
            if (newRefresh) localStorage.setItem('nitk-refresh-token', newRefresh);
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api(error.config);
          }
        } catch {
          // Refresh failed — clear tokens
        }
      }
      localStorage.removeItem('nitk-token');
      localStorage.removeItem('nitk-refresh-token');
      localStorage.removeItem('nitk-user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
