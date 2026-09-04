import apiClient from './client';
import { RecurringTask, CreateRecurringTaskDto, UpdateRecurringTaskDto } from '../types';

export const recurringTaskApi = {
  getAll: async (): Promise<RecurringTask[]> => {
    const response = await apiClient.get<RecurringTask[]>('/recurring-tasks');
    return response.data;
  },

  getById: async (id: string): Promise<RecurringTask> => {
    const response = await apiClient.get<RecurringTask>(`/recurring-tasks/${id}`);
    return response.data;
  },

  create: async (recurringTask: CreateRecurringTaskDto): Promise<RecurringTask> => {
    const response = await apiClient.post<RecurringTask>('/recurring-tasks', recurringTask);
    return response.data;
  },

  update: async (id: string, recurringTask: UpdateRecurringTaskDto): Promise<RecurringTask> => {
    const response = await apiClient.put<RecurringTask>(`/recurring-tasks/${id}`, recurringTask);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/recurring-tasks/${id}`);
    return response.data;
  },
};