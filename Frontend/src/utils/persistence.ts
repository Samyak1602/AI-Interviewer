import { persistor } from '@/store';

/**
 * Utility functions for managing Redux persist
 */

/**
 * Purge all persisted state from localStorage
 * Useful for logout or reset functionality
 */
export const purgePersistedState = async (): Promise<void> => {
  try {
    await persistor.purge();
    console.log('Persisted state purged successfully');
  } catch (error) {
    console.error('Error purging persisted state:', error);
    throw error;
  }
};

/**
 * Flush any pending persist operations
 * Ensures all state is saved before critical operations
 */
export const flushPersist = async (): Promise<void> => {
  try {
    await persistor.flush();
    console.log('Persist operations flushed successfully');
  } catch (error) {
    console.error('Error flushing persist operations:', error);
    throw error;
  }
};

/**
 * Check if the store has been rehydrated
 * Useful for conditional rendering or logic
 */
export const isRehydrated = (): boolean => {
  return persistor.getState().bootstrapped;
};

/**
 * Get the current persist state
 * Useful for debugging or monitoring
 */
export const getPersistState = () => {
  return persistor.getState();
};

/**
 * Subscribe to rehydration events
 * Useful for performing actions after state is restored
 */
export const onRehydrate = (callback: () => void): (() => void) => {
  const unsubscribe = persistor.subscribe(() => {
    if (isRehydrated()) {
      callback();
      unsubscribe(); // Only call once
    }
  });
  
  // If already rehydrated, call immediately
  if (isRehydrated()) {
    callback();
    unsubscribe();
  }
  
  return unsubscribe;
};

/**
 * Clear specific localStorage keys if needed for debugging
 */
export const clearSpecificPersistedData = (key: string): void => {
  try {
    localStorage.removeItem(`persist:${key}`);
    console.log(`Cleared persisted data for key: ${key}`);
  } catch (error) {
    console.error('Error clearing specific persisted data:', error);
  }
};

/**
 * Get the size of persisted data in localStorage
 * Useful for monitoring storage usage
 */
export const getPersistedDataSize = (): { [key: string]: number } => {
  const sizes: { [key: string]: number } = {};
  
  try {
    for (const key in localStorage) {
      if (key.startsWith('persist:')) {
        const data = localStorage.getItem(key);
        sizes[key] = data ? new Blob([data]).size : 0;
      }
    }
  } catch (error) {
    console.error('Error calculating persisted data size:', error);
  }
  
  return sizes;
};

/**
 * Export persisted data as JSON (for debugging or backup)
 */
export const exportPersistedData = (): object | null => {
  try {
    const data: { [key: string]: string } = {};
    
    for (const key in localStorage) {
      if (key.startsWith('persist:')) {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
    }
    
    return Object.keys(data).length > 0 ? data : null;
  } catch (error) {
    console.error('Error exporting persisted data:', error);
    return null;
  }
};