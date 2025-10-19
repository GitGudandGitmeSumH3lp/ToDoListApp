// src/authcontext.js
import React, { createContext, useState, useContext } from 'react';
import api, { signup as apiSignup } from './api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  const login = async (email, password) => {
    // FastAPI's token endpoint expects form data, not JSON
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/token', params);
    localStorage.setItem('accessToken', response.data.access_token);
    setToken(response.data.access_token);
    // You would typically fetch user details here as well
  };

    // NEW SIGNUP FUNCTION
  const signup = async (email, password) => {
    // 1. Create the new user account
    await apiSignup({ email, password });
    // 2. Immediately log the new user in
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ This must be at the top level, outside the AuthProvider
export const useAuth = () => useContext(AuthContext);