import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from './GlassCard';
import { FaTrash } from 'react-icons/fa';

export function Task({ task, onDelete }) { // Changed 'id' and 'title' props to the whole 'task' object
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? 'z-10 opacity-80' : ''}`}
    >
      <GlassCard className={`group p-3 relative ${isDragging ? 'border-green-400' : ''}`}>
        
        {/* --- THIS IS THE CRITICAL CHANGE --- */}
        {/* We check if task.status is 'DONE'. If so, we add strikethrough and faded text classes. */}
        <p className={`text-white font-medium text-sm ${task.status === 'DONE' ? 'line-through decoration-7 decoration-white-500 text-gray-500' : ''}`}>
          {task.title}
        </p>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }} 
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaTrash size={12}/>
        </button>
      </GlassCard>
    </div>
  );
}