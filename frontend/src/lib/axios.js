import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // timeout sau 30 giây
});

// Thêm token vào header của mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự động retry khi request thất bại (tối đa 2 lần)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    const config = error.config;
    if (!config || config._retryCount >= 2) {
      return Promise.reject(error);
    }
    config._retryCount = (config._retryCount || 0) + 1;
    console.log(`Đang thử lại lần ${config._retryCount}...`);
    await new Promise((r) => setTimeout(r, 1000)); // đợi 1 giây
    return api(config);
  }
);

export default api;
