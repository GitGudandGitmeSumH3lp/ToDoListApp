// In src/api.js
import axios from 'axios';

const API_URL = 'https://nextup-backend.onrender.com'; // <--- PASTE YOUR RENDER URL HERE

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
