const originalConsoleError = console.error;

console.error = function(...args) {
  const errorMessage = args.join(' ');
  if (
    errorMessage.includes('cookies()') &&
    errorMessage.includes('should be awaited') &&
    errorMessage.includes('sync-dynamic-apis')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

export default function setupErrorHandler() {
  return {
    cleanup: () => {
      console.error = originalConsoleError;
    }
  };
}
