/**
 * Date formatting and expiration utility functions
 */

/**
 * Formats any date string or Date object to 'dd/mm/aaaa'
 */
export function formatToDDMMYYYY(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(dateInput).trim();
  if (!str) return '';

  // Already dd/mm/aaaa or dd/mm/yy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Matches YYYY-MM-DD or YYYY-MM-DDT...
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  // Try parsing Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
}

/**
 * Returns current date as 'YYYY-MM-DD'
 */
export function getTodayYYYYMMDD(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  const day = String(refDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if an item with an expirationDate (YYYY-MM-DD or string) is expired
 */
export function isExpired(expirationDateStr?: string | null, refDate: Date = new Date()): boolean {
  if (!expirationDateStr || !expirationDateStr.trim()) return false;
  
  const today = getTodayYYYYMMDD(refDate);
  
  // Extract YYYY-MM-DD
  const match = expirationDateStr.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0] < today;
  }

  return false;
}
