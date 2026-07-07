import { getDBConnection } from './databaseManager';

const _tafseerCache = new Map();

/**
 * Fetch Tafseer text for a given edition, surah, and ayah.
 * 
 * @param {string} edition - The translation/tafseer key (e.g. 'ar-tafseer-al-saddi')
 * @param {number} surah - The surah number (1-114)
 * @param {number} ayah - The ayah number (1-indexed)
 * @returns {Promise<string>} The Tafseer text
 */
export async function getTafseerText(edition, surah, ayah) {
  try {
    const db = await getDBConnection();
    if (!db) return 'Tafseer not found';
    
    const cacheKey = `${edition}_${surah}_${ayah}`;
    if (_tafseerCache.has(cacheKey)) {
      return _tafseerCache.get(cacheKey);
    }

    const row = await db.getFirstAsync(
      `SELECT text FROM Tafseer WHERE edition = ? AND surah = ? AND ayah = ?`,
      [edition, surah, ayah]
    );

    if (row && row.text) {
      _tafseerCache.set(cacheKey, row.text);
      return row.text;
    }
    
    return 'Tafseer not found';
  } catch (error) {
    console.error(`Failed to load Tafseer for ${edition}:`, error);
    return 'Error loading Tafseer';
  }
}

/**
 * Loads multiple tafseers in parallel and returns their texts along with their labels.
 */
export const getMultipleTafseerTexts = async (tafseerKeys, surahId, ayahId, language) => {
  if (!tafseerKeys || tafseerKeys.length === 0) return [];
  
  // Need to import TAFSEER_LIST to get labels. Since it's in ReferenceModal which is a component,
  // we can just pass the labels or the full objects, OR find the label in constants. 
  // Wait, TAFSEER_LIST is in constants, let's just return the keys and texts, and the caller can attach labels.
  // Actually, ReferenceModal has TAFSEER_LIST, so we just return { key, text }.
  
  const promises = tafseerKeys.map(async (key) => {
    const text = await getTafseerText(key, surahId, ayahId);
    return { key, text };
  });

  return Promise.all(promises);
};
