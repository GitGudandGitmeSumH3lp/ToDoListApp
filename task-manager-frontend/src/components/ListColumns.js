// src/components/ListColumn.js
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard'; // Adjust import path if necessary

const ListColumn = ({ list }) => {
  return (
    <Draggable draggableId={list.id.toString()} index={list.index}> {/* Optional: Make lists draggable too */}
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps} // Optional: If you want to make the whole list draggable
          className="bg-gray-900 p-4 rounded-sm min-h-[200px] flex-shrink-0" // Apply theme styles
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
            {list.title}
            <span className="text-sm text-gray-400">{list.tasks.length}</span>
          </h3>
          <Droppable droppableId={list.id.toString()} type="task"> {/* Each list is a droppable area for tasks */}
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[100px] p-2 ${snapshot.isDraggingOver ? 'bg-gray-800' : ''}`} // Visual feedback when dragging, apply theme
              >
                {list.tasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder} {/* Placeholder for drop target */}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default ListColumn;