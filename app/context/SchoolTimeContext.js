import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SCHOOL_TIMES_KEY } from '../utils/timeUtils';

const SchoolTimeContext = createContext();

const NotARoute = () => null;
export default NotARoute;

export function SchoolTimeProvider({ children }) {
  const [schoolTimes, setSchoolTimes] = useState({
    elementary: { startTime: '', endTime: '' },
    middle: { startTime: '', endTime: '' },
    high: { startTime: '', endTime: '' },
    college: { startTime: '', endTime: '' }
  });

  // Load times from storage on mount
  useEffect(() => {
    loadTimes();
  }, []);

  const loadTimes = async () => {
    try {
      console.log('Loading times from storage in context');
      const savedTimes = await AsyncStorage.getItem(SCHOOL_TIMES_KEY);
      console.log('Loaded times:', savedTimes);
      if (savedTimes) {
        const parsedTimes = JSON.parse(savedTimes);
        console.log('Parsed times:', parsedTimes);
        setSchoolTimes(parsedTimes);
      } else {
        console.log('No saved times found');
      }
    } catch (error) {
      console.error('Error loading school times:', error);
    }
  };

  const updateTimes = async (stage, newTimes) => {
    try {
      const updatedTimes = {
        ...schoolTimes,
        [stage]: newTimes
      };
      await AsyncStorage.setItem(SCHOOL_TIMES_KEY, JSON.stringify(updatedTimes));
      setSchoolTimes(updatedTimes);
      return true;
    } catch (error) {
      console.error('Error saving school times:', error);
      return false;
    }
  };

  return (
    <SchoolTimeContext.Provider value={{ schoolTimes, updateTimes, loadTimes }}>
      {children}
    </SchoolTimeContext.Provider>
  );
}

export function useSchoolTimes() {
  const context = useContext(SchoolTimeContext);
  if (!context) {
    throw new Error('useSchoolTimes must be used within a SchoolTimeProvider');
  }
  return context;
}