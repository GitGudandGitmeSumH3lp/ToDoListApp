// In src/components/UserMenu.js
import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';

export default function UserMenu({ user, onProfileClick, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-gray-300 hover:text-white">
        <FaUserCircle size={24} />
        <span className="font-semibold">{user?.username || user?.email.split('@')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
          <button onClick={() => { onProfileClick(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</button>
          <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Log Out</button>
        </div>
      )}
    </div>
  );
}