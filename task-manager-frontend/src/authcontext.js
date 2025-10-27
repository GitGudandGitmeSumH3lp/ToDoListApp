import React, { createContext, useState, useContext } from 'react';
import api from './api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
const [token, setToken] = useState(localStorage.getItem('accessToken'));
const login = async (email, password) => {
const params = new URLSearchParams();
params.append('username', email);
params.append('password', password);
const response = await api.post('/token', params);

if (response.data && response.data.access_token) {
  const new_token = response.data.access_token;
  localStorage.setItem('accessToken', new_token);
  setToken(new_token);
}
};
const signup = async (email, password) => {
await api.post('/users/', { email, password });
await login(email, password);
};
const logout = () => {
localStorage.removeItem('accessToken');
setToken(null);
};
return (
<AuthContext.Provider value={{ token, login, signup, logout }}>
{children}
</AuthContext.Provider>
);
};
export const useAuth = () => useContext(AuthContext);