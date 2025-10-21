// In src/components/Layout.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../authcontext';
import logo from '../assets/logo.svg'; // 1. Import your new SVG logo

const TopNavBar = () => {
  const { logout } = useAuth();
  const activeLinkStyle = {
    color: '#FFFFFF',
    borderBottom: '2px solid #34D399'
  };

  return (
    <nav className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
      
      {/* 2. Replace the <h1> text with this <img> tag */}
      <img src={logo} alt="NextUp Logo" className="h-7" /> {/* Adjust height (h-7, h-8, etc.) as needed */}

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