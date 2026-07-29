import { formatToDDMMYYYY } from './dateUtils';

/**
 * Text utility functions for cleaning and formatting strings.
 */

/**
 * Strips leading numbers, dots, spaces, hyphens, and colons from part titles.
 * Prevents duplicated section numbers when rendering.
 *
 * Examples:
 *  "4. Empiece conversaciones" -> "Empiece conversaciones"
 *  "7. 7. Seamos adaptables" -> "Seamos adaptables"
 *  "10. Necessidades Locais" -> "Necessidades Locais"
 *  "4. 4. Empiece conversaciones (3 min)" -> "Empiece conversaciones (3 min)"
 */
export function cleanPartTitle(title: string | undefined | null): string {
  if (!title) return '';
  const str = String(title).trim();
  
  // Strip repeated leading number patterns like "4. ", "7. ", "4.- ", "7: "
  const cleaned = str.replace(/^(?:\d+[\.\-\:\s]*)+/, '').trim();

  return cleaned || str;
}

/**
 * Cleans titles and dates inside a parsed week object (weekLabel, weekLabelEs, facaSeuMelhor, nossaVidaCrista)
 */
export function sanitizeParsedWeekTitles<T extends Record<string, any>>(week: T): T {
  if (!week || typeof week !== 'object') return week;

  const copy: Record<string, any> = { ...week };

  if (copy.weekLabel) {
    copy.weekLabel = formatToDDMMYYYY(copy.weekLabel);
  }
  if (copy.weekLabelEs) {
    copy.weekLabelEs = formatToDDMMYYYY(copy.weekLabelEs);
  }

  if (Array.isArray(copy.facaSeuMelhor)) {
    copy.facaSeuMelhor = copy.facaSeuMelhor.map((p: any) => ({
      ...p,
      title: cleanPartTitle(p?.title),
    }));
  }

  if (Array.isArray(copy.nossaVidaCrista)) {
    copy.nossaVidaCrista = copy.nossaVidaCrista.map((p: any) => ({
      ...p,
      title: cleanPartTitle(p?.title),
    }));
  }

  return copy as T;
}
