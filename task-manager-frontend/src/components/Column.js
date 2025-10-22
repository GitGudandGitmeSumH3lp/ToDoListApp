// In src/components/Column.js
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from './Task'; // Assuming Task.js is in the same folder
import GlassCard from './GlassCard';

export function Column({ id, title, tasks, onDeleteTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <GlassCard className="p-4 flex flex-col">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <div 
        ref={setNodeRef} 
        className={`space-y-3 min-h-[300px] flex-grow rounded-sm transition-colors p-2 ${isOver ? 'bg-white bg-opacity-10' : ''}`}
      >
        {/* We need to tell SortableContext what the IDs of the items are */}
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {/* Now we map over the tasks and pass the FULL task object to the Task component */}
          {tasks.map(task => (
            <Task 
              key={task.id} 
              task={task} // <-- THIS IS THE CRITICAL FIX
              onDelete={onDeleteTask} 
              onEdit={onEditTask} 
            />
          ))}
        </SortableContext>
      </div>
    </GlassCard>
  );
}