import React, { useState, useEffect, useCallback } from 'react';
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

  // Fetch words from API
  const fetchWords = useCallback(async () => {
    setLoading(true);
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

  // Check answer
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
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={openSettings}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        ) : gameCompleted ? (
          <GameCompletedScreen />
        ) : currentWord ? (
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
});
