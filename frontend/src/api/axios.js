// api/axios.js
import axios from "axios";
import { clearStoredToken, getStoredToken } from "../utils/authStorage.js";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
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
    const isBannedResponse =
      status === 403 && message.toLowerCase().includes("you have been banned");

    if (status === 401 || isBannedResponse) {
      const isAuthRoute = window.location.pathname.startsWith("/auth");
      const isResolverCall = error.config?.url?.includes("/users/me");

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
