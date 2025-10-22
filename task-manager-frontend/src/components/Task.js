// In src/components/Task.js
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from './GlassCard';
import { FaTrash, FaCalendarAlt } from 'react-icons/fa';

// --- THIS IS THE FOOLPROOF COLOR SOLUTION ---
// We define a map of the actual HEX color codes.
const priorityColorMap = {
  4: '#EF4444', // Red-500
  3: '#F59E0B', // Yellow-500
  2: '#3B82F6', // Blue-500
  1: '#6B7280', // Gray-500
};

// ... (getDueDateInfo function is the same, no changes needed) ...
const getDueDateInfo = (dueDateStr) => {
    if (!dueDateStr) return null;
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    let colorClass = 'text-gray-500';
    if (dueDate < today) colorClass = 'text-red-500';
    else if (dueDate.getTime() === today.getTime()) colorClass = 'text-yellow-500';
    const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { colorClass, formattedDate };
};


export function Task({ task, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  // dnd-kit style for movement
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const priorityColor = priorityColorMap[task.priority] || '#4B5563'; // Default to a neutral gray
  const dueDateInfo = getDueDateInfo(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      className={`touch-none cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <GlassCard className="group p-3 relative flex flex-col justify-between">
        
        {/* The priority color is now an inline style on a dedicated element. This CANNOT fail. */}
        <div 
            className="absolute top-0 left-0 h-full w-1 rounded-l-lg"
            style={{ backgroundColor: priorityColor }}
        ></div>

        {/* Main content area, with padding to not overlap the color bar */}
        <div className="pl-3">
          <p className={`text-white font-medium text-sm ${task.status === 'DONE' ? 'line-through decoration-2 text-gray-500' : ''}`}>
            {task.title}
          </p>
        </div>
        
        {/* Footer for metadata, keeping the card compact */}
        <div className="flex items-center justify-between mt-2 min-h-[1rem] pl-3">
          {task.category && task.category !== 'Miscellaneous' ? (
            <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full">{task.category}</span>
          ) : <div />}
          
          {dueDateInfo && (
            <div className={`flex items-center gap-1.5 ${dueDateInfo.colorClass}`}>
              <FaCalendarAlt size={10} />
              <span className="text-xs font-semibold">{dueDateInfo.formattedDate}</span>
            </div>
          )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaTrash size={12}/>
        </button>
      </GlassCard>
    </div>
  );
}