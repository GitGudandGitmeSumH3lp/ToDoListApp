import React, { useState, useEffect } from 'react';
import api from '../api';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Column } from '../components/Column';
import { FaPlus } from 'react-icons/fa';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    api.get('/notes/').then(res => setTasks(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    api.post('/notes/', { title: newNoteTitle })
      .then(res => setTasks(currentTasks => [...currentTasks, res.data]))
      .catch(console.error)
      .finally(() => setNewNoteTitle(''));
  };

  const handleDeleteNote = (taskId) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    // Assuming you have a delete endpoint
    api.delete(`/notes/${taskId}`).catch(console.error); 
  };
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      const activeId = active.id;
      const newStatus = over.id; // The ID of the column we dropped into

      setTasks((currentTasks) => {
        return currentTasks.map(task => {
          if (task.id === activeId) {
            return { ...task, status: newStatus };
          }
          return task;
        });
      });

      api.put(`/notes/${activeId}/status`, { status: newStatus }).catch(console.error);
    }
  };

  if (loading) return <p className="text-center text-gray-400">Loading tasks...</p>;

  const columns = ["TO DO", "ONGOING", "DONE"];
  
  return (
    <div>
      <form onSubmit={handleCreateNote} className="mb-8 flex items-center gap-4">
        <input 
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="Create a new quick-task..."
          className="flex-grow p-3 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-md focus:outline-none focus:border-green-400"
        />
        <button type="submit" className="p-3 bg-green-400 text-black font-bold rounded-md hover:bg-green-300">
          <FaPlus />
        </button>
      </form>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(columnId => (
            <Column 
              key={columnId} 
              id={columnId} 
              title={columnId} 
              tasks={tasks.filter(task => task.status === columnId)}
              onDeleteTask={handleDeleteNote}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}