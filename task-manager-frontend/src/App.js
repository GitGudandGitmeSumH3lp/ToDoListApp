import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from './authcontext';
import api, { deleteTask as apiDeleteTask } from './api';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const { token } = useAuth();
  const [boardData, setBoardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (all your useEffect and handler functions like onDragEnd, handleDeleteTask remain exactly the same) ...
  useEffect(() => {
    if (token) {
      setLoading(true); // Set loading to true before fetching
      api.get('/lists/')
        .then(response => {
          setBoardData(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch board data:', error);
          setLoading(false);
        });
    } else {
        // If there's no token, we are not loading data, so set loading to false.
        setLoading(false);
    }
  }, [token]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // --- Optimistic UI Update ---
    const startList = boardData.find(list => list.id.toString() === source.droppableId);
    const finishList = boardData.find(list => list.id.toString() === destination.droppableId);
    const movingTask = startList.tasks.find(task => task.id.toString() === draggableId);

    // Moving within the same list
    if (startList === finishList) {
        const newTasks = Array.from(startList.tasks);
        newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movingTask);

        const newList = {
            ...startList,
            tasks: newTasks,
        };

        const newBoardData = boardData.map(list => list.id === newList.id ? newList : list);
        setBoardData(newBoardData);
    } else {
        // Moving from one list to another
        const startTasks = Array.from(startList.tasks);
        startTasks.splice(source.index, 1);
        const newStartList = {
            ...startList,
            tasks: startTasks,
        };

        const finishTasks = Array.from(finishList.tasks);
        finishTasks.splice(destination.index, 0, movingTask);
        const newFinishList = {
            ...finishList,
            tasks: finishTasks,
        };

        const newBoardData = boardData.map(list => {
            if(list.id === newStartList.id) return newStartList;
            if(list.id === newFinishList.id) return newFinishList;
            return list;
        });
        setBoardData(newBoardData);
    }

    // --- API Call to Persist Change ---
    api.put(`/tasks/${draggableId}?new_list_id=${destination.droppableId}`)
      .catch(error => {
        console.error("Failed to move task", error);
        // Revert the optimistic update on failure
        // Fetch data again to restore correct state
        api.get('/lists/')
          .then(response => setBoardData(response.data))
          .catch(fetchError => console.error('Failed to restore data:', fetchError));
      });
  };

  // --- Added: Delete Task Logic ---
  const handleDeleteTask = (listId, taskId) => {
    // 1. Optimistic UI Update
    const newBoardData = boardData.map(list => {
      if (list.id === listId) {
        // Filter out the task that is being deleted
        const newTasks = list.tasks.filter(task => task.id !== taskId);
        return { ...list, tasks: newTasks };
      }
      return list;
    });
    setBoardData(newBoardData);

    // 2. API Call
    apiDeleteTask(taskId).catch(error => {
      console.error("Failed to delete task:", error);
      // If the API call fails, we should revert the state.
      // For simplicity, we'll just log the error here, but in a real app,
      // you would need to restore the task to the UI.
    });
  };


  if (!token) {
    return <Login />;
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading your board...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-background text-text-primary">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Task Manager</h1>
          
          {/* PLACE THE THEME TOGGLE HERE */}
          <ThemeToggle />
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boardData?.map((list) => (
              <Droppable key={list.id} droppableId={list.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-surface p-4 rounded-lg shadow-lg ${
                      snapshot.isDraggingOver ? 'bg-blue-200' : '' // This class might be overridden by theme
                    }`}
                  >
                    <h2 className="text-xl font-bold text-text-primary mb-4">{list.name}</h2>
                    
                    {list.tasks?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-card text-text-secondary p-3 mb-3 rounded-md shadow-sm flex justify-between items-center ${snapshot.isDragging ? 'shadow-xl' : ''}`}
                          >
                            <span>{task.title}</span>
                            <button
                              onClick={() => handleDeleteTask(list.id, task.id)}
                              className="text-gray-400 hover:text-red-600 font-bold"
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;