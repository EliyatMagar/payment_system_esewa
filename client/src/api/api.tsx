// api.ts
import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - check if server is running");
    } else if (error.response?.status === 401) {
      localStorage.removeItem("token");
      console.error("Authentication failed - redirecting to login");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("Access forbidden - insufficient permissions");
    } else if (error.response?.status === 404) {
      console.error("Resource not found");
    }
    return Promise.reject(error);
  }
);

export default api;
