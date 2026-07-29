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

  let str = String(dateInput).trim();
  if (!str) return '';

  // Pure ISO timestamp like "2026-07-29T00:00:00.000Z"
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const parts = str.substring(0, 10).split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Convert any YYYY/MM/DD or YYYY-MM-DD or YYYY.MM.DD date inside the string
  // e.g. "2026/07/29 | JEREMÍAS 20, 21" -> "29/07/2026 | JEREMÍAS 20, 21"
  // e.g. "2026-07-29 | JEREMÍAS 20, 21" -> "29/07/2026 | JEREMÍAS 20, 21"
  // e.g. "2026/07/29" -> "29/07/2026"
  // e.g. "2026-07-29" -> "29/07/2026"
  const converted = str.replace(/\b(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/g, (_match, y, m, d) => {
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  });

  return converted;
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
