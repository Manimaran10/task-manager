import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        verifyToken(storedToken);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    console.log(token)
    try {
      const response = await authApi.getProfile();
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        throw new Error('No user data received');
      }
    } catch (error: any) {
      console.error('Token verification failed:', error);
      // Token is invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.data && response.data.user && response.data.token) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Logged in successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('Register data being sent:', { name, email, password });
    try {
      const response = await authApi.register({ name, email, password });
      console.log('Register API response:', response)
      if (response.data && response.data.user && response.data.token) {
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Account created successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string }) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};