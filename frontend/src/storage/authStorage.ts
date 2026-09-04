import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authStorage = {
  async saveAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, authResponse.token],
        [USER_DATA_KEY, JSON.stringify(authResponse.user)],
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },
};