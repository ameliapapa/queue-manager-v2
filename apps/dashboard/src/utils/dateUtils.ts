import { formatDistanceToNow, format, isValid } from 'date-fns';

/**
 * Safely format a date with formatDistanceToNow
 * Returns 'N/A' if date is null/undefined/invalid
 */
export function safeFormatDistanceToNow(date: Date | null | undefined): string {
  if (!date) return 'N/A';

  try {
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  return 'N/A';
}

/**
 * Safely format a date with custom format
 * Returns 'N/A' if date is null/undefined/invalid
 */
export function safeFormat(date: Date | null | undefined, formatStr: string = 'PPpp'): string {
  if (!date) return 'N/A';

  try {
    if (isValid(date)) {
      return format(date, formatStr);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  return 'N/A';
}

/**
 * Safely format time only (HH:mm)
 * Returns 'N/A' if date is null/undefined/invalid
 */
export function safeFormatTime(date: Date | null | undefined): string {
  return safeFormat(date, 'HH:mm');
}

/**
 * Safely format date only (MMM dd, yyyy)
 * Returns 'N/A' if date is null/undefined/invalid
 */
export function safeFormatDate(date: Date | null | undefined): string {
  return safeFormat(date, 'MMM dd, yyyy');
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: Date | null | undefined): date is Date {
  return date !== null && date !== undefined && isValid(date);
}
