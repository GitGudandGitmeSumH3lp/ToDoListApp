// In src/components/Layout.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../authcontext';

const TopNavBar = () => {
  const { logout } = useAuth();
  // Style for the active navigation link, matching your sketch
  const activeLinkStyle = {
    color: '#FFFFFF', // White text
    borderBottom: '2px solid #34D399' // Green underline
  };

  return (
    <nav className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-white tracking-widest">NEXTUP.</h1>
      <div className="flex items-center space-x-8">
        <NavLink to="/tasks" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-400 hover:text-white pb-2 transition-colors">TASKS</NavLink>
        <NavLink to="/folders" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-400 hover:text-white pb-2 transition-colors">FOLDERS</NavLink>
      </div>
      <button onClick={logout} className="px-4 py-2 font-semibold text-sm tracking-wider text-gray-400 border border-gray-600 hover:bg-gray-800">LOG OUT</button>
    </nav>
  );
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <TopNavBar />
        <main>{children}</main>
      </div>
    </div>
  );
}