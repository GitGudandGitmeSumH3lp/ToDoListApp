import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from './GlassCard';
import { FaTrash } from 'react-icons/fa';

export function Task({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // This style object is provided by dnd-kit to handle the visual movement
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // --- THE DEFINITIVE FIX IS HERE ---
  // We create a plain 'div' that will be the draggable element.
  // We apply the ref, style, and all the special dnd-kit props to THIS div.
  // The <GlassCard> now just goes inside it, for visual styling only.

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none ${isDragging ? 'z-10 opacity-80' : ''}`} // z-10 ensures it renders above other cards while dragging
    >
      <GlassCard className={`group p-3 relative ${isDragging ? 'border-green-400' : ''}`}>
        <p className="text-white font-medium text-sm">{task.title}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent the drag event from firing when clicking the button
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