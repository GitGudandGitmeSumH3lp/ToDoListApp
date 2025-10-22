// In src/components/CategoryPicker.js
import React from 'react';

const categories = [
  'Productivity', 'Coding', 'Study', 'Personal', 
  'Health & Habits', 'Creative', 'Miscellaneous'
];

export default function CategoryPicker({ selectedCategory, onSelectCategory }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">Category</h4>
      <select
        value={selectedCategory}
        onChange={(e) => onSelectCategory(e.target.value)}
        className="w-full p-2 bg-gray-900 text-gray-300 rounded-md focus:outline-none focus:border-green-400"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}