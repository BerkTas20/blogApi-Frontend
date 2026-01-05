import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8090/api/v1",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
