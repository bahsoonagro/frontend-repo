// src/api.js
import axios from "axios";

// Central axios instance
const api = axios.create({
  baseURL: "https://backend-repo-ydwt.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Optional: retry interceptor (basic example)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.warn("Network error or server unreachable");
    }
    return Promise.reject(error);
  }
);

export default api;
