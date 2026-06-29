import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'wanpay_access_token';
const REFRESH_KEY = 'wanpay_refresh_token';
const DEVICE_ID_KEY = 'wanpay_device_id';
const USER_KEY = 'wanpay_user';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.179:4000/api/v1';

let cachedToken: string | null = null;

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = generateUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) cachedToken = token;
  return token;
}

export async function setToken(token: string, refreshToken?: string) {
  cachedToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  }
}

export async function removeToken() {
  cachedToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function saveUser(user: any) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getSavedUser(): Promise<any | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; field?: string };
  pagination?: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}

class ApiError extends Error {
  code: string;
  field?: string;
  status: number;

  constructor(code: string, message: string, status: number, field?: string) {
    super(message);
    this.code = code;
    this.field = field;
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: any,
  authenticated = true,
  customHeaders?: Record<string, string>
): Promise<T> {
  const deviceId = await getDeviceId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-device-id': deviceId,
    ...customHeaders,
  };

  if (authenticated) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE}${path}`;


  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success || !res.ok) {
    const err = json.error || { code: 'UNKNOWN', message: 'An unexpected error occurred' };
    throw new ApiError(err.code, err.message, res.status, err.field);
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string, authenticated = true) => request<T>('GET', path, undefined, authenticated),
  post: <T>(path: string, body?: any, authenticated = true) => request<T>('POST', path, body, authenticated),
  put: <T>(path: string, body?: any, authenticated = true) => request<T>('PUT', path, body, authenticated),
  delete: <T>(path: string, authenticated = true) => request<T>('DELETE', path, undefined, authenticated),
};

export { ApiError };
