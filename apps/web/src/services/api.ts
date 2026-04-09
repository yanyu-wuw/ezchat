import { useAuthStore } from "../store/authStore";

const API_BASE_URL = "http://localhost:3000/api";

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  requiresAuth?: boolean;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, requiresAuth = true } = options;
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requiresAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return await response.json();
}

// Auth API
export const authAPI = {
  register: (email: string, password: string, username: string, role: string) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: { email, password, username, role },
      requiresAuth: false,
    }),
  login: (email: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  refresh: () => apiFetch("/auth/refresh", { method: "POST" }),
};

// User API
export const userAPI = {
  getAll: () => apiFetch("/users"),
  getById: (id: string) => apiFetch(`/users/${id}`),
  update: (id: string, data: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
  getProfile: (id: string) => apiFetch(`/users/${id}/profile`),
};

// Consultation API
export const consultationAPI = {
  ask: (question: string) =>
    apiFetch("/consultation/ask", { method: "POST", body: { question } }),
  getHistory: () => apiFetch("/consultation/history"),
  getById: (id: string) => apiFetch(`/consultation/${id}`),
  sendFeedback: (id: string, rating: number) =>
    apiFetch(`/consultation/${id}/feedback`, {
      method: "POST",
      body: { rating },
    }),
};

// Content API
export const contentAPI = {
  getKnowledge: () => apiFetch("/content/knowledge", { requiresAuth: false }),
  createKnowledge: (title: string, content: string, category: string) =>
    apiFetch("/content/knowledge", {
      method: "POST",
      body: { title, content, category },
    }),
  updateKnowledge: (id: string, data: any) =>
    apiFetch(`/content/knowledge/${id}`, { method: "PUT", body: data }),
  deleteKnowledge: (id: string) =>
    apiFetch(`/content/knowledge/${id}`, { method: "DELETE" }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiFetch("/analytics/dashboard"),
  getUserProgress: (id: string) => apiFetch(`/analytics/user-progress/${id}`),
  getAIPerformance: () => apiFetch("/analytics/ai-performance"),
};

// AI Config API
export const aiAPI = {
  getConfig: () => apiFetch("/ai/config", { requiresAuth: false }),
  updateConfig: (data: any) =>
    apiFetch("/ai/config", { method: "POST", body: data }),
};

// Health Check
export const healthCheck = () => apiFetch("/health", { requiresAuth: false });
