/**
 * Simple timezone detection for meeting booking
 */

export interface TimezoneInfo {
  timezone: string;
  confidence: 'high' | 'medium' | 'low';
  method: 'browser' | 'ip' | 'fallback';
}

/**
 * Detect timezone using browser's Intl API (most accurate)
 */
export function detectBrowserTimezone(): string | null {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  } catch (error) {
    console.warn('Browser timezone detection failed:', error);
  }
  return null;
}

/**
 * Detect timezone using IP geolocation (fallback method)
 */
export async function detectIPTimezone(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.timezone || null;
  } catch (error) {
    console.warn('IP timezone detection failed:', error);
    return null;
  }
}

/**
 * Get timezone with fallbacks
 */
export async function detectTimezone(): Promise<TimezoneInfo> {
  // Browser detection first
  const browserTimezone = detectBrowserTimezone();
  if (browserTimezone) {
    return { timezone: browserTimezone, confidence: 'high', method: 'browser' };
  }

  // IP geolocation fallback
  const ipTimezone = await detectIPTimezone();
  if (ipTimezone) {
    return { timezone: ipTimezone, confidence: 'medium', method: 'ip' };
  }

  // UTC fallback
  return { timezone: 'UTC', confidence: 'low', method: 'fallback' };
}

/**
 * Essential timezones for meeting booking
 */
export const TIMEZONE_GROUPS = {
  'Americas': [
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  ],
  'Europe': [
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  ],
  'Asia Pacific': [
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  ],
  'Other': [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  ],
};
