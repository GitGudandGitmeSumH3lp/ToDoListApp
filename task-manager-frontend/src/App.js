// In src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './authcontext';
import Login from './components/Login';
import Layout from './components/Layout';
import TasksPage from './pages/TasksPage';
import FoldersPage from './pages/FoldersPage';
import FolderDetailPage from './pages/FolderDetailPage';

// A special component to protect routes. If there's no token, it redirects to /login.
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// A special component for the login page. If a token exists, it redirects to /tasks.
function LoginPage() {
    const { token } = useAuth();
    return token ? <Navigate to="/tasks" replace /> : <Login />;
}

// THIS IS THE MAIN APP COMPONENT
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
        <Route path="/folders" element={<ProtectedRoute><Layout><FoldersPage /></Layout></ProtectedRoute>} />
        <Route path="/folders/:folderId" element={<ProtectedRoute><Layout><FolderDetailPage /></Layout></ProtectedRoute>} />
        {/* The '/profile' route is now GONE */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// THIS LINE IS CRITICAL and fixes the error
export default App;