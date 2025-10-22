// In src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your Flask backend address
});

// This is an "interceptor". It's a piece of code that runs BEFORE every single API request.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from local storage.
    const token = localStorage.getItem('accessToken');
    
    // 2. If the token exists, add it to the 'Authorization' header.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Send the request on its way.
    return config;
  },
  (error) => {
    // If there's an error setting up the request, reject the promise.
    return Promise.reject(error);
  }
);

export default api;