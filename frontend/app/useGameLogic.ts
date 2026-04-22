import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, HintState, JumbledWord } from './types';
import { getWords } from './wordService';
import { isValidWord } from './dictionaryService';

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

  // Dictionary validation errors: wordId -> true when the entered word isn't in the dictionary
  const [dictionaryErrors, setDictionaryErrors] = useState<Record<string, boolean>>({});
  // True while the current wordle row is flashing red (invalid word)
  const [wordleCurrentRowInvalid, setWordleCurrentRowInvalid] = useState(false);

  // Word-jumble mode: valid words found so far, keyed by wordId
  const [foundWords, setFoundWords] = useState<Record<string, string[]>>({});
  // True when the entered word was rejected; auto-clears after a short delay
  const [invalidWordError, setInvalidWordError] = useState(false);
  const invalidWordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True when the entered word is already in the found-words list; auto-clears after a short delay
  const [duplicateWordError, setDuplicateWordError] = useState(false);
  const duplicateWordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True once the player has typed the correct original word for the current puzzle
  const [wordSolved, setWordSolved] = useState(false);
  // Hint indices captured at the moment of solving (so the solved display keeps the correct colours)
  const [solvedHintIndices, setSolvedHintIndices] = useState<number[]>([]);

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

    const timer = setTimeout(async () => {
      const guessWord = wordleCurrentGuess;

      // Check the dictionary before committing the row
      const valid = await isValidWord(guessWord);
      if (!valid) {
        // Flash the row red, then clear so the player can re-type
        setWordleCurrentRowInvalid(true);
        setTimeout(() => {
          setWordleCurrentGuess('');
          setWordleCurrentRowInvalid(false);
        }, 600);
        return;
      }

      const newGuesses = [...wordleGuesses, guessWord];
      setWordleGuesses(newGuesses);
      setWordleCurrentGuess('');
      setWordleAttempt(newGuesses.length);

      const correct = guessWord.toLowerCase() === currentWord.original.toLowerCase();
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
    setSolvedHintIndices([]);
    setDictionaryErrors({});
    setWordleCurrentRowInvalid(false);
    setFoundWords({});
    setInvalidWordError(false);
    setDuplicateWordError(false);
    setWordSolved(false);
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
    setSolvedHintIndices([]);
    setDictionaryErrors({});
    setWordleCurrentRowInvalid(false);
    setFoundWords({});
    setInvalidWordError(false);
    setDuplicateWordError(false);
    setWordSolved(false);
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
      setWordSolved(false);
      setSolvedHintIndices([]);
      setInvalidWordError(false);
      setDuplicateWordError(false);
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

  // Shows the "Invalid word" message and auto-dismisses it after 1.5 s
  const showInvalidWordError = () => {
    if (invalidWordTimerRef.current) clearTimeout(invalidWordTimerRef.current);
    setInvalidWordError(true);
    invalidWordTimerRef.current = setTimeout(() => setInvalidWordError(false), 1500);
  };

  const showDuplicateWordError = () => {
    if (duplicateWordTimerRef.current) clearTimeout(duplicateWordTimerRef.current);
    setDuplicateWordError(true);
    duplicateWordTimerRef.current = setTimeout(() => setDuplicateWordError(false), 1500);
  };

  // Handler for single-word mode text input
  const handleSingleWordChange = (text: string) => {
    const currentWord = gameState.words[gameState.currentIndex];
    const cleanText = text.replace(/[^a-zA-Z]/g, '');

    // Clear "invalid word" overlay whenever the user edits the input
    if (invalidWordError) setInvalidWordError(false);

    setCurrentAnswer(cleanText);

    if (cleanText.length === currentWord.length) {
      setTimeout(async () => {
        // Reject words that don't use exactly the same letters as the puzzle
        const sortedInput    = cleanText.toLowerCase().split('').sort().join('');
        const sortedOriginal = currentWord.original.toLowerCase().split('').sort().join('');
        if (sortedInput !== sortedOriginal) {
          showInvalidWordError();
          return;
        }

        const valid = await isValidWord(cleanText);
        if (!valid) {
          showInvalidWordError();
          return;
        }
        // Check if this valid word is the target word
        const correct = cleanText.toLowerCase().trim() === currentWord.original.toLowerCase();
        setCurrentAnswer('');

        if (correct) {
          // Accepted as the solution — snapshot hint indices before clearing for solved display
          setSolvedHintIndices(hints[currentWord.id] || []);
          setWordSolved(true);
          setGameState(prev => ({
            ...prev,
            answers: { ...prev.answers, [currentWord.id]: cleanText },
            results: { ...prev.results, [currentWord.id]: true },
            score: prev.score + 1,
          }));
        } else {
          // Valid English word but not the target
          const word = cleanText.toLowerCase();
          if ((foundWords[currentWord.id] || []).includes(word)) {
            showDuplicateWordError();
          } else {
            setFoundWords(prev => ({
              ...prev,
              [currentWord.id]: [...(prev[currentWord.id] || []), word],
            }));
          }
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
      setDictionaryErrors(prev => {
        const next = { ...prev };
        delete next[word.id];
        return next;
      });
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

    // Clear dictionary error when user edits
    if (cleanText.length < prevAnswer.length) {
      setDictionaryErrors(prev => {
        const next = { ...prev };
        delete next[word.id];
        return next;
      });
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
          // Check dictionary only for wrong answers
          isValidWord(cleanText).then(valid => {
            if (!valid) {
              setDictionaryErrors(prev => ({ ...prev, [word.id]: true }));
            }
          });
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
    // Keyboard style
    // Wordle
    wordleGuesses,
    wordleCurrentGuess,
    wordleAttempt,
    wordleGameOver,
    wordleWon,
    // Dictionary validation
    dictionaryErrors,
    wordleCurrentRowInvalid,
    // Word-jumble feature
    foundWords,
    invalidWordError,
    duplicateWordError,
    wordSolved,
    solvedHintIndices,
  };
}
