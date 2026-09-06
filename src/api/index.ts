import axios from "axios";

// Axios instance for the Node.js/Express backend.
// JWT is attached to every request when present.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("invest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("invest_token");
      localStorage.removeItem("invest_user");
    }
    return Promise.reject(err);
  }
);

// ── Helpers ──
function errMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message;
  }
  return err instanceof Error ? err.message : "Request failed";
}

const API_AVAILABLE_KEY = "invest_api_available";

export function markApiAvailable() {
  localStorage.setItem(API_AVAILABLE_KEY, "1");
}
export function isBackendConfigured() {
  return Boolean(import.meta.env.VITE_API_URL) || localStorage.getItem(API_AVAILABLE_KEY) === "1";
}

// ── Auth ──
export async function login(email: string, password: string) {
  try {
    const res = await apiClient.post("/auth/login", { email, password });
    markApiAvailable();
    localStorage.setItem("invest_token", res.data.token);
    localStorage.setItem("invest_user", JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    throw new Error(errMessage(err));
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const res = await apiClient.post("/auth/register", { name, email, password });
    markApiAvailable();
    localStorage.setItem("invest_token", res.data.token);
    localStorage.setItem("invest_user", JSON.stringify(res.data.user));
    return res.data;
  } catch (err) {
    throw new Error(errMessage(err));
  }
}

export function logout() {
  localStorage.removeItem("invest_token");
  localStorage.removeItem("invest_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("invest_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem("invest_token");
}

// ── Domain API calls (used when the backend is reachable) ──
export async function fetchCases() {
  const res = await apiClient.get("/cases");
  return res.data.cases;
}
export async function createCase(payload: { name: string; description?: string; location?: string }) {
  const res = await apiClient.post("/cases", payload);
  return res.data.case;
}
export async function fetchEntities(params: Record<string, string> = {}) {
  const res = await apiClient.get("/entities", { params });
  return res.data.entities;
}
export async function fetchRelationships(params: Record<string, string> = {}) {
  const res = await apiClient.get("/relationships", { params });
  return res.data.relationships;
}
export async function fetchAlerts() {
  const res = await apiClient.get("/alerts");
  return res.data.alerts;
}
export async function updateAlertStatusApi(id: string, status: string) {
  const res = await apiClient.patch(`/alerts/${id}/status`, { status });
  return res.data;
}
export async function fetchTimeline(params: Record<string, string> = {}) {
  const res = await apiClient.get("/timeline", { params });
  return res.data.events;
}
export async function fetchMapData(caseId?: string) {
  const res = await apiClient.get("/map-data", { params: caseId ? { caseId } : {} });
  return res.data.locations;
}
export async function fetchNetwork(caseId: string) {
  const res = await apiClient.get(`/network/${caseId}`);
  return res.data;
}
export async function fetchEvidence(id: string) {
  const res = await apiClient.get(`/evidence/${id}`);
  return res.data.evidence;
}
export async function generateReport(caseId: string) {
  const res = await apiClient.post("/reports/generate", { caseId });
  return res.data.report as string;
}
export async function uploadFile(file: File, category: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  const res = await apiClient.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return res.data.file;
}
export async function startAnalysis(fileIds: string[], caseId?: string, caseName?: string) {
  const res = await apiClient.post("/analysis/start", { fileIds, caseId, caseName });
  return res.data.jobId as string;
}
export async function getAnalysisJob(jobId: string) {
  const res = await apiClient.get(`/analysis/${jobId}`);
  return res.data.job;
}
export async function getAnalysisResults(jobId: string) {
  const res = await apiClient.get(`/analysis/${jobId}/results`);
  return res.data;
}
