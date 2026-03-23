import { JumbledWord } from './types';
import { WORD_LISTS } from './wordLists';

function randomId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function shuffleWord(word: string): string {
  const letters = word.split('');
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const shuffled = letters.join('');
    if (shuffled !== word) return shuffled;
  }
  const reversed = word.split('').reverse().join('');
  return reversed !== word ? reversed : letters.slice(1).join('') + letters[0];
}

/** Returns `count` words of `length` letters, excluding any in the `exclude` list. */
export function getWords(wordLength: number, wordCount: number, exclude: string[] = []): JumbledWord[] {
  const length = Math.max(4, Math.min(8, wordLength));
  const count = Math.max(1, Math.min(20, wordCount));
  const excludeSet = new Set(exclude.map(w => w.toLowerCase()));

  const pool = (WORD_LISTS[length] ?? WORD_LISTS[5]).filter(w => !excludeSet.has(w.toLowerCase()));

  // If the pool is exhausted, fall back to the full list so the game never gets stuck
  const source = pool.length >= count ? pool : (WORD_LISTS[length] ?? WORD_LISTS[5]);

  const selected = randomSample(source, Math.min(count, source.length));

  return selected.map(word => ({
    id: randomId(),
    original: word,
    jumbled: shuffleWord(word),
    length: word.length,
  }));
}

function randomSample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
