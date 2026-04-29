const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// In-memory cache for the session — avoids duplicate network calls
const cache = new Map<string, boolean>();

/**
 * Returns true if the word exists in the English dictionary.
 * Network failures silently pass (returns true) to avoid penalising players.
 */
export async function isValidWord(word: string): Promise<boolean> {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const response = await fetch(`${DICTIONARY_API}/${key}`);
    const result = response.ok;
    cache.set(key, result);
    return result;
  } catch {
    return true; // network error — don't penalise
  }

}
