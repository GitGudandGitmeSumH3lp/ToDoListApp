// In src/pages/FoldersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import GlassCard from '../components/GlassCard';
import { FaPlus } from 'react-icons/fa';

export default function FoldersPage() {
  const [notebooks, setNotebooks] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    api.get('/notebooks/').then(res => setNotebooks(res.data)).catch(console.error);
  }, []);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    api.post('/notebooks/', { title: newTitle })
      .then(res => {
        setNotebooks([...notebooks, res.data]);
        setNewTitle('');
      })
      .catch(console.error);
  };

  return (
    <div>
      <form onSubmit={handleCreateFolder} className="mb-8 flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Create a new folder..." 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-grow p-3 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-md focus:outline-none focus:border-green-400"
        />
        <button type="submit" className="p-3 bg-green-400 text-black font-bold rounded-md hover:bg-green-300">
          <FaPlus />
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {notebooks.map(nb => (
          <Link to={`/folders/${nb.id}`} key={nb.id}>
            <GlassCard className="p-6 h-40 flex items-center justify-center text-center hover:border-green-400 transition-colors">
              <h3 className="font-bold text-lg">{nb.title}</h3>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}