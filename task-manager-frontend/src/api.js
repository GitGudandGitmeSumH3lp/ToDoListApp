// In src/api.js
import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';
const localApiUrl = 'http://127.0.0.1:8000';
const productionApiUrl = 'https://nextup-backend-tmts.onrender.com'; 

const API_URL = isProduction ? productionApiUrl : localApiUrl;

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor correctly adds the login token to every request.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
