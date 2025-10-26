// In src/components/Layout.js
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';
import UserMenu from './UserMenu'; // We will create this next
import ProfileModal from './ProfileModal'; // Import the new modal
import logo from '../assets/logo.svg';
import { useAuth } from '../authcontext';

const TopNavBar = ({ user, onProfileClick, onLogout }) => {
  const activeLinkStyle = { color: '#FFFFFF', borderBottom: '2px solid #34D399' };
  return (
    <nav className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
      <img src={logo} alt="NextUp Logo" className="h-7" />
      <div className="flex items-center space-x-8">
        <NavLink to="/tasks" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-400 hover:text-white pb-2 transition-colors">TASKS</NavLink>
        <NavLink to="/folders" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-400 hover:text-white pb-2 transition-colors">FOLDERS</NavLink>
      </div>
      <UserMenu user={user} onProfileClick={onProfileClick} onLogout={onLogout} />
    </nav>
  );
};

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { logout } = useAuth(); // Assuming useAuth is in another file

  const fetchUser = useCallback(() => {
    api.get('/me').then(res => setUser(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <TopNavBar user={user} onProfileClick={() => setIsProfileModalOpen(true)} onLogout={logout} />
        <main>{children}</main>
        <ProfileModal 
            isOpen={isProfileModalOpen} 
            onClose={() => setIsProfileModalOpen(false)}
            onProfileUpdate={fetchUser} // Pass the fetchUser function to the modal
        />
      </div>
    </div>
  );
}