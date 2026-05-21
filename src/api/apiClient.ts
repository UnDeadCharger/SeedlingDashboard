import axios from "axios";

import type { AxiosError } from "axios";
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_API_KEY = import.meta.env.VITE_API_KEY;
export const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": VITE_API_KEY || "",
  },
});

// Request interceptor — attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    switch (error.response?.status) {
      case 401:
        // Token expired — clear storage and redirect to login
        localStorage.removeItem("token");
        // window.location.href = "/login";
        break;
      case 403:
        console.error("Forbidden: You do not have permission to do this.");
        break;
      case 500:
        console.error("Server error: Please try again later.");
        break;
      default:
        break;
    }
    return Promise.reject(error);
  }
);
