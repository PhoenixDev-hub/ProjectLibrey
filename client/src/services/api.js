import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: apiURL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?.__isRetry && !originalRequest?.skipAuthRedirect) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.Authorization;
        window.dispatchEvent(new Event("unauthorized"));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((refreshError) => Promise.reject(refreshError));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await api.post(
          "/auth/refresh",
          { refreshToken },
          { skipAuthRedirect: true, __isRetry: true }
        );

        const newToken = refreshResponse.data?.token;
        const newRefreshToken = refreshResponse.data?.refreshToken;

        if (!newToken) {
          throw new Error("Não foi possível renovar o token");
        }

        localStorage.setItem("token", newToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.Authorization;
        window.dispatchEvent(new Event("unauthorized"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !originalRequest?.skipAuthRedirect) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.Authorization;
      window.dispatchEvent(new Event("unauthorized"));
    }

    return Promise.reject(error);
  }
);
