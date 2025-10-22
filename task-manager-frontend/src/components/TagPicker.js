// In src/components/TagPicker.js
import React from 'react';

const availableTags = [
  'Productivity', 'Work', 'Meeting', 'Report', 'Email',
  'Coding', 'Bugfix', 'Feature', 'Testing',
  'Study', 'Research', 'Course',
  'Personal', 'Appointment', 'Errand', 'Shopping',
  'Health', 'Fitness', 'Workout',
  'Creative', 'Design', 'Brainstorming',
  'Follow-up', 'Miscellaneous'
];

export default function TagPicker({ selectedTags, onToggleTag }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">Quick Descriptions</h4>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                isSelected
                  ? 'bg-green-500 text-black font-semibold'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}