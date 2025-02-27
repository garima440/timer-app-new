// context/StageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_STAGE_KEY = 'selectedStage';

const StageContext = createContext();

export default function StageProvider({ children }) {
  const [selectedStage, setSelectedStage] = useState(null);

  // Load selected stage on mount
  useEffect(() => {
    loadSelectedStage();
  }, []);

  const loadSelectedStage = async () => {
    try {
      const savedStage = await AsyncStorage.getItem(SELECTED_STAGE_KEY);
      console.log('StageContext - Loaded Stage:', savedStage);
      
      if (savedStage) {
        setSelectedStage(savedStage);
      }
    } catch (error) {
      console.error('StageContext - Error loading selected stage:', error);
    }
  };

  const updateSelectedStage = async (stageId) => {
    try {
      // Make sure we're working with a stage ID (string)
      const stageIdString = typeof stageId === 'object' ? stageId.id : stageId;
      
      console.log('StageContext - Updating stage:', stageIdString);
      await AsyncStorage.setItem(SELECTED_STAGE_KEY, stageIdString);
      setSelectedStage(stageIdString);
    } catch (error) {
      console.error('StageContext - Error saving selected stage:', error);
    }
  };

  return (
    <StageContext.Provider value={{ 
      selectedStage, 
      updateSelectedStage 
    }}>
      {children}
    </StageContext.Provider>
  );
}

export function useStage() {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStage must be used within a StageProvider');
  }
  return context;
}