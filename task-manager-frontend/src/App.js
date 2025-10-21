// In src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './authcontext'; // <-- Correctly imports from authcontext
import Login from './components/Login';
import TasksPage from './pages/TasksPage';
import FoldersPage from './pages/FoldersPage';
import FolderDetailPage from './pages/FolderDetailPage';
import Layout from './components/Layout';

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
        {/* The root path "/" will now intelligently redirect */}
        <Route path="/" element={<Navigate to="/tasks" />} />
        
        {/* The login page has its own special logic */}
        <Route path="/login" element={<LoginPage />} />

        {/* These routes are protected and wrapped in the shared Layout */}
        <Route path="/tasks" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
        <Route path="/folders" element={<ProtectedRoute><Layout><FoldersPage /></Layout></ProtectedRoute>} />
        <Route path="/folders/:folderId" element={<ProtectedRoute><Layout><FolderDetailPage /></Layout></ProtectedRoute>} />
        
        {/* A catch-all route for any other path */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// THIS LINE IS CRITICAL and fixes the error
export default App;