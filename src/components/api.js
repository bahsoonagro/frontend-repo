
// Centralized axios instance
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-repo-ydwt.onrender.com/api",
  timeout: 8000,
});

export default api;
