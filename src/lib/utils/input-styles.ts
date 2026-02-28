/**
 * Standardized input styling utilities for consistent form appearance
 * across the entire application in both light and dark modes.
 */

/**
 * Get standardized input classes for form inputs
 * @param isDisabled - Whether the input should be disabled
 * @returns CSS classes string for consistent input styling
 */
export const getInputClasses = (isDisabled = false, hasError = false): string => {
  const baseClasses =
    "w-full h-10 px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-[var(--text-muted)] transition-colors";

  let classes = baseClasses;
  
  if (hasError) {
    classes = `${classes} border-red-500`;
  }
  
  if (isDisabled) {
    classes = `${classes} bg-[var(--muted)] cursor-not-allowed`;
  }
  
  return classes;
};

/**
 * Get standardized select trigger classes
 * @param isDisabled - Whether the select should be disabled
 * @returns CSS classes string for consistent select styling
 */
export const getSelectTriggerClasses = (isDisabled = false, hasError = false): string => {
  const baseClasses =
    "w-full h-10 px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors disabled:opacity-100 disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed";

  let classes = baseClasses;
  
  if (hasError) {
    classes = `${classes} border-red-500`;
  }
  
  if (isDisabled) {
    classes = `${classes} bg-[var(--muted)] cursor-not-allowed`;
  }
  
  return classes;
};

/**
 * Get standardized textarea classes
 * @param isDisabled - Whether the textarea should be disabled
 * @returns CSS classes string for consistent textarea styling
 */
export const getTextareaClasses = (isDisabled = false, hasError = false): string => {
  const baseClasses =
    "w-full px-3 py-2 border border-[var(--border)] bg-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-[var(--text-muted)] transition-colors resize-vertical";

  let classes = baseClasses;
  
  if (hasError) {
    classes = `${classes} border-red-500`;
  }
  
  if (isDisabled) {
    classes = `${classes} bg-[var(--muted)] cursor-not-allowed`;
  }
  
  return classes;
};

/**
 * Get standardized combobox trigger classes
 * @param isDisabled - Whether the combobox should be disabled
 * @param hasError - Whether the combobox has an error
 * @returns CSS classes string for consistent combobox styling
 */
export const getComboboxTriggerClasses = (isDisabled = false, hasError = false): string => {
  // Match select trigger visual style exactly
  const baseClasses =
    "flex w-full h-10 items-center justify-between px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-colors disabled:opacity-100 disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed";

  let classes = baseClasses;
  
  if (hasError) {
    classes = `${classes} border-red-500`;
  }
  
  if (isDisabled) {
    classes = `${classes} bg-[var(--muted)] cursor-not-allowed`;
  }
  
  return classes;
}; 