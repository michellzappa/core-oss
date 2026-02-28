import "server-only";

/**
 * Generate a page title
 * Format: "Page Name • Core"
 */
export function generatePageTitle(pageName: string, _pathname?: string): string {
  return `${pageName} • Core`;
}
