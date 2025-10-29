import axios from 'axios';

let __reqId = 0; // Unique request counter

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.96.72:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🧩 Request interceptor
api.interceptors.request.use(async (config) => {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Tag request for tracking
 (config as any).__reqId = ++__reqId;
  (config as any).__startedAt = Date.now();

  return config;
});

// 🔁 Response interceptors
api.interceptors.response.use(
  (res) => {
    const cfg: any = res.config || {};
    const duration = cfg.__startedAt ? Date.now() - cfg.__startedAt : undefined;

    console.log('✅ API success', {
      id: cfg.__reqId,
      method: cfg.method?.toUpperCase(),
      url: (cfg.baseURL || '') + (cfg.url || ''),
      params: cfg.params,
      data: cfg.data,
      status: res.status,
      durationMs: duration,
    });

    return res;
  },
  (error) => {
    const cfg: any = error?.config || {};
    const resp = error?.response;
    const duration = cfg.__startedAt ? Date.now() - cfg.__startedAt : undefined;

    console.log('❌ API error', {
      id: cfg.__reqId,
      method: cfg.method?.toUpperCase(),
      url: (cfg.baseURL || '') + (cfg.url || ''),
      params: cfg.params,
      data: cfg.data,
      status: resp?.status,
      statusText: resp?.statusText,
      responseData: resp?.data,
      durationMs: duration,
    });

    return Promise.reject(error);
  }
);

export default api;
