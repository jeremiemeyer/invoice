import { useCallback, useEffect, useRef, useState } from "react";

type SetValue<T> = T | ((prevValue: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] {
  // Start with initialValue to match server render
  const [state, setState] = useState<T>(initialValue);
  const isInitialized = useRef(false);

  // Read from localStorage after mount (client-only)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setState(JSON.parse(item));
        }
      } catch {
        // Invalid JSON or localStorage not available
      }
    }
  }, [key]);

  // Persist to localStorage on changes (skip initial mount)
  useEffect(() => {
    if (!isInitialized.current) return;
    try {
      if (state !== undefined) {
        localStorage.setItem(key, JSON.stringify(state));
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Silently fail (private mode, etc.)
    }
  }, [key, state]);

  const setValue = useCallback((value: SetValue<T>) => {
    setState(value);
  }, []);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch {
      // Fail silently
    }
  }, [key, initialValue]);

  return [state, setValue, remove];
}

export default useLocalStorage;
