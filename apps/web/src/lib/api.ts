const API_URL = 'http://localhost:4000';

const getToken = () => localStorage.getItem('token');

async function apiClient(endpoint: string, options: any = {}) {
  const token = getToken();
  
  const config: any = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, password: string, name: string) =>
    apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
};

export const boardsApi = {
  getBoard: (boardId: number) => apiClient(`/boards/${boardId}`),
  getColumns: (boardId: number) => apiClient(`/boards/${boardId}/columns`),
  createColumn: (boardId: number, title: string, position: number) =>
    apiClient(`/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title, position }),
    }),
};

export const tasksApi = {
  getTasks: (columnId: number, params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    return apiClient(`/tasks/columns/${columnId}/tasks?${queryParams}`);
  },
  
  createTask: (columnId: number, data: { title: string; description?: string; priority?: string }) =>
    apiClient(`/tasks/columns/${columnId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTask: (taskId: number, data: Partial<{ title: string; description: string; priority: string; column_id: number }>) =>
    apiClient(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  deleteTask: (taskId: number) =>
    apiClient(`/tasks/${taskId}`, { method: 'DELETE' }),
};

export const commentsApi = {
  getComments: (taskId: number) => apiClient(`/comments/tasks/${taskId}/comments`),
  
  createComment: (taskId: number, content: string) =>
    apiClient(`/comments/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};