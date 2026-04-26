import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const MaterialsAPI = {
  list: () => api.get("/materials").then((r) => r.data),
  create: (data) => api.post("/materials", data).then((r) => r.data),
  update: (id, data) => api.put(`/materials/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/materials/${id}`).then((r) => r.data),
};

export const SettingsAPI = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (data) => api.put("/settings", data).then((r) => r.data),
};

export const QuotesAPI = {
  list: () => api.get("/quotes").then((r) => r.data),
  get: (id) => api.get(`/quotes/${id}`).then((r) => r.data),
  create: (data) => api.post("/quotes", data).then((r) => r.data),
  remove: (id) => api.delete(`/quotes/${id}`).then((r) => r.data),
};

export default api;
