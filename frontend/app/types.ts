export interface JumbledWord {
  id: string;
  original: string;
  jumbled: string;
  length: number;
}

export interface GameState {
  words: JumbledWord[];
  currentIndex: number;
  score: number;
  answers: { [key: string]: string };
  results: { [key: string]: boolean | null };
}

export interface HintState {
  [wordId: string]: number[];
}

export const COLORS = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  primary: '#4A5568',
  primaryDark: '#2D3748',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  border: '#E2E8F0',
  success: '#68D391',
  successDark: '#48BB78',
  error: '#FC8181',
  errorDark: '#F56565',
  accent: '#718096',
  hint: '#ECC94B',
  hintDark: '#D69E2E',
};
