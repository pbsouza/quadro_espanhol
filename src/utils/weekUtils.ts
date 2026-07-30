/**
 * Utility functions for 21-week date window calculation
 * - 10 past weeks
 * - 1 current week
 * - 10 future weeks
 */

export function getMondayOf(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WeekWindow21 {
  currentMonday: Date;
  startMonday: Date; // currentMonday - 70 days (10 weeks)
  endSunday: Date;   // currentMonday + 76 days 23:59:59 (10 weeks + 6 days)
  weekIds: string[]; // Array of 21 YYYY-MM-DD week identifiers
}

export function get21WeeksWindow(refDate: Date = new Date()): WeekWindow21 {
  const currentMonday = getMondayOf(refDate);

  // 10 weeks prior (70 days)
  const startMonday = new Date(currentMonday);
  startMonday.setDate(startMonday.getDate() - 70);
  startMonday.setHours(0, 0, 0, 0);

  // 10 weeks future + 6 days = Sunday of 10th future week
  const endSunday = new Date(currentMonday);
  endSunday.setDate(endSunday.getDate() + 76);
  endSunday.setHours(23, 59, 59, 999);

  // Build list of 21 weekIds (Mondays)
  const weekIds: string[] = [];
  const temp = new Date(startMonday);
  for (let i = 0; i < 21; i++) {
    weekIds.push(formatYYYYMMDD(temp));
    temp.setDate(temp.getDate() + 7);
  }

  return {
    currentMonday,
    startMonday,
    endSunday,
    weekIds,
  };
}

/**
 * Helper to parse a Date object from an item's weekId, date, id, or weekLabel string
 */
export function parseItemDate(item: any): Date | null {
  if (!item) return null;
  const str = item.weekId || item.date || item.id || item.weekLabel;
  if (!str || typeof str !== 'string') return null;

  // Extract YYYY-MM-DD pattern if present
  const matchIso = str.match(/\d{4}-\d{2}-\d{2}/);
  if (matchIso) {
    const parts = matchIso[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Extract DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY pattern if present
  const matchDdMmYyyy = str.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (matchDdMmYyyy) {
    const day = parseInt(matchDdMmYyyy[1], 10);
    const month = parseInt(matchDdMmYyyy[2], 10) - 1;
    const year = parseInt(matchDdMmYyyy[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback to direct Date parsing
  const direct = new Date(str);
  if (!isNaN(direct.getTime())) {
    return direct;
  }

  return null;
}

/**
 * Checks if an item falls within the public 10-weeks window:
 * - 3 weeks prior (21 days before current Monday)
 * - 1 current week
 * - 6 future weeks (ending Sunday of the 6th future week)
 */
export function isItemInPublicWeeksWindow(item: any, refDate: Date = new Date()): boolean {
  const date = parseItemDate(item);
  if (!date) return true; // Keep items with unparseable dates to avoid accidental hiding

  const currentMonday = getMondayOf(refDate);

  // 3 weeks prior (21 days)
  const minMonday = new Date(currentMonday);
  minMonday.setDate(minMonday.getDate() - 21);
  minMonday.setHours(0, 0, 0, 0);

  // 6 future weeks + current week = 49 days minus 1 ms (Sunday of 6th future week)
  const maxSunday = new Date(currentMonday);
  maxSunday.setDate(maxSunday.getDate() + 48); // 48 days = Sunday of 6th future week
  maxSunday.setHours(23, 59, 59, 999);

  return date >= minMonday && date <= maxSunday;
}

/**
 * Filters a list of meetings to ONLY keep items inside the public week window (3 past, current, 6 future)
 */
export function filterPublicWeeks<T>(items: T[], refDate: Date = new Date()): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isItemInPublicWeeksWindow(item, refDate));
}

/**
 * Checks if an item falls within the 21-weeks window (10 past, current, 10 future)
 */
export function isItemIn21WeeksWindow(item: any, refDate: Date = new Date()): boolean {
  const date = parseItemDate(item);
  if (!date) return true; // Keep items with unparseable dates to avoid accidental deletion

  const { startMonday, endSunday } = get21WeeksWindow(refDate);
  return date >= startMonday && date <= endSunday;
}

/**
 * Filters a list of meetings or schedule items to ONLY keep items inside the 21-week window
 */
export function filterMeetingsBy21Weeks<T>(items: T[], refDate: Date = new Date()): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isItemIn21WeeksWindow(item, refDate));
}

/**
 * Sorts meeting items chronologically by date/weekId
 */
export function sortMeetingsChronologically<T>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const dateA = parseItemDate(a)?.getTime() || 0;
    const dateB = parseItemDate(b)?.getTime() || 0;
    return dateA - dateB;
  });
}

/**
 * Finds index of meeting corresponding to current week or nearest week
 */
export function findCurrentWeekIndex<T>(items: T[], refDate: Date = new Date()): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const currentMon = getMondayOf(refDate).getTime();

  let closestIndex = 0;
  let minDiff = Infinity;

  items.forEach((item, idx) => {
    const itemDate = parseItemDate(item);
    if (itemDate) {
      const itemMon = getMondayOf(itemDate).getTime();
      const diff = Math.abs(itemMon - currentMon);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    }
  });

  return closestIndex;
}
