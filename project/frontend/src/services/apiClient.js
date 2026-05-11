import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TIMEOUT } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
});

// Add token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request for debugging
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log errors for debugging
    console.log('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
