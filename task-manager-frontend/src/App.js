import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './authcontext';
import Login from './components/Login';
import Layout from './components/Layout';
import TasksPage from './pages/TasksPage';
import FoldersPage from './pages/FoldersPage';
import FolderDetailPage from './pages/FolderDetailPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function LoginPage() {
  const { token } = useAuth();
  return token ? <Navigate to="/tasks" replace /> : <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
        <Route path="/folders" element={<ProtectedRoute><Layout><FoldersPage /></Layout></ProtectedRoute>} />
        <Route path="/folders/:folderId" element={<ProtectedRoute><Layout><FolderDetailPage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;