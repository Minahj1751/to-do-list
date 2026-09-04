import apiClient from './client';
import { Subtask, CreateSubtaskDto, UpdateSubtaskDto } from '../types';

export const subtaskApi = {
  getByTask: async (taskId: string): Promise<Subtask[]> => {
    const response = await apiClient.get<Subtask[]>(`/tasks/${taskId}/subtasks`);
    return response.data;
  },

  getById: async (taskId: string, id: string): Promise<Subtask> => {
    const response = await apiClient.get<Subtask>(`/tasks/${taskId}/subtasks/${id}`);
    return response.data;
  },

  create: async (taskId: string, subtask: CreateSubtaskDto): Promise<Subtask> => {
    const response = await apiClient.post<Subtask>(`/tasks/${taskId}/subtasks`, subtask);
    return response.data;
  },

  update: async (taskId: string, id: string, subtask: UpdateSubtaskDto): Promise<Subtask> => {
    const response = await apiClient.put<Subtask>(`/tasks/${taskId}/subtasks/${id}`, subtask);
    return response.data;
  },

  delete: async (taskId: string, id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/tasks/${taskId}/subtasks/${id}`);
    return response.data;
  },

  getProgress: async (taskId: string): Promise<{ total: number; completed: number; percentage: number }> => {
    const response = await apiClient.get<{ total: number; completed: number; percentage: number }>(`/tasks/${taskId}/subtasks/progress`);
    return response.data;
  },
};