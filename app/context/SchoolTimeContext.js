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

  // Function to check if a date is within the academic year for a specific stage
  // This function uses the user-configured settings without default values
  const isWithinAcademicYear = (stage, date = new Date()) => {
    // Get the stage settings
    const stageSettings = schoolTimes[stage];
    
    // If there are no year settings, return true (assume always in academic year)
    if (!stageSettings || !stageSettings.yearStart || !stageSettings.yearEnd) {
      console.log('No academic year settings for stage:', stage);
      return true;
    }
    
    try {
      // Parse the year start and end dates
      const yearStartDate = new Date(stageSettings.yearStart);
      const yearEndDate = new Date(stageSettings.yearEnd);
      
      // Check if the current date is within the range
      return date >= yearStartDate && date <= yearEndDate;
    } catch (error) {
      console.error('Error parsing date settings:', error);
      return true; // Default to true on error
    }
  };

  // Function to get current or next academic year based on settings
  const getAcademicYear = (stage) => {
    const stageSettings = schoolTimes[stage];
    
    // If no settings available, return current year
    if (!stageSettings || !stageSettings.yearStart) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
    
    try {
      // Use the configured year start to determine the academic year
      const yearStartDate = new Date(stageSettings.yearStart);
      const startYear = yearStartDate.getFullYear();
      return `${startYear}-${startYear + 1}`;
    } catch (error) {
      console.error('Error parsing year start date:', error);
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  };

  return (
    <SchoolTimeContext.Provider value={{ 
      schoolTimes, 
      updateTimes, 
      loadTimes,
      isWithinAcademicYear,
      getAcademicYear
    }}>
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