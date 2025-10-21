import React, { useState } from 'react';

export default function CreateTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onTaskCreated({ title });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="+ Add a new task"
        className="w-full p-2 bg-black bg-opacity-40 text-white text-sm placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-green-400 rounded-md transition-colors"
      />
    </form>
  );
}