import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ SIN barra diagonal al final
const API_BASE_URL = 'https://api-hackaton-lambayeque.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado a 15 segundos por si el servidor es lento
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;