import apiClient from './client';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (category: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', category);
    return response.data;
  },

  update: async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  },

  createDefaultCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/default');
    return response.data;
  },
};