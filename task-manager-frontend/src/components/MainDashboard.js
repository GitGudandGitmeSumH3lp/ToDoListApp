import React, { useState, useEffect } from 'react';
import { useAuth } from '../authcontext';
import api from '../api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTh, FaClipboardList, FaPlus } from 'react-icons/fa'; // Icons

// --- Main Dashboard Component ---
export default function MainDashboard() {
  const [view, setView] = useState('grid'); // 'grid' or 'board'
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/notes/')
      .then(response => setNotes(response.data))
      .catch(err => console.error("Failed to fetch notes", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    
    api.post('/notes/', { title: newNoteTitle })
      .then(response => {
        setNotes([response.data, ...notes]); // Add new note to the top of the list
        setNewNoteTitle(''); // Clear input
      })
      .catch(err => console.error("Failed to create note", err));
  };

  // --- Kanban Board Logic ---
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const noteId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId; // "TO DO", "ONGOING", "DONE"

    // Optimistic UI Update
    const newNotes = notes.map(note => 
      note.id === noteId ? { ...note, status: newStatus } : note
    );
    setNotes(newNotes);

    // API Call to persist the change
    api.put(`/notes/${noteId}/status`, { status: newStatus })
      .catch(err => console.error("Failed to update status", err));
  };
  
  // Group notes by status for the board view
  const columns = {
    "TO DO": notes.filter(n => n.status === "TO DO"),
    "ONGOING": notes.filter(n => n.status === "ONGOING"),
    "DONE": notes.filter(n => n.status === "DONE"),
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with View Switcher */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-widest">NEXTUP.</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={() => setView('grid')} className={`p-2 rounded-full ${view === 'grid' ? 'text-green-400 bg-gray-800' : 'text-gray-500 hover:bg-gray-800'}`} title="Grid View">
                <FaTh size={18} />
            </button>
            <button onClick={() => setView('board')} className={`p-2 rounded-full ${view === 'board' ? 'text-green-400 bg-gray-800' : 'text-gray-500 hover:bg-gray-800'}`} title="Board View">
                <FaClipboardList size={18} />
            </button>
            <button onClick={logout} className="ml-4 px-4 py-2 font-semibold text-sm tracking-wider text-gray-400 border border-gray-600 hover:bg-gray-800">LOG OUT</button>
          </div>
        </header>

        {/* Quick-add Note Form */}
        <form onSubmit={handleCreateNote} className="mb-8 flex items-center gap-4">
          <input 
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Add a new note..."
            className="flex-grow p-3 bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 focus:outline-none focus:border-green-400"
          />
          <button type="submit" className="p-3 bg-green-400 text-black font-bold hover:bg-green-300">
            <FaPlus />
          </button>
        </form>

        {/* --- Conditional Rendering Based on View --- */}
        {loading ? (
          <p className="text-center text-gray-400">Loading your notes...</p>
        ) : view === 'grid' ? (
          // --- GRID VIEW ---
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {notes.map(note => (
              <div key={note.id} className="p-4 bg-gray-900 rounded-lg h-48 flex flex-col justify-between">
                <h3 className="font-bold text-white">{note.title}</h3>
                <p className="text-xs text-gray-500">{note.status}</p>
              </div>
            ))}
          </div>
        ) : (
          // --- BOARD VIEW ---
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(columns).map(([columnId, tasks]) => (
                <div key={columnId} className="bg-gray-900 p-4">
                  <h3 className="font-semibold text-white mb-4">{columnId}</h3>
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className={`space-y-3 min-h-[200px] rounded-sm transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800' : ''}`}>
                        {tasks.map((note, index) => (
                          <Draggable key={note.id} draggableId={note.id.toString()} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-3 bg-black">
                                <p className="text-white font-medium text-sm">{note.title}</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}