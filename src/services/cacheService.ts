/**
 * Local Storage Cache Manager to minimize Firebase reads & quota usage.
 * Saves 21-week window data locally (10 past weeks + 1 current week + 10 future weeks).
 */

const CACHE_KEYS = {
  MIDWEEK: 'quadro_cache_midweek_v1',
  WEEKEND: 'quadro_cache_weekend_v1',
  ANNOUNCEMENTS: 'quadro_cache_announcements_v1',
  CLEANING: 'quadro_cache_cleaning_v1',
  WITNESSING: 'quadro_cache_witnessing_v1',
  GROUPS: 'quadro_cache_groups_v1',
  CARD_IMAGES: 'quadro_cache_card_images_v1',
  CUSTOM_TRANSLATIONS: 'quadro_cache_custom_translations_v1',
  USER_ACCOUNTS: 'quadro_cache_user_accounts_v1',
  LAST_UPDATE: 'quadro_cache_last_update_v1',
};

export function getCachedItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading local storage cache for key ${key}:`, err);
    return null;
  }
}

export function setCachedItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(CACHE_KEYS.LAST_UPDATE, new Date().toISOString());
  } catch (err) {
    console.warn(`Error writing local storage cache for key ${key}:`, err);
  }
}

// Specific Getters & Setters
export const cacheService = {
  getMidweek: <T>() => getCachedItem<T[]>(CACHE_KEYS.MIDWEEK),
  setMidweek: <T>(data: T[]) => setCachedItem(CACHE_KEYS.MIDWEEK, data),

  getWeekend: <T>() => getCachedItem<T[]>(CACHE_KEYS.WEEKEND),
  setWeekend: <T>(data: T[]) => setCachedItem(CACHE_KEYS.WEEKEND, data),

  getAnnouncements: <T>() => getCachedItem<T[]>(CACHE_KEYS.ANNOUNCEMENTS),
  setAnnouncements: <T>(data: T[]) => setCachedItem(CACHE_KEYS.ANNOUNCEMENTS, data),

  getCleaning: <T>() => getCachedItem<T[]>(CACHE_KEYS.CLEANING),
  setCleaning: <T>(data: T[]) => setCachedItem(CACHE_KEYS.CLEANING, data),

  getWitnessing: <T>() => getCachedItem<T[]>(CACHE_KEYS.WITNESSING),
  setWitnessing: <T>(data: T[]) => setCachedItem(CACHE_KEYS.WITNESSING, data),

  getGroups: <T>() => getCachedItem<T[]>(CACHE_KEYS.GROUPS),
  setGroups: <T>(data: T[]) => setCachedItem(CACHE_KEYS.GROUPS, data),

  getCardImages: <T>() => getCachedItem<T>(CACHE_KEYS.CARD_IMAGES),
  setCardImages: <T>(data: T) => setCachedItem(CACHE_KEYS.CARD_IMAGES, data),

  getCustomTranslations: <T>() => getCachedItem<T>(CACHE_KEYS.CUSTOM_TRANSLATIONS),
  setCustomTranslations: <T>(data: T) => setCachedItem(CACHE_KEYS.CUSTOM_TRANSLATIONS, data),

  getUserAccounts: <T>() => getCachedItem<T[]>(CACHE_KEYS.USER_ACCOUNTS),
  setUserAccounts: <T>(data: T[]) => setCachedItem(CACHE_KEYS.USER_ACCOUNTS, data),

  getLastUpdate: () => localStorage.getItem(CACHE_KEYS.LAST_UPDATE),
  
  clearAll: () => {
    Object.values(CACHE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
};
