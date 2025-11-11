/**
 * @file AppContext.tsx
 * @description
 * This file is one of the most important in the application. It creates and manages
 * the "magic backpack" for the entire app, which we call a React Context.
 */

import React, { createContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { User, Program, College, AppData } from '../types';
import apiClient from '../api';

interface AppContextType {
  data: AppData | null;
  setData: React.Dispatch<React.SetStateAction<AppData | null>>;
  currentUser: User | null;
  selectedLoginCollege: College | null;
  selectedProgram: Program | null;
  selectedBatch: string | null;
  selectedCollegeId: string | null;
  setSelectedCollegeId: React.Dispatch<React.SetStateAction<string | null>>;
  login: (username: string, password: string, college: College) => Promise<boolean>;
  logout: () => void;
  setProgramAndBatch: (program: Program, batch: string) => void;
  goBackToProgramSelection: () => void;
  isLoading: boolean;
  fetchAppData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLoginCollege, setSelectedLoginCollege] = useState<College | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAppData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/app-data/');
      setData(response.data);
    } catch (error) {
      console.error("Failed to load app data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchAppData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string, college: College) => {
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      setCurrentUser(user);
      setSelectedLoginCollege(college);

      if (user.role === 'Department' && user.collegeId) {
        setSelectedCollegeId(user.collegeId);
      }

      if (user.role !== 'Admin' && user.role !== 'University' && user.role !== 'Department') {
        setSelectedProgram(null);
        setSelectedBatch(null);
      }

      await fetchAppData();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    setSelectedLoginCollege(null);
    setSelectedProgram(null);
    setSelectedBatch(null);
    setSelectedCollegeId(null);
    setData(null);
  }, []);

  const setProgramAndBatch = useCallback((program: Program, batch: string) => {
    setSelectedProgram(program);
    setSelectedBatch(batch);
    setSelectedCollegeId(program.collegeId);
  }, []);

  const goBackToProgramSelection = useCallback(() => {
    setSelectedProgram(null);
    setSelectedBatch(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      setData,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      selectedCollegeId,
      setSelectedCollegeId,
      isLoading,
      fetchAppData,
    }),
    [
      data,
      currentUser,
      login,
      logout,
      selectedLoginCollege,
      selectedProgram,
      selectedBatch,
      setProgramAndBatch,
      goBackToProgramSelection,
      selectedCollegeId,
      isLoading,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
              <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20 mx-auto mb-4 animate-pulse" />
              <p className="text-xl font-semibold text-gray-700">Loading Portal...</p>
          </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
