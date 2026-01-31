const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: getAuthHeaders(),
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    // Projects
    getProjects: () => request<any[]>('/projects'),
    getProject: (id: string) => request<any>(`/projects/${id}`),
    createProject: (data: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    updateProject: (id: string, data: any) => request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),

    // Tasks
    getTasks: (projectId?: string, sprintId?: string) => {
        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        if (sprintId) params.append('sprintId', sprintId);
        return request<any[]>(`/tasks?${params}`);
    },
    getBacklog: (projectId: string) => request<any[]>(`/tasks/backlog/${projectId}`),
    createTask: (data: any) => request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id: string, data: any) => request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateTaskStatus: (id: string, status: string) => request<any>(`/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),

    // Sprints
    getSprints: (projectId: string) => request<any[]>(`/sprints?projectId=${projectId}`),
    createSprint: (data: any) => request<any>('/sprints', { method: 'POST', body: JSON.stringify(data) }),
    updateSprint: (id: string, data: any) => request<any>(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    assignTasksToSprint: (sprintId: string, taskIds: string[]) => request<any[]>(`/sprints/${sprintId}/tasks`, { method: 'PUT', body: JSON.stringify({ taskIds }) }),
    removeTaskFromSprint: (sprintId: string, taskId: string) => request<void>(`/sprints/${sprintId}/tasks/${taskId}`, { method: 'DELETE' }),

    // Retrospectives
    getRetrospective: (sprintId: string) => request<any>(`/retrospectives/${sprintId}`),
    updateRetrospective: (sprintId: string, data: any) => request<any>(`/retrospectives/${sprintId}`, { method: 'PUT', body: JSON.stringify(data) }),
    addRetroItem: (sprintId: string, column: string, item: string) => request<any>(`/retrospectives/${sprintId}/items`, { method: 'POST', body: JSON.stringify({ column, item }) }),
    removeRetroItem: (sprintId: string, column: string, item: string) => request<any>(`/retrospectives/${sprintId}/items`, { method: 'DELETE', body: JSON.stringify({ column, item }) }),

    // Documents
    getDocuments: (projectId: string) => request<any[]>(`/documents?projectId=${projectId}`),
    getDocument: (id: string) => request<any>(`/documents/${id}`),
    createDocument: (data: any) => request<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
    updateDocument: (id: string, data: any) => request<any>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDocument: (id: string) => request<void>(`/documents/${id}`, { method: 'DELETE' }),

    // MoMs
    getMoMs: (projectId: string) => request<any[]>(`/moms?projectId=${projectId}`),
    createMoM: (data: any) => request<any>('/moms', { method: 'POST', body: JSON.stringify(data) }),
    updateMoM: (id: string, data: any) => request<any>(`/moms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMoM: (id: string) => request<void>(`/moms/${id}`, { method: 'DELETE' }),

    // Users
    getUsers: () => request<any[]>('/users'),
    getProjectMembers: (projectId: string) => request<any[]>(`/users/project/${projectId}`),
    createUser: (data: { name: string; email: string; password?: string }) =>
        request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    deleteUser: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),

    // Project Members
    addProjectMember: (projectId: string, userId: string, role: string = 'member') =>
        request<any[]>(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),
    updateMemberRole: (projectId: string, userId: string, role: string) =>
        request<any[]>(`/projects/${projectId}/members/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) }),
    removeProjectMember: (projectId: string, userId: string) =>
        request<void>(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
};
