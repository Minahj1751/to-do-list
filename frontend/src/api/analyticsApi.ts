import apiClient from './client';
import { DashboardStats, DailyStats, WeeklyStats, MonthlyStats, CategoryStats } from '../types';

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/analytics/dashboard');
    return response.data;
  },

  getDailyStats: async (days?: number): Promise<DailyStats[]> => {
    const response = await apiClient.get<DailyStats[]>('/analytics/daily', { 
      params: days ? { days } : undefined 
    });
    return response.data;
  },

  getWeeklyStats: async (): Promise<WeeklyStats> => {
    const response = await apiClient.get<WeeklyStats>('/analytics/weekly');
    return response.data;
  },

  getMonthlyStats: async (): Promise<MonthlyStats> => {
    const response = await apiClient.get<MonthlyStats>('/analytics/monthly');
    return response.data;
  },

  getCategoryStats: async (): Promise<CategoryStats[]> => {
    const response = await apiClient.get<CategoryStats[]>('/analytics/categories');
    return response.data;
  },
};