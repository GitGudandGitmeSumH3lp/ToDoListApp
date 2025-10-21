// In src/components/CreateListForm.js
import React, { useState } from 'react';

export default function CreateListForm({ onListCreated }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onListCreated({ title });
    setTitle('');
  };

  return (
    <div className="bg-gray-900 p-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="+ Add another list"
          className="w-full p-2 bg-gray-800 text-white text-sm placeholder-gray-500 border-2 border-transparent focus:outline-none focus:border-green-400 transition-colors"
        />
      </form>
    </div>
  );
}