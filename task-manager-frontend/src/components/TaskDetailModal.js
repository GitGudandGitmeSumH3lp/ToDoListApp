import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { FaTimes } from 'react-icons/fa';

const categories = ['Productivity', 'Coding', 'Study', 'Personal', 'Health & Habits', 'Creative', 'Miscellaneous'];

// --- THIS IS THE CHANGE: The map now includes a 'label' for the legend ---
const priorityMap = {
  4: { color: 'bg-red-500', label: 'Urgent' },
  3: { color: 'bg-yellow-500', label: 'High' },
  2: { color: 'bg-blue-500', label: 'Medium' },
  1: { color: 'bg-gray-500', label: 'Low' },
};

const PriorityPicker = ({ selected, onSelect }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-400 mb-2">Priority</h4>
    <div className="flex items-center gap-4">
      {/* We now use a reverse() to show Urgent first */}
      {Object.entries(priorityMap).reverse().map(([p, { color, label }]) => (
        <div key={p} className="flex flex-col items-center gap-1">
          <button 
            type="button" 
            onClick={() => onSelect(parseInt(p))} 
            className={`w-6 h-6 rounded-full ${color} transition-transform hover:scale-110 ${selected === parseInt(p) ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`} 
          />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

const CategoryPicker = ({ selectedCategory, onSelectCategory }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">Category</h4>
      <select value={selectedCategory} onChange={(e) => onSelectCategory(e.target.value)} className="w-full p-2 bg-gray-900 text-gray-300 rounded-md focus:outline-none focus:border-green-400">
        {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
      </select>
    </div>
);

export default function TaskDetailModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Miscellaneous');
  const [priority, setPriority] = useState(1);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setCategory(task.category || 'Miscellaneous');
      setPriority(task.priority || 1);
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
    }
  }, [task]);

  const handleSave = () => {
    onSave(task.id, { title, category, priority, due_date: dueDate ? new Date(dueDate).toISOString() : null });
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <GlassCard className="w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FaTimes /></button>
        <div className="space-y-6">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-bold p-2 bg-transparent text-white focus:outline-none border-b border-gray-700"/>
          <CategoryPicker selectedCategory={category} onSelectCategory={setCategory} />
          <div className="pt-4 border-t border-gray-800">
            <PriorityPicker selected={priority} onSelect={setPriority} />
          </div>
          <div className="pt-4 border-t border-gray-800">
             <h4 className="text-sm font-semibold text-gray-400 mb-2">Due Date</h4>
             <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-2 w-full bg-gray-900 text-gray-300 rounded-md"/>
          </div>
          <button onClick={handleSave} className="w-full p-2 bg-green-500 text-black font-bold rounded-md hover:bg-green-400">
            Save Changes
          </button>
        </div>
      </GlassCard>
    </div>
  );
}