'use client';

import { useState, useEffect } from 'react';
import { detectTimezone, TimezoneInfo } from '@/lib/utils/timezone-detection';

interface UseTimezoneDetectionReturn {
  timezone: string;
  isLoading: boolean;
}

/**
 * Simple timezone detection hook
 */
export function useTimezoneDetection(): UseTimezoneDetectionReturn {
  const [timezone, setTimezone] = useState('UTC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const detectUserTimezone = async () => {
      try {
        const detected = await detectTimezone();
        if (isMounted) {
          setTimezone(detected.timezone);
        }
      } catch (err) {
        console.warn('Timezone detection failed:', err);
        if (isMounted) {
          setTimezone('UTC');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    detectUserTimezone();

    return () => {
      isMounted = false;
    };
  }, []);

  return { timezone, isLoading };
}
