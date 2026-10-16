import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const clearAuthState = () => {
  delete api.defaults.headers.Authorization;
};

const handleUnauthorized = () => {
  clearAuthState();
  window.dispatchEvent(new Event("unauthorized"));
};

api.interceptors.request.use((config) => {
  const csrfToken = readCookie("csrf_token");
  const method = (config.method || "get").toUpperCase();

  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?.__isRetry && !originalRequest?.skipAuthRedirect) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((refreshError) => Promise.reject(refreshError));
      }

      isRefreshing = true;

      try {
        await api.post(
          "/auth/refresh",
          {},
          { skipAuthRedirect: true, __isRetry: true }
        );

        processQueue();

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const status = refreshError?.response?.status;

        if (status === 401 || status === 403) {
          handleUnauthorized();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !originalRequest?.skipAuthRedirect) {
      handleUnauthorized();
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
