import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authStorage } from '../storage/authStorage';
import { authApi } from '../api/authApi';
import * as Notifications from 'expo-notifications';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await authStorage.getUser();
      const isAuthenticated = await authStorage.isAuthenticated();
      
      if (isAuthenticated && savedUser) {
        setUser(savedUser);
        // Optionally refresh user data from server
        try {
          const freshUser = await authApi.getCurrentUser();
          setUser(freshUser);
          await authStorage.saveAuthData({ user: freshUser, token: (await authStorage.getToken())! });
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      await authStorage.saveAuthData(response);
      setUser(response.user);
      
      // Request notification permissions
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (notificationError) {
        console.error('Notification permission error:', notificationError);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const response = await authApi.register({ name, email, password, confirmPassword });
      await authStorage.saveAuthData(response);
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      await authStorage.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      await authStorage.clearAuthData();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getCurrentUser();
      setUser(freshUser);
      await authStorage.saveAuthData({ user: freshUser, token: (await authStorage.getToken())! });
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};