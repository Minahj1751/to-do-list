import apiClient from './client';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types';

export const taskApi = {
  getAll: async (filters?: any): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks', { params: filters });
    return response.data;
  },

  getToday: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks/today');
    return response.data;
  },

  getUpcoming: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks/upcoming');
    return response.data;
  },

  getOverdue: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks/overdue');
    return response.data;
  },

  getCompleted: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks/completed');
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (task: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', task);
    return response.data;
  },

  update: async (id: string, task: UpdateTaskDto): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },

  markComplete: async (id: string): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  markIncomplete: async (id: string): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/tasks/${id}/incomplete`);
    return response.data;
  },
};