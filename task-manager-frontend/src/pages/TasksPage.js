import React, { useState, useEffect } from 'react';
import api from '../api';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Column } from '../components/Column';
import TaskDetailModal from '../components/TaskDetailModal';
import { FaPlus } from 'react-icons/fa';

export default function TasksPage() {
  // --- STATE IS NOW AN OBJECT OF COLUMNS ---
  // This is the standard, robust pattern for multi-column dnd.
  const [columns, setColumns] = useState({
    "TO DO": [], "ONGOING": [], "DONE": [],
  });
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    api.get('/notes/').then(res => {
      const newColumns = { "TO DO": [], "ONGOING": [], "DONE": [] };
      res.data.forEach(task => { if (newColumns[task.status]) newColumns[task.status].push(task); });
      for (const key in newColumns) {
          // Sort each column by priority on initial load
          newColumns[key].sort((a, b) => b.priority - a.priority);
      }
      setColumns(newColumns);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    api.post('/notes/', { title: newNoteTitle, priority: 1, category: 'Miscellaneous' })
      .then(res => {
        const newNote = res.data;
        setColumns(currentCols => ({
          ...currentCols,
          [newNote.status]: [newNote, ...currentCols[newNote.status]]
        }));
        setNewNoteTitle('');
      })
      .catch(console.error);
  };

  const handleDeleteNote = (taskId, status) => {
    api.delete(`/notes/${taskId}`).catch(console.error);
    setColumns(currentCols => ({
      ...currentCols,
      [status]: currentCols[status].filter(task => task.id !== taskId)
    }));
  };
  
  const handleSaveTask = (taskId, updatedData) => {
    api.put(`/notes/${taskId}`, updatedData)
      .then(() => {
        // Simple refetch on save is the safest way to handle potential status/priority changes
        api.get('/notes/').then(res => {
            const newColumns = { "TO DO": [], "ONGOING": [], "DONE": [] };
            res.data.forEach(task => { if (newColumns[task.status]) newColumns[task.status].push(task); });
            for (const key in newColumns) { newColumns[key].sort((a, b) => b.priority - a.priority); }
            setColumns(newColumns);
        });
        setSelectedTask(null);
      })
      .catch(console.error);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // --- THIS IS THE FINAL, BULLETPROOF onDragEnd LOGIC ---
  const findColumnOfTask = (taskId) => {
    for (const columnId in columns) {
      if (columns[columnId].some(task => task.id === taskId)) {
        return columnId;
      }
    }
    return null;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return; // Safety net for dropping outside
    
    const activeId = active.id;
    const overId = over.id;
    const sourceColumnId = findColumnOfTask(activeId);
    
    // Determine if we are dropping on a column or another task
    const destColumnId = columns[overId] ? overId : findColumnOfTask(overId);

    if (!sourceColumnId || !destColumnId) return; // Safety net

    const activeTask = columns[sourceColumnId].find(t => t.id === activeId);
    
    // --- Logic for moving between DIFFERENT columns ---
    if (sourceColumnId !== destColumnId) {
      setColumns(currentCols => {
        const sourceItems = currentCols[sourceColumnId].filter(t => t.id !== activeId);
        const destItems = [...currentCols[destColumnId], { ...activeTask, status: destColumnId }].sort((a,b) => b.priority - a.priority);
        return {
          ...currentCols,
          [sourceColumnId]: sourceItems,
          [destColumnId]: destItems,
        };
      });
      api.put(`/notes/${activeId}/status`, { status: destColumnId }).catch(console.error);
    }
    // (Reordering within the same column is disabled for simplicity and to enforce auto-sorting)
  };

  if (loading) return <p className="text-center text-gray-400">Loading tasks...</p>;
  
  return (
    <>
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onSave={handleSaveTask} />
      <div>
        <form onSubmit={handleCreateNote} className="mb-8 flex items-center gap-4">
          <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Create a new quick-task..." className="flex-grow p-3 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-md focus:outline-none focus:border-green-400"/>
          <button type="submit" className="p-3 bg-green-400 text-black font-bold rounded-md hover:bg-green-300"><FaPlus /></button>
        </form>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(columns).map(([columnId, tasks]) => (
              <Column key={columnId} id={columnId} title={columnId} tasks={tasks} onDeleteTask={(taskId) => handleDeleteNote(taskId, columnId)} onEditTask={setSelectedTask}/>
            ))}
          </div>
        </DndContext>
      </div>
    </>
  );
}