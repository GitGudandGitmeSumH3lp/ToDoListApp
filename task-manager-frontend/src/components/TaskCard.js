// src/components/TaskCard.js
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FaTrash } from 'react-icons/fa'; // Adjust import path if necessary

const TaskCard = ({ task, index }) => {
  // The onDelete prop is passed down from KanbanBoard -> ListColumn
  const { onDelete } = task;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps} // The handle to drag the task
          className={`bg-gray-800 p-4 rounded-sm border-l-4 mb-3 ${
            task.priority === 3 ? 'border-red-500' : 'border-green-400' // Example priority styling
          } ${snapshot.isDragging ? 'shadow-lg shadow-green-500/20' : ''}`} // Apply theme styles and drag effect
        >
          <div className="flex justify-between items-start"> {/* Flex container for title and delete button */}
              <div> {/* Container for title and description */}
                <p className="text-white font-medium">{task.title}</p>
                {task.description && <p className="text-gray-400 text-sm mt-1">{task.description}</p>}
              </div>
              {/* Delete Button */}
              <button
                onClick={onDelete} // Call the onDelete prop passed from parent
                className="text-gray-400 hover:text-red-600 ml-2" // Apply theme styles to button
              >
                <FaTrash />
              </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;