import { useState, useEffect } from "react";

const readStoredItem = (key, initialValue, maxAgeMs) => {
  try {
    const item = window.localStorage.getItem(key);

    if (!item) {
      return initialValue;
    }

    const parsed = JSON.parse(item);

    if (
      parsed &&
      typeof parsed === "object" &&
      Object.prototype.hasOwnProperty.call(parsed, "value") &&
      Object.prototype.hasOwnProperty.call(parsed, "expiresAt")
    ) {
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value ?? initialValue;
    }

    if (maxAgeMs) {
      window.localStorage.removeItem(key);
      return initialValue;
    }

    return parsed;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return initialValue;
  }
};

export const useLocalStorage = (key, initialValue, options = {}) => {
  const { maxAgeMs = null } = options;

  const [storedValue, setStoredValue] = useState(() => {
    return readStoredItem(key, initialValue, maxAgeMs);
  });

  useEffect(() => {
    try {
      const payload = maxAgeMs
        ? {
            value: storedValue,
            expiresAt: Date.now() + maxAgeMs,
          }
        : storedValue;

      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, maxAgeMs, storedValue]);

  return [storedValue, setStoredValue];
};
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
