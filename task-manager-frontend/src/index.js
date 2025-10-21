// In src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './authcontext'; // Import the provider

const root = ReactDOM.createRoot(document.getElementById('root'));

// THE FIX IS HERE: We wrap the entire <App /> inside the <AuthProvider>.
// This makes the authentication state (token, login function, etc.) available
// to every single component in your application.
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);