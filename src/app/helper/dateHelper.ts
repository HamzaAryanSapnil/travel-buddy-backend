/**
 * Get UTC date start (00:00:00 UTC) for a given date
 * @param date - Optional date, defaults to current date
 * @returns Date object at UTC midnight
 */
export const getUTCDateStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

/**
 * Check if two dates are on the same UTC day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates are on the same UTC day
 */
export const isSameUTCDay = (date1: Date, date2: Date): boolean => {
  const day1 = getUTCDateStart(date1);
  const day2 = getUTCDateStart(date2);
  return day1.getTime() === day2.getTime();
};

/**
 * Calculate number of days between two dates (inclusive)
 * @param start - Start date
 * @param end - End date
 * @returns Number of days between start and end (inclusive)
 */
export const getDaysBetween = (start: Date, end: Date): number => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const diff = Math.abs(endTime - startTime);
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

