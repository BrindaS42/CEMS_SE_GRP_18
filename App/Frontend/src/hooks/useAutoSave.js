// useAutoSave.js

import { useEffect, useRef, useCallback } from 'react';

export function useAutoSave({
  watch,
  reset,
  key,
  delay = 2000,
  onSave,
  onRestore
}) {
  const timeoutRef = useRef();
  const isRestoringRef = useRef(false);
  const lastSavedDataRef = useRef('');

  // Watch all form values
  const watchedData = watch();

  // Save data to localStorage
  const saveData = useCallback((data) => {
    try {
      const dataString = JSON.stringify(data);
      // Only save if data has actually changed
      if (dataString !== lastSavedDataRef.current) {
        localStorage.setItem(`autosave_${key}`, dataString);
        localStorage.setItem(`autosave_${key}_timestamp`, Date.now().toString());
        lastSavedDataRef.current = dataString;
        onSave?.(data);
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [key, onSave]);

  // Restore data from localStorage
  const restoreData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`autosave_${key}`);
      const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
      
      if (savedData && timestamp) {
        const data = JSON.parse(savedData);
        const saveTime = parseInt(timestamp);
        const hoursSinceLastSave = (Date.now() - saveTime) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursSinceLastSave < 24) {
          isRestoringRef.current = true;
          reset(data);
          lastSavedDataRef.current = savedData;
          onRestore?.(data);
          
          // Clear the restoring flag after a short delay
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
          
          return { restored: true, data, saveTime };
        } else {
          // Clear old data
          clearSavedData();
        }
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
    }
    return { restored: false, data: null, saveTime: null };
  }, [key, reset, onRestore]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    localStorage.removeItem(`autosave_${key}_timestamp`);
    lastSavedDataRef.current = '';
  }, [key]);

  // Get save timestamp
  const getSaveTimestamp = useCallback(() => {
    const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
    return timestamp ? parseInt(timestamp) : null;
  }, [key]);

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    const savedData = localStorage.getItem(`autosave_${key}`);
    const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
    
    if (savedData && timestamp) {
      const saveTime = parseInt(timestamp);
      const hoursSinceLastSave = (Date.now() - saveTime) / (1000 * 60 * 60);
      return hoursSinceLastSave < 24;
    }
    return false;
  }, [key]);

  // Auto-save effect
  useEffect(() => {
    // Skip if we're currently restoring data
    if (isRestoringRef.current) return;

    // Skip if data is empty or invalid
    if (!watchedData || Object.keys(watchedData).length === 0) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveData(watchedData);
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watchedData, delay, saveData]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save immediately on unmount if there's pending data
      if (watchedData && Object.keys(watchedData).length > 0 && !isRestoringRef.current) {
        saveData(watchedData);
      }
    };
  }, [saveData, watchedData]);

  return {
    saveData: () => saveData(watchedData),
    restoreData,
    clearSavedData,
    getSaveTimestamp,
    hasSavedData
  };
}