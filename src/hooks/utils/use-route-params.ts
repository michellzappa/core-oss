import { use } from 'react';

/**
 * A custom hook to safely handle route params in Next.js
 * This properly unwraps params using React.use() as recommended by Next.js
 * 
 * @param params The params object from the page component
 * @returns An object with the id from params
 */
export function useRouteParams<T extends { id: string }>(params: T) {
  // Check if params is a Promise
  if (params && typeof params === 'object' && 'then' in params) {
    // If params is a Promise, unwrap it with React.use()
    // This must not be inside a try/catch block
    return use(params as unknown as Promise<T>);
  }
  
  // If params is not a Promise, return it as is
  return params;
} 