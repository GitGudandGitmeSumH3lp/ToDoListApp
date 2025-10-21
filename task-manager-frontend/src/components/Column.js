// In src/components/Column.js
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from './Task';
import GlassCard from './GlassCard';

export function Column({ id, title, tasks, onDeleteTask }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <GlassCard className="p-4 flex flex-col">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <div 
        ref={setNodeRef} 
        className="space-y-3 min-h-[300px] flex-grow rounded-sm transition-colors p-2"
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <Task key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>
    </GlassCard>
  );
}