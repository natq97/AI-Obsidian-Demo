// FIX: Import React to make the 'React' namespace available for type annotations.
import React, { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  // This is a dummy effect to ensure the hook's signature is consistent,
  // but the main logic is handled by the lazy initializer and the setValue function.
  useEffect(() => {
    // An effect could be used here to listen for storage events from other tabs,
    // but for this simple use case it's not necessary.
  }, [key]);

  return [storedValue, setValue];
}