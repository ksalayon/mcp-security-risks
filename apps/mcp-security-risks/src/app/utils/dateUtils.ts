/**
 * Utility functions for consistent date/time formatting
 * These functions ensure server-side and client-side rendering match
 */

/**
 * Formats a timestamp consistently for display
 * Ensures the same output on both server and client to prevent hydration mismatches
 */
export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Formats a date for display (date only)
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  
  return `${month}/${day}/${year}`;
}

/**
 * Formats a date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const dateStr = formatDate(d);
  const timeStr = formatTimestamp(d);
  
  return `${dateStr} ${timeStr}`;
}

