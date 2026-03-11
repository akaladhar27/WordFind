import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Types
interface JumbledWord {
  id: string;
  original: string;
  jumbled: string;
  length: number;
}

interface GameState {
  words: JumbledWord[];
  currentIndex: number;
  score: number;
  answers: { [key: string]: string };
  results: { [key: string]: boolean | null };
}

interface HintState {
  [wordId: string]: number[]; // Array of revealed letter indices
}

// Neutral color palette
const COLORS = {
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

export default function WordUnjumbleGame() {
  // Game settings
  const [wordLength, setWordLength] = useState(5);
  const [wordCount, setWordCount] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
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

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hint state - tracks revealed letter indices for each word
  const [hints, setHints] = useState<HintState>({});

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get hint for a word - reveals one unrevealed letter
  const getHint = (wordId: string, originalWord: string) => {
    const currentHints = hints[wordId] || [];
    const unrevealedIndices: number[] = [];
    
    // Find indices that haven't been revealed yet
    for (let i = 0; i < originalWord.length; i++) {
      if (!currentHints.includes(i)) {
        unrevealedIndices.push(i);
      }
    }
    
    if (unrevealedIndices.length === 0) return; // All letters already revealed
    
    // Pick a random unrevealed index
    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    
    setHints(prev => ({
      ...prev,
      [wordId]: [...(prev[wordId] || []), randomIndex],
    }));
  };

  // Get hint display string for a word
  const getHintDisplay = (wordId: string, originalWord: string): string => {
    const revealedIndices = hints[wordId] || [];
    if (revealedIndices.length === 0) return '';
    
    return originalWord
      .split('')
      .map((letter, index) => (revealedIndices.includes(index) ? letter.toUpperCase() : '_'))
      .join(' ');
  };

  // Check if hint is available (not all letters revealed)
  const canGetHint = (wordId: string, wordLength: number): boolean => {
    const revealedCount = (hints[wordId] || []).length;
    return revealedCount < wordLength - 1; // Leave at least one letter unrevealed
  };

  // Reshuffle letters of a word
  const reshuffleWord = (wordId: string) => {
    setGameState(prev => {
      const wordIndex = prev.words.findIndex(w => w.id === wordId);
      if (wordIndex === -1) return prev;
      
      const word = prev.words[wordIndex];
      const letters = word.jumbled.split('');
      
      // Shuffle the letters
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      
      const newJumbled = letters.join('');
      
      // Update the word with new jumbled letters
      const newWords = [...prev.words];
      newWords[wordIndex] = { ...word, jumbled: newJumbled };
      
      return { ...prev, words: newWords };
    });
  };

  // Fetch words from API
  const fetchWords = useCallback(async () => {
    setLoading(true);
    // Reset timer and hints
    setElapsedTime(0);
    setTimerRunning(false);
    setHints({});
    try {
      const response = await fetch(`${BACKEND_URL}/api/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_length: wordLength,
          word_count: wordCount,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      
      const data = await response.json();
      
      setGameState({
        words: data.words,
        currentIndex: 0,
        score: 0,
        answers: {},
        results: {},
      });
      setGameStarted(true);
      setGameCompleted(false);
      setCurrentAnswer('');
      setShowResult(false);
      // Start timer when game loads
      setTimerRunning(true);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  }, [wordLength, wordCount]);

  // Start new game on mount
  useEffect(() => {
    fetchWords();
  }, []);

  // Check answer for single word mode
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

  // Check all answers for multi-word mode
  const checkAllAnswers = () => {
    Keyboard.dismiss();
    let correctCount = 0;
    const newResults: { [key: string]: boolean } = {};
    
    gameState.words.forEach(word => {
      const userAnswer = gameState.answers[word.id] || '';
      const isCorrect = userAnswer.toLowerCase().trim() === word.original.toLowerCase();
      newResults[word.id] = isCorrect;
      if (isCorrect) correctCount++;
    });
    
    setGameState(prev => ({
      ...prev,
      results: newResults,
      score: correctCount,
    }));
    setShowResult(true);
    setGameCompleted(true);
  };

  // Update answer for a specific word in multi-word mode
  const updateAnswer = (wordId: string, answer: string) => {
    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [wordId]: answer },
    }));
  };

  // Check if all answers are filled
  const allAnswersFilled = () => {
    return gameState.words.every(word => {
      const answer = gameState.answers[word.id];
      return answer && answer.trim().length > 0;
    });
  };

  // Move to next word
  const nextWord = () => {
    setShowResult(false);
    setCurrentAnswer('');
    
    if (gameState.currentIndex < gameState.words.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      setGameCompleted(true);
    }
  };

  // Temporary settings state for modal (to prevent blinking)
  const [tempWordLength, setTempWordLength] = useState(wordLength);
  const [tempWordCount, setTempWordCount] = useState(wordCount);

  // Open settings modal with current values
  const openSettings = () => {
    setTempWordLength(wordLength);
    setTempWordCount(wordCount);
    setShowSettings(true);
  };

  // Close settings without applying
  const closeSettings = () => {
    setShowSettings(false);
  };

  // Apply settings and start new game
  const applySettings = () => {
    setWordLength(tempWordLength);
    setWordCount(tempWordCount);
    setShowSettings(false);
    // Fetch words with new settings
    fetchWordsWithSettings(tempWordLength, tempWordCount);
  };

  // Fetch words with specific settings
  const fetchWordsWithSettings = async (length: number, count: number) => {
    setLoading(true);
    // Reset timer and hints
    setElapsedTime(0);
    setTimerRunning(false);
    setHints({});
    try {
      const response = await fetch(`${BACKEND_URL}/api/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_length: length,
          word_count: count,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      
      const data = await response.json();
      
      setGameState({
        words: data.words,
        currentIndex: 0,
        score: 0,
        answers: {},
        results: {},
      });
      setGameStarted(true);
      setGameCompleted(false);
      setCurrentAnswer('');
      setShowResult(false);
      // Start timer when game loads
      setTimerRunning(true);
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render letter cards for jumbled word
  const renderJumbledWord = (word: string) => {
    return (
      <View style={styles.letterContainer}>
        {word.split('').map((letter, index) => (
          <View key={index} style={styles.letterCard}>
            <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Game Completed Screen
  const GameCompletedScreen = () => (
    <View style={styles.completedContainer}>
      <Ionicons name="trophy" size={80} color={COLORS.accent} />
      <Text style={styles.completedTitle}>Game Complete!</Text>
      <Text style={styles.completedScore}>
        Score: {gameState.score} / {gameState.words.length}
      </Text>
      <Text style={styles.completedPercentage}>
        {Math.round((gameState.score / gameState.words.length) * 100)}% Correct
      </Text>
      <View style={styles.completedTimeContainer}>
        <Ionicons name="time-outline" size={20} color={COLORS.textLight} />
        <Text style={styles.completedTime}>Time: {formatTime(elapsedTime)}</Text>
      </View>
      
      <View style={styles.completedButtons}>
        <TouchableOpacity
          style={[styles.completedButton, styles.playAgainButton]}
          onPress={fetchWords}
        >
          <Ionicons name="refresh" size={20} color={COLORS.card} />
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.completedButton, styles.settingsButton]}
          onPress={openSettings}
        >
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          <Text style={styles.settingsButtonText}>Change Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentWord = gameState.words[gameState.currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Word Unjumble</Text>
            <Text style={styles.subtitle}>
              {wordLength} letters • {wordCount} word{wordCount > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Timer Display */}
            {gameStarted && !loading && (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.settingsIcon}
              onPress={openSettings}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        ) : gameCompleted ? (
          <GameCompletedScreen />
        ) : gameState.words.length > 1 ? (
          /* Multi-word mode - show all words at once */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Header */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {gameState.words.length} words to unjumble
              </Text>
              <Text style={styles.scoreText}>
                {wordLength} letters each
              </Text>
            </View>

            {/* All Words List */}
            {gameState.words.map((word, index) => (
              <View key={word.id} style={styles.multiWordCard}>
                <View style={styles.multiWordHeader}>
                  <Text style={styles.multiWordNumber}>#{index + 1}</Text>
                  {showResult && gameState.results[word.id] !== undefined && (
                    <Ionicons
                      name={gameState.results[word.id] ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={gameState.results[word.id] ? COLORS.successDark : COLORS.errorDark}
                    />
                  )}
                </View>
                
                {/* Jumbled Letters */}
                <View style={styles.multiWordLetters}>
                  {word.jumbled.split('').map((letter, letterIndex) => (
                    <View key={letterIndex} style={styles.smallLetterCard}>
                      <Text style={styles.smallLetterText}>{letter.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>

                {/* Hint Display and Button */}
                {!showResult && (
                  <View style={styles.hintSection}>
                    {(hints[word.id] || []).length > 0 && (
                      <Text style={styles.hintDisplay}>
                        Hint: {getHintDisplay(word.id, word.original)}
                      </Text>
                    )}
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.hintButton,
                          !canGetHint(word.id, word.length) && styles.hintButtonDisabled,
                        ]}
                        onPress={() => getHint(word.id, word.original)}
                        disabled={!canGetHint(word.id, word.length)}
                      >
                        <Ionicons name="bulb-outline" size={16} color={canGetHint(word.id, word.length) ? COLORS.hintDark : COLORS.textMuted} />
                        <Text style={[
                          styles.hintButtonText,
                          !canGetHint(word.id, word.length) && styles.hintButtonTextDisabled,
                        ]}>
                          Hint ({(hints[word.id] || []).length}/{word.length - 1})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.reshuffleButton}
                        onPress={() => reshuffleWord(word.id)}
                      >
                        <Ionicons name="shuffle-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.reshuffleButtonText}>Shuffle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {/* Answer Input */}
                {!showResult ? (
                  <TextInput
                    style={styles.multiWordInput}
                    value={gameState.answers[word.id] || ''}
                    onChangeText={(text) => updateAnswer(word.id, text)}
                    placeholder="Type your answer..."
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                ) : (
                  <View style={styles.multiWordResult}>
                    <Text style={[
                      styles.multiWordAnswer,
                      gameState.results[word.id] ? styles.answerCorrect : styles.answerIncorrect
                    ]}>
                      Your answer: {gameState.answers[word.id] || '(empty)'}
                    </Text>
                    {!gameState.results[word.id] && (
                      <Text style={styles.multiWordCorrect}>
                        Correct: {word.original.toUpperCase()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}

            {/* Check All Button */}
            {!showResult && (
              <TouchableOpacity
                style={[
                  styles.checkAllButton,
                  !allAnswersFilled() && styles.checkButtonDisabled,
                ]}
                onPress={checkAllAnswers}
                disabled={!allAnswersFilled()}
              >
                <Text style={styles.checkAllButtonText}>Check All Answers</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : currentWord ? (
          /* Single word mode - original behavior */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Word {gameState.currentIndex + 1} of {gameState.words.length}
              </Text>
              <Text style={styles.scoreText}>Score: {gameState.score}</Text>
            </View>

            {/* Jumbled Word Display */}
            <View style={styles.wordCard}>
              <Text style={styles.wordCardLabel}>Unjumble this word:</Text>
              {renderJumbledWord(currentWord.jumbled)}
              
              {/* Hint Section for single word */}
              {!showResult && (
                <View style={styles.singleWordHintSection}>
                  {(hints[currentWord.id] || []).length > 0 && (
                    <Text style={styles.singleWordHintDisplay}>
                      Hint: {getHintDisplay(currentWord.id, currentWord.original)}
                    </Text>
                  )}
                  <View style={styles.singleWordActionButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.singleWordHintButton,
                        !canGetHint(currentWord.id, currentWord.length) && styles.hintButtonDisabled,
                      ]}
                      onPress={() => getHint(currentWord.id, currentWord.original)}
                      disabled={!canGetHint(currentWord.id, currentWord.length)}
                    >
                      <Ionicons 
                        name="bulb-outline" 
                        size={18} 
                        color={canGetHint(currentWord.id, currentWord.length) ? COLORS.hintDark : COLORS.textMuted} 
                      />
                      <Text style={[
                        styles.singleWordHintButtonText,
                        !canGetHint(currentWord.id, currentWord.length) && styles.hintButtonTextDisabled,
                      ]}>
                        Hint ({(hints[currentWord.id] || []).length}/{currentWord.length - 1})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.singleWordReshuffleButton}
                      onPress={() => reshuffleWord(currentWord.id)}
                    >
                      <Ionicons name="shuffle-outline" size={18} color={COLORS.primary} />
                      <Text style={styles.singleWordReshuffleButtonText}>Shuffle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Answer Input */}
            {!showResult ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={currentAnswer}
                  onChangeText={setCurrentAnswer}
                  placeholder="Type your answer..."
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={currentAnswer.length > 0 ? checkAnswer : undefined}
                />
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    currentAnswer.length === 0 && styles.checkButtonDisabled,
                  ]}
                  onPress={checkAnswer}
                  disabled={currentAnswer.length === 0}
                >
                  <Text style={styles.checkButtonText}>Check</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.resultContainer}>
                <View
                  style={[
                    styles.resultBox,
                    isCorrect ? styles.resultCorrect : styles.resultIncorrect,
                  ]}
                >
                  <Ionicons
                    name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={40}
                    color={isCorrect ? COLORS.successDark : COLORS.errorDark}
                  />
                  <Text
                    style={[
                      styles.resultText,
                      isCorrect ? styles.resultTextCorrect : styles.resultTextIncorrect,
                    ]}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </Text>
                  {!isCorrect && (
                    <Text style={styles.correctAnswerText}>
                      The word was: <Text style={styles.correctWord}>{currentWord.original.toUpperCase()}</Text>
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity style={styles.nextButton} onPress={nextWord}>
                  <Text style={styles.nextButtonText}>
                    {gameState.currentIndex < gameState.words.length - 1
                      ? 'Next Word'
                      : 'See Results'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.card} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : null}

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={closeSettings}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Game Settings</Text>
                <TouchableOpacity onPress={closeSettings}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Word Length Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Word Complexity (Letters)</Text>
                <View style={styles.optionRow}>
                  {[4, 5, 6, 7, 8].map((length) => (
                    <TouchableOpacity
                      key={length}
                      style={[
                        styles.optionButton,
                        tempWordLength === length && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempWordLength(length)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempWordLength === length && styles.optionTextActive,
                        ]}
                      >
                        {length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Word Count Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Number of Words</Text>
                <View style={styles.optionRow}>
                  {[1, 3, 5, 10].map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.optionButton,
                        tempWordCount === count && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempWordCount(count)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          tempWordCount === count && styles.optionTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={applySettings}>
                <Text style={styles.applyButtonText}>Start New Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  gameContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  wordCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  wordCardLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  letterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterCard: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.card,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.card,
  },
  resultContainer: {
    gap: 16,
  },
  resultBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  resultCorrect: {
    backgroundColor: '#E6FFED',
  },
  resultIncorrect: {
    backgroundColor: '#FFF5F5',
  },
  resultText: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  resultTextCorrect: {
    color: COLORS.successDark,
  },
  resultTextIncorrect: {
    color: COLORS.errorDark,
  },
  correctAnswerText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
  },
  correctWord: {
    fontWeight: '700',
    color: COLORS.text,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.card,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  completedScore: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
  },
  completedPercentage: {
    fontSize: 18,
    color: COLORS.textLight,
    marginTop: 4,
  },
  completedButtons: {
    marginTop: 32,
    gap: 12,
    width: '100%',
  },
  completedButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.card,
  },
  settingsButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  optionTextActive: {
    color: COLORS.card,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.card,
  },
  // Multi-word mode styles
  multiWordCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  multiWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  multiWordNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  multiWordLetters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  smallLetterCard: {
    width: 40,
    height: 46,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallLetterText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.card,
  },
  multiWordInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiWordResult: {
    alignItems: 'center',
    gap: 4,
  },
  multiWordAnswer: {
    fontSize: 14,
    fontWeight: '500',
  },
  answerCorrect: {
    color: COLORS.successDark,
  },
  answerIncorrect: {
    color: COLORS.errorDark,
  },
  multiWordCorrect: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  checkAllButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  checkAllButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.card,
  },
  // Timer styles
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  completedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  completedTime: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  // Hint styles for multi-word mode
  hintSection: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  hintDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.hintDark,
    letterSpacing: 2,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.hint,
    gap: 4,
  },
  hintButtonDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  hintButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.hintDark,
  },
  hintButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  // Hint styles for single word mode
  singleWordHintSection: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  singleWordHintDisplay: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.hintDark,
    letterSpacing: 4,
  },
  singleWordHintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.hint,
    gap: 6,
  },
  singleWordHintButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.hintDark,
  },
  // Action buttons row styles
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  reshuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  reshuffleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  // Single word mode action buttons
  singleWordActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  singleWordReshuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  singleWordReshuffleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
});
