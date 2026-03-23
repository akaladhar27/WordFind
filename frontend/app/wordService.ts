import { JumbledWord } from './types';

const WORD_LISTS: Record<number, string[]> = {
  4: [
    'book', 'tree', 'game', 'play', 'word', 'time', 'life', 'home', 'work', 'love',
    'fish', 'bird', 'moon', 'star', 'rain', 'snow', 'leaf', 'rock', 'sand', 'wave',
    'cake', 'milk', 'rice', 'soup', 'meat', 'corn', 'bean', 'salt', 'chip', 'nuts',
    'bear', 'deer', 'frog', 'goat', 'lamb', 'lion', 'moth', 'seal', 'swan', 'wolf',
    'blue', 'gold', 'gray', 'pink', 'teal', 'jade', 'rose', 'ruby', 'onyx', 'opal',
  ],
  5: [
    'apple', 'grape', 'lemon', 'mango', 'peach', 'beach', 'ocean', 'river', 'storm', 'cloud',
    'house', 'table', 'chair', 'couch', 'light', 'music', 'dance', 'smile', 'laugh', 'dream',
    'bread', 'toast', 'pasta', 'pizza', 'salad', 'green', 'brown', 'white', 'black', 'cream',
    'tiger', 'zebra', 'horse', 'mouse', 'sheep', 'whale', 'shark', 'eagle', 'robin', 'crane',
    'water', 'earth', 'flame', 'stone', 'glass', 'metal', 'paper', 'cloth', 'wood', 'brick',
  ],
  6: [
    'banana', 'orange', 'cherry', 'papaya', 'tomato', 'garden', 'flower', 'forest', 'meadow', 'canyon',
    'window', 'mirror', 'pillow', 'carpet', 'closet', 'planet', 'rocket', 'galaxy', 'cosmos', 'comet',
    'butter', 'cheese', 'yogurt', 'cereal', 'waffle', 'purple', 'yellow', 'silver', 'golden', 'copper',
    'rabbit', 'turtle', 'monkey', 'parrot', 'pigeon', 'salmon', 'shrimp', 'oyster', 'clover', 'cactus',
    'bridge', 'castle', 'church', 'market', 'school', 'museum', 'temple', 'palace', 'tunnel', 'island',
  ],
  7: [
    'avocado', 'apricot', 'coconut', 'pumpkin', 'spinach', 'rainbow', 'thunder', 'volcano', 'glacier', 'tornado',
    'kitchen', 'bedroom', 'balcony', 'hallway', 'library', 'jupiter', 'neptune', 'mercury', 'uranium', 'element',
    'chicken', 'seafood', 'popcorn', 'pretzel', 'biscuit', 'diamond', 'emerald', 'crystal', 'granite', 'ceramic',
    'dolphin', 'penguin', 'gorilla', 'buffalo', 'leopard', 'panther', 'peacock', 'seagull', 'sparrow', 'cricket',
    'airport', 'station', 'factory', 'stadium', 'theater', 'gallery', 'academy', 'college', 'capitol', 'embassy',
  ],
  8: [
    'blueberry', 'raspberry', 'pineapple', 'broccoli', 'zucchini', 'sunshine', 'moonlight', 'starlight', 'twilight', 'midnight',
    'bathroom', 'basement', 'elevator', 'stairway', 'corridor', 'asteroid', 'satellite', 'universe', 'molecule', 'particle',
    'sandwich', 'smoothie', 'pancakes', 'doughnut', 'meatball', 'amethyst', 'sapphire', 'platinum', 'titanium', 'aluminum',
    'elephant', 'kangaroo', 'flamingo', 'antelope', 'squirrel', 'caterpillar', 'crocodile', 'butterfly', 'dragonfly', 'honeybee',
    'hospital', 'monument', 'cathedral', 'fountain', 'skyscraper', 'aquarium', 'pavilion', 'coliseum', 'sanctuary', 'monastery',
  ],
};

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
