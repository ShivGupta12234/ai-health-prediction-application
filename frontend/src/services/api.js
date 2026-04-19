import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://healthmateai-api.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

  
    if (config.data && typeof config.data === "object") {
      try {
        const serialised = JSON.stringify(config.data);
        if (
          serialised.includes('"__proto__"') ||
          serialised.includes('"constructor"') ||
          serialised.includes('"prototype"')
        ) {
          return Promise.reject(new Error("Request blocked: invalid payload"));
        }
      } catch {
        
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  register:      (data) => api.post("/auth/register", data),
  login:         (data) => api.post("/auth/login", data),
  googleAuth:    (data) => api.post("/auth/google", data),
  getProfile:    ()     => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};


export const predictionsAPI = {
  create:   (data) => api.post("/predictions", data),
  getAll:   ()     => api.get("/predictions"),
  getById:  (id)   => api.get(`/predictions/${id}`),
  getStats: ()     => api.get("/predictions/stats"),
};

export default api;
