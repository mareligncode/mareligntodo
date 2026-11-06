import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_TOKEN = '@marelign_todo_token';
const STORAGE_KEY_API_URL = '@marelign_todo_api_url';

const formatApiUrl = (url?: string | null): string | null => {
  if (!url) return null;
  let clean = url.trim();
  if (clean.endsWith('/')) clean = clean.slice(0, -1);
  if (!clean.endsWith('/api')) clean = `${clean}/api`;
  return clean;
};

// Check env variables first (Expo public vars, user-provided ngrok in .env, or platform fallback)
const ENV_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_NGROK_URL ||
  process.env.BACKEND_NGORK_URL ||
  'https://myong-inapproachable-oliva.ngrok-free.dev';

export const DEFAULT_API_URL =
  formatApiUrl(ENV_URL) ||
  Platform.select({
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api',
  });

let currentApiUrl = DEFAULT_API_URL;

// SSR-safe storage helpers (prevents ReferenceError: window is not defined during web bundling/SSR)
const isBrowser = typeof window !== 'undefined';

const safeGetItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web' && !isBrowser) return null;
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web' && !isBrowser) return;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
};

const safeRemoveItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web' && !isBrowser) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

// Lazily load custom API URL only on the client
export const initApiUrl = async () => {
  const saved = await safeGetItem(STORAGE_KEY_API_URL);
  if (saved) currentApiUrl = formatApiUrl(saved) || saved;
  return currentApiUrl;
};

export const setCustomApiUrl = async (url: string) => {
  const formatted = formatApiUrl(url) || url.trim();
  currentApiUrl = formatted;
  await safeSetItem(STORAGE_KEY_API_URL, currentApiUrl);
};

export const getCustomApiUrl = () => currentApiUrl;

export const getStoredToken = async (): Promise<string | null> => {
  return safeGetItem(STORAGE_KEY_TOKEN);
};

export const setStoredToken = async (token: string): Promise<void> => {
  await safeSetItem(STORAGE_KEY_TOKEN, token);
};

export const removeStoredToken = async (): Promise<void> => {
  await safeRemoveItem(STORAGE_KEY_TOKEN);
};

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypasses ngrok free tier browser warning
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let url = `${currentApiUrl}${endpoint}`;
  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

// ---------------- API MODULES ---------------- //

export const authApi = {
  register: (body: { fullName: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  updateProfile: (body: any) => request('/auth/update-profile', { method: 'PUT', body }),
  changePassword: (body: any) => request('/auth/change-password', { method: 'PUT', body }),
};

export const settingsApi = {
  getSettings: () => request('/settings'),
  updateSettings: (body: any) => request('/settings', { method: 'PUT', body }),
};

export const tasksApi = {
  getAll: (params?: Record<string, any>) => request('/tasks', { params }),
  getById: (id: string) => request(`/tasks/${id}`),
  create: (body: any) => request('/tasks', { method: 'POST', body }),
  update: (id: string, body: any) => request(`/tasks/${id}`, { method: 'PUT', body }),
  updateStatus: (id: string, status: string) =>
    request(`/tasks/${id}/status`, { method: 'PATCH', body: { status } }),
  delete: (id: string, permanent = false) =>
    request(`/tasks/${id}`, { method: 'DELETE', params: { permanent } }),
  addChecklist: (taskId: string, body: { text: string; position?: number }) =>
    request(`/tasks/${taskId}/checklist`, { method: 'POST', body }),
  updateChecklist: (taskId: string, itemId: string, body: any) =>
    request(`/tasks/${taskId}/checklist/${itemId}`, { method: 'PUT', body }),
  deleteChecklist: (taskId: string, itemId: string) =>
    request(`/tasks/${taskId}/checklist/${itemId}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: (includeArchived = false) => request('/categories', { params: { includeArchived } }),
  create: (body: { name: string; color?: string; icon?: string }) =>
    request('/categories', { method: 'POST', body }),
  update: (id: string, body: any) => request(`/categories/${id}`, { method: 'PUT', body }),
  delete: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),
};

export const tagsApi = {
  getAll: () => request('/tags'),
  create: (body: { name: string; color?: string }) => request('/tags', { method: 'POST', body }),
  delete: (id: string) => request(`/tags/${id}`, { method: 'DELETE' }),
};

export const remindersApi = {
  getAll: (params?: any) => request('/reminders', { params }),
  create: (body: any) => request('/reminders', { method: 'POST', body }),
  update: (id: string, body: any) => request(`/reminders/${id}`, { method: 'PUT', body }),
  snooze: (id: string, minutes = 15) =>
    request(`/reminders/${id}/snooze`, { method: 'PATCH', body: { minutes } }),
  delete: (id: string) => request(`/reminders/${id}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  getAll: (unreadOnly = false) => request('/notifications', { params: { unreadOnly } }),
  markAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  delete: (id: string) => request(`/notifications/${id}`, { method: 'DELETE' }),
};

export const commentsApi = {
  getByTask: (taskId: string) => request(`/comments/task/${taskId}`),
  create: (taskId: string, body: { body: string }) =>
    request(`/comments/task/${taskId}`, { method: 'POST', body }),
  delete: (id: string) => request(`/comments/${id}`, { method: 'DELETE' }),
};

export const goalsApi = {
  getAll: (status?: string) => request('/goals', { params: { status } }),
  create: (body: any) => request('/goals', { method: 'POST', body }),
  update: (id: string, body: any) => request(`/goals/${id}`, { method: 'PUT', body }),
  updateProgress: (id: string, delta: number) =>
    request(`/goals/${id}/progress`, { method: 'PATCH', body: { delta } }),
  delete: (id: string) => request(`/goals/${id}`, { method: 'DELETE' }),
};

export const habitsApi = {
  getAll: (today?: string) => request('/habits', { params: { today } }),
  getById: (id: string) => request(`/habits/${id}`),
  create: (body: any) => request('/habits', { method: 'POST', body }),
  update: (id: string, body: any) => request(`/habits/${id}`, { method: 'PUT', body }),
  delete: (id: string) => request(`/habits/${id}`, { method: 'DELETE' }),
  recordEntry: (habitId: string, body: { localDate: string; completedCount?: number; note?: string }) =>
    request(`/habits/${habitId}/entries`, { method: 'POST', body }),
  deleteEntry: (habitId: string, localDate: string) =>
    request(`/habits/${habitId}/entries/${localDate}`, { method: 'DELETE' }),
};

export const syncApi = {
  getState: () => request('/sync/state'),
  pull: (since?: string) => request('/sync/pull', { params: { since } }),
  push: (operations: any[]) => request('/sync/push', { method: 'POST', body: { operations } }),
};

export default {
  auth: authApi,
  settings: settingsApi,
  tasks: tasksApi,
  categories: categoriesApi,
  tags: tagsApi,
  reminders: remindersApi,
  notifications: notificationsApi,
  comments: commentsApi,
  goals: goalsApi,
  habits: habitsApi,
  sync: syncApi,
};
