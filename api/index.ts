import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.96.72:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // Add auth token from AsyncStorage if needed
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const { config, response } = error || {};
    try {
      console.log('API error', {
        method: config?.method,
        url: (config?.baseURL || '') + (config?.url || ''),
        status: response?.status,
        data: response?.data,
      });
    } catch {}
    return Promise.reject(error);
  }
);

export default api;