import apiClient from './client';
import { UserSettings, UpdateUserSettingsDto } from '../types';

export const userSettingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get<UserSettings>('/user-settings');
    return response.data;
  },

  updateSettings: async (settings: UpdateUserSettingsDto): Promise<UserSettings> => {
    const response = await apiClient.put<UserSettings>('/user-settings', settings);
    return response.data;
  },

  resetToDefaults: async (): Promise<UserSettings> => {
    const response = await apiClient.post<UserSettings>('/user-settings/reset');
    return response.data;
  },
};