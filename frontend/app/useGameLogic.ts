import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, HintState, JumbledWord } from './types';
import { getWords } from './wordService';

export function useGameLogic() {
  // Game settings
  const [wordLength, setWordLength] = useState(5);
  const [wordCount, setWordCount] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [gameStyle, setGameStyle] = useState<'classic' | 'wordle'>('classic');

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    words: [],
    currentIndex: 0,
    score: 0,
    answers: {},
    results: {},
  });
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeLimitExpired, setTimeLimitExpired] = useState(false);

  // Wordle state
  const [wordleGuesses, setWordleGuesses] = useState<string[]>([]);
  const [wordleCurrentGuess, setWordleCurrentGuess] = useState('');
  const [wordleAttempt, setWordleAttempt] = useState(0);
  const [wordleGameOver, setWordleGameOver] = useState(false);
  const [wordleWon, setWordleWon] = useState(false);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hint state
  const [hints, setHints] = useState<HintState>({});

  // Seen words — keyed by word length, values are sets of original words already played
  const [seenWords, setSeenWords] = useState<Record<number, string[]>>({});

  const seenWordsKey = (length: number) => `seen_words_${length}`;

  const loadSeenWords = async (length: number): Promise<string[]> => {
    try {
      const stored = await AsyncStorage.getItem(seenWordsKey(length));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveSeenWords = async (length: number, words: string[]) => {
    try {
      await AsyncStorage.setItem(seenWordsKey(length), JSON.stringify(words));
    } catch {
      // storage errors are non-fatal
    }
  };

  const addSeenWords = async (length: number, newWords: string[]) => {
    const existing = await loadSeenWords(length);
    const merged = Array.from(new Set([...existing, ...newWords.map(w => w.toLowerCase())]));
    setSeenWords(prev => ({ ...prev, [length]: merged }));
    await saveSeenWords(length, merged);
    return merged;
  };

  // Temporary settings state for modal
  const [tempWordLength, setTempWordLength] = useState(wordLength);
  const [tempWordCount, setTempWordCount] = useState(wordCount);
  const [tempTimeLimit, setTempTimeLimit] = useState<number | null>(null);
  const [tempGameStyle, setTempGameStyle] = useState<'classic' | 'wordle'>('classic');

  // Timer effect
  useEffect(() => {
    if (timerRunning && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, gameCompleted]);

  // Wordle auto-submit when guess reaches word length
  useEffect(() => {
    const currentWord = gameState.words[0];
    if (!currentWord || wordleGameOver || gameStyle !== 'wordle') return;
    if (wordleCurrentGuess.length !== currentWord.length) return;

    const timer = setTimeout(() => {
      const newGuesses = [...wordleGuesses, wordleCurrentGuess];
      setWordleGuesses(newGuesses);
      setWordleCurrentGuess('');
      setWordleAttempt(newGuesses.length);

      const correct = wordleCurrentGuess.toLowerCase() === currentWord.original.toLowerCase();
      if (correct) {
        setWordleWon(true);
        setWordleGameOver(true);
        setTimerRunning(false);
        setGameState(prev => ({
          ...prev,
          score: 1,
          results: { ...prev.results, [currentWord.id]: true },
        }));
      } else if (newGuesses.length >= wordLength + 1) {
        setWordleGameOver(true);
        setTimerRunning(false);
        setGameState(prev => ({
          ...prev,
          results: { ...prev.results, [currentWord.id]: false },
        }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [wordleCurrentGuess, wordleGuesses, wordleGameOver, gameStyle, gameState.words]);

  // Time limit expiry effect
  useEffect(() => {
    if (timeLimit !== null && elapsedTime >= timeLimit && timerRunning) {
      setTimerRunning(false);
      setTimeLimitExpired(true);
      setShowSummary(true);
    }
  }, [elapsedTime, timeLimit, timerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHint = (wordId: string, originalWord: string) => {
    const currentHints = hints[wordId] || [];
    const unrevealedIndices: number[] = [];
    for (let i = 0; i < originalWord.length; i++) {
      if (!currentHints.includes(i)) {
        unrevealedIndices.push(i);
      }
    }
    if (unrevealedIndices.length === 0) return;
    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    setHints(prev => ({
      ...prev,
      [wordId]: [...(prev[wordId] || []), randomIndex],
    }));
  };

  const getHintDisplay = (wordId: string, originalWord: string): string => {
    const revealedIndices = hints[wordId] || [];
    if (revealedIndices.length === 0) return '';
    return originalWord
      .split('')
      .map((letter, index) => (revealedIndices.includes(index) ? letter.toUpperCase() : '_'))
      .join(' ');
  };

  const canGetHint = (wordId: string, wLength: number): boolean => {
    const revealedCount = (hints[wordId] || []).length;
    return revealedCount < wLength - 1;
  };

  const reshuffleWord = (wordId: string) => {
    setGameState(prev => {
      const wordIndex = prev.words.findIndex(w => w.id === wordId);
      if (wordIndex === -1) return prev;
      const word = prev.words[wordIndex];
      const letters = word.jumbled.split('');
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      const newWords = [...prev.words];
      newWords[wordIndex] = { ...word, jumbled: letters.join('') };
      return { ...prev, words: newWords };
    });
  };

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setElapsedTime(0);
    setTimerRunning(false);
    setTimeLimitExpired(false);
    setWordleGuesses([]);
    setWordleCurrentGuess('');
    setWordleAttempt(0);
    setWordleGameOver(false);
    setWordleWon(false);
    setHints({});
    try {
      const exclude = await loadSeenWords(wordLength);
      const words = getWords(wordLength, wordCount, exclude);
      setGameState({ words, currentIndex: 0, score: 0, answers: {}, results: {} });
      setGameStarted(true);
      setGameCompleted(false);
      setCurrentAnswer('');
      setShowResult(false);
      setTimerRunning(true);
      await addSeenWords(wordLength, words.map(w => w.original));
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  }, [wordLength, wordCount]);

  // Start new game on mount
  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWordsWithSettings = async (length: number, count: number) => {
    setLoading(true);
    setElapsedTime(0);
    setTimerRunning(false);
    setTimeLimitExpired(false);
    setWordleGuesses([]);
    setWordleCurrentGuess('');
    setWordleAttempt(0);
    setWordleGameOver(false);
    setWordleWon(false);
    setHints({});
    try {
      const exclude = await loadSeenWords(length);
      const words = getWords(length, count, exclude);
      setGameState({ words, currentIndex: 0, score: 0, answers: {}, results: {} });
      setGameStarted(true);
      setGameCompleted(false);
      setCurrentAnswer('');
      setShowResult(false);
      setTimerRunning(true);
      await addSeenWords(length, words.map(w => w.original));
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOneMoreWord = async () => {
    try {
      const exclude = await loadSeenWords(wordLength);
      const [newWord] = getWords(wordLength, 1, exclude);
      setGameState(prev => ({
        ...prev,
        words: [...prev.words, newWord],
        currentIndex: prev.words.length,
      }));
      setCurrentAnswer('');
      setShowResult(false);
      await addSeenWords(wordLength, [newWord.original]);
    } catch (error) {
      console.error('Error loading one more word:', error);
    }
  };

  const checkAnswer = () => {
    Keyboard.dismiss();
    const currentWord = gameState.words[gameState.currentIndex];
    const correct = currentAnswer.toLowerCase().trim() === currentWord.original.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentWord.id]: currentAnswer },
      results: { ...prev.results, [currentWord.id]: correct },
      score: correct ? prev.score + 1 : prev.score,
    }));
  };

  const checkAllAnswers = () => {
    Keyboard.dismiss();
    let correctCount = 0;
    const newResults: { [key: string]: boolean } = {};
    gameState.words.forEach(word => {
      const userAnswer = gameState.answers[word.id] || '';
      const correct = userAnswer.toLowerCase().trim() === word.original.toLowerCase();
      newResults[word.id] = correct;
      if (correct) correctCount++;
    });
    setGameState(prev => ({ ...prev, results: newResults, score: correctCount }));
    setShowResult(true);
    setGameCompleted(true);
  };

  const updateAnswer = (wordId: string, answer: string) => {
    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [wordId]: answer },
    }));
  };

  const allAnswersFilled = () => {
    return gameState.words.every(word => {
      const answer = gameState.answers[word.id];
      return answer && answer.trim().length > 0;
    });
  };

  const nextWord = () => {
    setShowResult(false);
    setCurrentAnswer('');
    if (gameState.currentIndex < gameState.words.length - 1) {
      setGameState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      setTimerRunning(false);
      setGameCompleted(true);
    }
  };

  const openSettings = () => {
    setTempWordLength(wordLength);
    setTempWordCount(wordCount);
    setTempTimeLimit(timeLimit);
    setTempGameStyle(gameStyle);
    setShowSettings(true);
  };

  const closeSettings = () => setShowSettings(false);

  const applySettings = () => {
    const effectiveWordCount = tempGameStyle === 'wordle' ? 1 : tempWordCount;
    setWordLength(tempWordLength);
    setWordCount(effectiveWordCount);
    setTimeLimit(tempTimeLimit);
    setGameStyle(tempGameStyle);
    setShowSettings(false);
    fetchWordsWithSettings(tempWordLength, effectiveWordCount);
  };

  // Handler for single-word mode text input
  const handleSingleWordChange = (text: string) => {
    const currentWord = gameState.words[gameState.currentIndex];
    const cleanText = text.replace(/[^a-zA-Z]/g, '');

    if (showResult && !isCorrect && cleanText.length < currentAnswer.length) {
      setShowResult(false);
      setCurrentAnswer(cleanText);
      return;
    }

    setCurrentAnswer(cleanText);

    if (showResult && isCorrect) {
      setShowResult(false);
    }

    if (cleanText.length === currentWord.length && !showResult) {
      setTimeout(() => {
        const correct = cleanText.toLowerCase().trim() === currentWord.original.toLowerCase();
        setIsCorrect(correct);
        setShowResult(true);
        if (correct) {
          setGameState(prev => ({
            ...prev,
            answers: { ...prev.answers, [currentWord.id]: cleanText },
            results: { ...prev.results, [currentWord.id]: correct },
            score: prev.score + 1,
          }));
        }
      }, 100);
    }
  };

  // Handler for multi-word mode text input
  const handleMultiWordChange = (word: JumbledWord, text: string) => {
    const cleanText = text.replace(/[^a-zA-Z]/g, '');
    const wordResult = gameState.results[word.id];
    const isWordChecked = wordResult !== undefined;
    const isWordCorrect = wordResult === true;
    const prevAnswer = gameState.answers[word.id] || '';

    if (isWordChecked && !isWordCorrect && cleanText.length < prevAnswer.length) {
      setGameState(prev => {
        const newResults = { ...prev.results };
        delete newResults[word.id];
        return {
          ...prev,
          answers: { ...prev.answers, [word.id]: cleanText },
          results: newResults,
        };
      });
      return;
    }

    updateAnswer(word.id, cleanText);

    if (cleanText.length === word.length && !isWordChecked) {
      setTimeout(() => {
        const correct = cleanText.toLowerCase().trim() === word.original.toLowerCase();
        if (correct) {
          setGameState(prev => ({
            ...prev,
            results: { ...prev.results, [word.id]: correct },
            score: prev.score + 1,
          }));
        } else {
          setGameState(prev => ({
            ...prev,
            results: { ...prev.results, [word.id]: correct },
          }));
        }
      }, 100);
    }
  };

  const handleWordleChange = (text: string) => {
    if (wordleGameOver) return;
    const cleanText = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
    setWordleCurrentGuess(cleanText);
  };

  return {
    // Settings
    wordLength,
    wordCount,
    showSettings,
    tempWordLength,
    tempWordCount,
    setTempWordLength,
    setTempWordCount,
    openSettings,
    closeSettings,
    applySettings,
    // Game state
    gameState,
    loading,
    gameStarted,
    gameCompleted,
    // Single word
    currentAnswer,
    showResult,
    isCorrect,
    // Summary
    showSummary,
    setShowSummary,
    // Timer
    elapsedTime,
    formatTime,
    timeLimit,
    timeLimitExpired,
    tempTimeLimit,
    setTempTimeLimit,
    // Hints
    hints,
    getHint,
    getHintDisplay,
    canGetHint,
    // Actions
    fetchWords,
    fetchOneMoreWord,
    reshuffleWord,
    nextWord,
    checkAnswer,
    checkAllAnswers,
    allAnswersFilled,
    // Input handlers
    handleSingleWordChange,
    handleMultiWordChange,
    handleWordleChange,
    // Game style
    gameStyle,
    tempGameStyle,
    setTempGameStyle,
    // Wordle
    wordleGuesses,
    wordleCurrentGuess,
    wordleAttempt,
    wordleGameOver,
    wordleWon,
  };
}
