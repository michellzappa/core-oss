import { useState, useCallback, useEffect } from 'react';

export function useFormField<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isDirty, setIsDirty] = useState(false);

  // Update function with tracking
  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    setIsDirty(true);
  }, []);

  // Reset to initial value
  const reset = useCallback(() => {
    setValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  // Update when initialValue changes (e.g., from props)
  useEffect(() => {
    if (!isDirty) {
      setValue(initialValue);
    }
  }, [initialValue, isDirty]);

  return { value, setValue: updateValue, reset, isDirty };
} 