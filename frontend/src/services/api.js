import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling + toast notifications
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on login/register
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }

    // Show toast for server errors (but not for auth errors — pages handle those)
    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    // Rate limit toast
    if (error.response?.status === 429) {
      toast.error("Too many requests. Please slow down.");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Predictions API
export const predictionsAPI = {
  create: (data) => api.post("/predictions", data),
  getAll: (params) => api.get("/predictions", { params }),
  getById: (id) => api.get(`/predictions/${id}`),
  getStats: () => api.get("/predictions/stats"),
};

export default api;
