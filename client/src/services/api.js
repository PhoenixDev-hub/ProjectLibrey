import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const api = axios.create({
    baseURL: apiURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.replace("/")
    }
    return Promise.reject(error)
  }
)
