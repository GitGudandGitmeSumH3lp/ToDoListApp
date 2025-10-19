
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NEW FUNCTION
export const signup = (userData) => {
  // userData will be an object like { email: '...', password: '...' }
  return api.post('/users/', userData);
};

// --- MISSING FUNCTIONS BELOW ---

/**
 * Fetches all lists and their tasks for the logged-in user.
 */
export const getLists = () => {
  return api.get('/lists/');
};

/**
 * Creates a new task in a specific list.
 * @param {number} listId The ID of the list to add the task to.
 * @param {object} taskData The task details (e.g., { title: 'New Task' }).
 */
export const createTask = (listId, taskData) => {
  return api.post(`/lists/${listId}/tasks/`, taskData);
};

/**
 * Deletes a specific task by its ID.
 * @param {number} taskId The ID of the task to delete.
 */
export const deleteTask = (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};

/**
 * Updates a task, typically to move it to a new list.
 * @param {number} taskId The ID of the task to update.
 * @param {number} newListId The ID of the list to move the task to.
 */
export const updateTask = (taskId, newListId) => {
  return api.put(`/tasks/${taskId}?new_list_id=${newListId}`);
}

export default api;