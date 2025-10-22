import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Column } from '../components/Column';
import TaskDetailModal from '../components/TaskDetailModal';
import { FaPlus } from 'react-icons/fa';

export default function FolderDetailPage() {
  const { folderId } = useParams();
  const [folder, setFolder] = useState(null);
  const [columns, setColumns] = useState({ "TO DO": [], "ONGOING": [], "DONE": [] });
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchFolderDetails = useCallback(() => {
    setLoading(true);
    api.get(`/notebooks/${folderId}/`)
      .then(res => {
        setFolder(res.data);
        const newColumns = { "TO DO": [], "ONGOING": [], "DONE": [] };
        res.data.notes.forEach(note => { if (newColumns[note.status]) newColumns[note.status].push(note); });
        for (const key in newColumns) { newColumns[key].sort((a, b) => b.priority - a.priority); }
        setColumns(newColumns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [folderId]);

  useEffect(() => {
    fetchFolderDetails();
  }, [fetchFolderDetails]);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    api.post('/notes/', { title: newNoteTitle, notebook_id: parseInt(folderId), priority: 1, category: 'Miscellaneous' })
      .then(res => {
        const newNote = res.data;
        setColumns(currentCols => ({
          ...currentCols,
          [newNote.status]: [newNote, ...currentCols[newNote.status]].sort((a, b) => b.priority - a.priority)
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
    api.put(`/notes/${taskId}`, updatedData).then(() => {
      fetchFolderDetails(); // Safest way to update after edit
      setSelectedTask(null);
    }).catch(console.error);
  };
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  
  const findColumnOfTask = (taskId) => {
    for (const columnId in columns) {
      if (columns[columnId].some(task => task.id === taskId)) return columnId;
    }
    return null;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const sourceColumnId = findColumnOfTask(activeId);
    const destColumnId = columns[overId] ? overId : findColumnOfTask(overId);
    if (!sourceColumnId || !destColumnId || sourceColumnId === destColumnId) return;
    
    const activeTask = columns[sourceColumnId].find(t => t.id === activeId);
    setColumns(currentCols => {
      const sourceItems = currentCols[sourceColumnId].filter(t => t.id !== activeId);
      const destItems = [...currentCols[destColumnId], { ...activeTask, status: destColumnId }].sort((a, b) => b.priority - a.priority);
      return { ...currentCols, [sourceColumnId]: sourceItems, [destColumnId]: destItems };
    });
    api.put(`/notes/${activeId}/status`, { status: destColumnId }).catch(err => {
        console.error("Failed to update status, reverting.", err);
        fetchFolderDetails();
    });
  };

  if (loading) return <p className="text-center text-gray-400">Loading folder...</p>;
  if (!folder) return <p>Folder not found.</p>;

  return (
    <>
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onSave={handleSaveTask} />
      <div>
        <div className="mb-8">
          <Link to="/folders" className="text-sm text-gray-400 hover:text-white">{'< Back to Folders'}</Link>
          <h2 className="text-4xl font-bold mt-2">{folder.title}</h2>
        </div>
        <form onSubmit={handleCreateNote} className="mb-8 flex items-center gap-4">
          <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Add a new task to this folder..." className="flex-grow p-3 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-md focus:outline-none focus:border-green-400"/>
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