// api/axios.js
import axios from "axios";
import { clearStoredToken, getStoredToken } from "../utils/authStorage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const requestUrl = error.config?.url || "";
    const isBannedResponse =
      status === 403 && message.toLowerCase().includes("you have been banned");
    const isUserSessionCheck = requestUrl.includes("/users/me");
    const shouldForceLogout = isBannedResponse || (status === 401 && isUserSessionCheck);

    if (shouldForceLogout) {
      const isAuthRoute = window.location.pathname.startsWith("/auth");
      const isResolverCall = isUserSessionCheck;

      if (!isAuthRoute && !isResolverCall) {
        clearStoredToken();
        window.location.href = "/auth/login";
      } else {
        clearStoredToken();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
