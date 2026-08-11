import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from session storage (tab-isolated)
const getSession = () => {
  const sessionRaw = sessionStorage.getItem('katsumboo_user_session') || localStorage.getItem('katsumboo_user_session');
  if (!sessionRaw) return null;
  try {
    return JSON.parse(sessionRaw);
  } catch {
    return null;
  }
};

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const session = getSession();
    if (session?.token && config.headers) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle Token Refresh Rotation & Retry
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Normalise successful responses to payload content
    const resData = response.data;
    if (resData && typeof resData === 'object' && 'success' in resData) {
      return resData.success ? resData.data : Promise.reject(new Error(resData.message || 'Request failed'));
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const session = getSession();
      const refreshToken = session?.refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        // No refresh token -> force logout
        localStorage.removeItem('katsumboo_user_session');
        window.dispatchEvent(new Event('storage'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const resData = response.data;
        const data = resData.success ? resData.data : resData;

        if (data?.accessToken) {
          const updatedSession = {
            ...session,
            token: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            user: data.user || session.user,
          };
          localStorage.setItem('katsumboo_user_session', JSON.stringify(updatedSession));
          window.dispatchEvent(new Event('storage'));

          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          processQueue(null, data.accessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('katsumboo_user_session');
        window.dispatchEvent(new Event('storage'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Wrap express/nest error details
    let errMessage = error.response?.data?.message || error.message || 'Koneksi error';
    if (errMessage === 'Forbidden resource' || error.response?.status === 403) {
      errMessage = 'Akses Ditolak: Tindakan ini khusus Akun Admin. Silakan Logout & Login sebagai admin@katsumboo.com';
    }
    return Promise.reject(new Error(errMessage));
  },
);
