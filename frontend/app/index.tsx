import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './types';
import { createStyles } from './styles';
import { useGameLogic } from './useGameLogic';
import { CustomKeyboard } from './CustomKeyboard';

export default function WordUnjumbleGame() {
  const {
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
    gameState,
    loading,
    gameStarted,
    gameCompleted,
    currentAnswer,
    showResult,
    isCorrect,
    showSummary,
    setShowSummary,
    elapsedTime,
    formatTime,
    timeLimit,
    timeLimitExpired,
    tempTimeLimit,
    setTempTimeLimit,
    hints,
    getHint,
    getHintDisplay,
    canGetHint,
    fetchWords,
    fetchOneMoreWord,
    reshuffleWord,
    handleSingleWordChange,
    handleMultiWordChange,
    handleWordleChange,
    gameStyle,
    tempGameStyle,
    setTempGameStyle,
    keyboardStyle,
    tempKeyboardStyle,
    setTempKeyboardStyle,
    wordleGuesses,
    wordleCurrentGuess,
    wordleAttempt,
    wordleGameOver,
    wordleWon,
    dictionaryErrors,
    wordleCurrentRowInvalid,
  } = useGameLogic();

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Memoise the full style sheet — rebuilds only when screen dimensions change
  const styles = useMemo(() => createStyles(screenWidth, screenHeight), [screenWidth, screenHeight]);

  // ── Responsive layout values ──────────────────────────────────────────────
  const contentPadding = Math.round(screenWidth * 0.043); // ~16px on 375
  const wordCardPadding = Math.round(screenWidth * 0.053); // ~20px on 375
  const tileGap = Math.round(screenWidth * 0.016);         // ~6px on 375

  // Wordle tile size: fill available width evenly
  const tileSize = Math.min(
    Math.round(screenWidth * 0.14),  // cap at ~14% of screen width
    Math.floor((screenWidth - contentPadding * 2 - (wordLength - 1) * tileGap) / wordLength)
  );

  // Single-word jumbled letter card: fill card width based on word length
  const letterGap = Math.round(screenWidth * 0.02);
  const availableCardWidth = screenWidth - contentPadding * 2 - wordCardPadding * 2;
  const letterCardSize = Math.min(
    Math.round(screenWidth * 0.155),  // max ~58px on 375
    Math.floor((availableCardWidth - (wordLength - 1) * letterGap) / wordLength)
  );
  const letterCardHeight = Math.round(letterCardSize * 1.15);
  const letterFontSize = Math.round(letterCardSize * 0.48);

  // Multi-word small letter cards
  const multiCardInnerWidth = screenWidth - contentPadding * 2 - Math.round(screenWidth * 0.037) * 2;
  const smallGap = Math.round(screenWidth * 0.013);
  const smallCardSize = Math.min(
    Math.round(screenWidth * 0.115), // max ~43px on 375
    Math.floor((multiCardInnerWidth - (wordLength - 1) * smallGap) / wordLength)
  );
  const smallCardHeight = Math.round(smallCardSize * 1.15);
  const smallFontSize = Math.round(smallCardSize * 0.48);

  const getTileStates = (guess: string, answer: string): ('correct' | 'present' | 'absent')[] => {
    const result: ('correct' | 'present' | 'absent')[] = Array(guess.length).fill('absent');
    const answerArr = answer.toLowerCase().split('');
    const guessArr = guess.toLowerCase().split('');
    // First pass: correct position (green)
    guessArr.forEach((letter, i) => {
      if (letter === answerArr[i]) {
        result[i] = 'correct';
        answerArr[i] = '#';
        guessArr[i] = '*';
      }
    });
    // Second pass: present but wrong position (yellow)
    guessArr.forEach((letter, i) => {
      if (letter === '*') return;
      const j = answerArr.indexOf(letter);
      if (j !== -1) {
        result[i] = 'present';
        answerArr[j] = '#';
      }
    });
    return result;
  };

  // Hidden input ref for capturing wordle keyboard input (system keyboard only)
  const wordleInputRef = useRef<TextInput>(null);

  // Focused word for multi-word + custom keyboard
  const [focusedWordId, setFocusedWordId] = useState<string | null>(null);

  // Auto-focus the hidden wordle input only when using system keyboard
  useEffect(() => {
    if (gameStyle === 'wordle' && !wordleGameOver && keyboardStyle === 'system') {
      const t = setTimeout(() => wordleInputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [gameStyle, wordleGameOver, keyboardStyle]);

  // Wordle letter states — used by custom keyboard for colour hints
  const wordleLetterStates = useMemo((): Record<string, 'correct' | 'present' | 'absent'> => {
    if (gameStyle !== 'wordle') return {};
    const currentWord = gameState.words[0];
    if (!currentWord) return {};
    const states: Record<string, 'correct' | 'present' | 'absent'> = {};
    wordleGuesses.forEach(guess => {
      const ts = getTileStates(guess, currentWord.original);
      guess.split('').forEach((ch, i) => {
        const s = ts[i];
        const k = ch.toLowerCase();
        if (s === 'correct') states[k] = 'correct';
        else if (s === 'present' && states[k] !== 'correct') states[k] = 'present';
        else if (s === 'absent' && !states[k]) states[k] = 'absent';
      });
    });
    return states;
  }, [gameStyle, wordleGuesses, gameState.words]);

  const useCustomKeyboard = keyboardStyle === 'custom';

  // Custom keyboard handlers
  const handleCustomKey = (key: string) => {
    if (gameStyle === 'wordle') {
      handleWordleChange(wordleCurrentGuess + key);
    } else if (gameState.words.length === 1) {
      const cw = gameState.words[gameState.currentIndex];
      if (cw) handleSingleWordChange(currentAnswer + key);
    } else {
      if (!focusedWordId) return;
      const word = gameState.words.find(w => w.id === focusedWordId);
      if (!word) return;
      handleMultiWordChange(word, (gameState.answers[focusedWordId] || '') + key);
    }
  };

  const handleCustomBackspace = () => {
    if (gameStyle === 'wordle') {
      handleWordleChange(wordleCurrentGuess.slice(0, -1));
    } else if (gameState.words.length === 1) {
      handleSingleWordChange(currentAnswer.slice(0, -1));
    } else {
      if (!focusedWordId) return;
      const word = gameState.words.find(w => w.id === focusedWordId);
      if (!word) return;
      handleMultiWordChange(word, (gameState.answers[focusedWordId] || '').slice(0, -1));
    }
  };

  // Render letter cards for jumbled word — sizes computed from screen width
  const renderJumbledWord = (word: string) => (
    <View style={[styles.letterContainer, { gap: letterGap }]}>
      {word.split('').map((letter, index) => (
        <View
          key={index}
          style={[styles.letterCard, { width: letterCardSize, height: letterCardHeight }]}
        >
          <Text style={[styles.letterText, { fontSize: letterFontSize }]}>
            {letter.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );

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
            <Text style={styles.title}>Word Find</Text>
            <Text style={styles.subtitle}>
              {wordLength} letters • {wordCount} word{wordCount > 1 ? 's' : ''}
              {timeLimit !== null ? ` • ${timeLimit / 60}m limit` : ''}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {gameStarted && !loading && timeLimit !== null && (
              <View style={[
                styles.timerContainer,
                timeLimit !== null && (timeLimit - elapsedTime) <= 30 && styles.timerContainerWarning,
              ]}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={timeLimit !== null && (timeLimit - elapsedTime) <= 30 ? COLORS.errorDark : COLORS.primary}
                />
                <Text style={[
                  styles.timerText,
                  timeLimit !== null && (timeLimit - elapsedTime) <= 30 && styles.timerTextWarning,
                ]}>
                  {timeLimit !== null
                    ? formatTime(Math.max(0, timeLimit - elapsedTime))
                    : formatTime(elapsedTime)}
                </Text>
              </View>
            )}
            {gameStarted && !loading && (
              <TouchableOpacity style={styles.headerSummaryButton} onPress={() => setShowSummary(true)}>
                <Ionicons name="stats-chart-outline" size={15} color={COLORS.textLight} />
                <Text style={styles.headerSummaryButtonText}>Stats</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.newGameButton} onPress={openSettings}>
              <Ionicons name="add-outline" size={18} color={COLORS.card} />
              <Text style={styles.newGameButtonText}>New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading words...</Text>
          </View>
        ) : gameCompleted ? (
          <GameCompletedScreen />
        ) : gameState.words.length > 1 ? (
          /* Multi-word mode */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Header */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {gameState.words.length} Untangle the words
              </Text>
              <Text style={styles.scoreText}>
                Score: {Object.values(gameState.results).filter(r => r === true).length}
              </Text>
            </View>

            {/* All Words List */}
            {gameState.words.map((word, index) => {
              const wordResult = gameState.results[word.id];
              const isWordChecked = wordResult !== undefined;
              const isWordCorrect = wordResult === true;

              const isFocused = focusedWordId === word.id;

              return (
                <TouchableOpacity
                  key={word.id}
                  activeOpacity={useCustomKeyboard && !isWordCorrect && !timeLimitExpired ? 0.7 : 1}
                  onPress={() => {
                    if (useCustomKeyboard && !isWordCorrect && !timeLimitExpired) {
                      setFocusedWordId(word.id);
                    }
                  }}
                >
                <View style={[
                  styles.multiWordCard,
                  useCustomKeyboard && isFocused && !isWordCorrect && styles.multiWordCardFocused,
                ]}>
                  <View style={styles.multiWordHeader}>
                    <Text style={styles.multiWordNumber}>#{index + 1}</Text>
                    {isWordChecked && (
                      <Ionicons
                        name={isWordCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={isWordCorrect ? COLORS.successDark : COLORS.errorDark}
                      />
                    )}
                  </View>

                  {/* Jumbled Letters */}
                  <View style={[styles.multiWordLetters, { gap: smallGap }]}>
                    {word.jumbled.split('').map((letter, letterIndex) => (
                      <View
                        key={letterIndex}
                        style={[styles.smallLetterCard, { width: smallCardSize, height: smallCardHeight }]}
                      >
                        <Text style={[styles.smallLetterText, { fontSize: smallFontSize }]}>
                          {letter.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Hint Display and Button */}
                  {!isWordChecked && (
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
                          <Ionicons
                            name="bulb-outline"
                            size={16}
                            color={canGetHint(word.id, word.length) ? COLORS.hintDark : COLORS.textMuted}
                          />
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
                  <TextInput
                    style={[
                      styles.multiWordInput,
                      !isWordChecked && dictionaryErrors[word.id] && styles.inputInvalidWord,
                      isWordChecked && isWordCorrect && styles.inputCorrect,
                      isWordChecked && !isWordCorrect && styles.inputIncorrect,
                      useCustomKeyboard && isFocused && !isWordCorrect && styles.multiWordInputFocused,
                    ]}
                    value={gameState.answers[word.id] || ''}
                    onChangeText={(text) => handleMultiWordChange(word, text)}
                    placeholder={useCustomKeyboard ? (isFocused ? '' : 'Tap to select') : 'Type your answer...'}
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={word.length}
                    editable={!useCustomKeyboard && !isWordCorrect && !timeLimitExpired}
                    showSoftInputOnFocus={!useCustomKeyboard}
                  />

                  {/* Letter count */}
                  {(!isWordChecked || !isWordCorrect) && (
                    <Text style={styles.multiWordLetterCount}>
                      {(gameState.answers[word.id] || '').length} / {word.length} letters
                    </Text>
                  )}
                </View>
                </TouchableOpacity>
              );
            })}

            {/* One More Button */}
            {Object.keys(gameState.results).length === gameState.words.length &&
              Object.values(gameState.results).some(r => r === true) && (
              <TouchableOpacity style={styles.oneMoreButton} onPress={fetchOneMoreWord}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.card} />
                <Text style={styles.oneMoreButtonText}>One More</Text>
              </TouchableOpacity>
            )}

          </ScrollView>
        ) : currentWord && gameStyle === 'wordle' ? (
          /* Wordle mode */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hidden input — captures keyboard without showing a box */}
            {!wordleGameOver && (
              <TextInput
                ref={wordleInputRef}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                value={wordleCurrentGuess}
                onChangeText={handleWordleChange}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                maxLength={currentWord.length}
                editable={!timeLimitExpired}
              />
            )}

            {/* (wordLength + 1)-row Wordle grid — tap to focus keyboard */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => wordleInputRef.current?.focus()}
              disabled={wordleGameOver}
            >
              <View style={[styles.wordleGrid, { gap: tileGap }]}>
                {Array.from({ length: wordLength + 1 }).map((_, rowIndex) => {
                  const submittedGuess = wordleGuesses[rowIndex];
                  const isCurrentRow = rowIndex === wordleGuesses.length && !wordleGameOver;
                  const tileStates = submittedGuess
                    ? getTileStates(submittedGuess, currentWord.original)
                    : null;

                  return (
                    <View key={rowIndex} style={[styles.wordleRow, { gap: tileGap }]}>
                      {Array.from({ length: currentWord.length }).map((_, colIndex) => {
                        let letter = '';
                        let tileStyle = styles.workleTileEmpty;
                        let letterStyle = styles.workleTileLetter;
                        // Show a cursor bar in the next empty cell of the active row
                        const isCursorCell =
                          isCurrentRow &&
                          !wordleCurrentRowInvalid &&
                          colIndex === wordleCurrentGuess.length;

                        if (submittedGuess) {
                          letter = submittedGuess[colIndex] || '';
                          const state = tileStates![colIndex];
                          tileStyle =
                            state === 'correct'
                              ? styles.workleTileCorrect
                              : state === 'present'
                              ? styles.workleTilePresent
                              : styles.workleTileAbsent;
                          letterStyle = styles.workleTileLetterLight;
                        } else if (isCurrentRow) {
                          letter = wordleCurrentGuess[colIndex] || '';
                          if (wordleCurrentRowInvalid) {
                            tileStyle = styles.workleTileInvalid;
                            letterStyle = styles.workleTileLetterLight;
                          } else {
                            tileStyle = letter ? styles.workleTileFilled : styles.workleTileEmpty;
                          }
                        }

                        return (
                          <View
                            key={colIndex}
                            style={[styles.workleTile, tileStyle, { width: tileSize, height: tileSize }]}
                          >
                            <Text style={[letterStyle, { fontSize: Math.floor(tileSize * 0.42) }]}>
                              {isCursorCell && !letter ? '|' : letter.toUpperCase()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>

            {/* Win / Lose banner */}
            {wordleGameOver && (
              <View style={wordleWon ? styles.wordleWinBanner : styles.wordleLoseBanner}>
                <Text style={styles.wordleOutcomeTitle}>
                  {wordleWon ? 'Brilliant!' : 'Better luck next time!'}
                </Text>
                {!wordleWon && (
                  <Text style={styles.wordleCorrectAnswer}>
                    The word was{' '}
                    <Text style={styles.wordleCorrectWord}>
                      {currentWord.original.toUpperCase()}
                    </Text>
                  </Text>
                )}
                <TouchableOpacity style={styles.wordlePlayAgainButton} onPress={fetchWords}>
                  <Ionicons name="refresh" size={18} color={COLORS.card} />
                  <Text style={styles.wordlePlayAgainText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        ) : currentWord ? (
          /* Single word mode */
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

              {/* Hint Section */}
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
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  !showResult && currentWord && dictionaryErrors[currentWord.id] && styles.inputInvalidWord,
                  showResult && isCorrect && styles.inputCorrect,
                  showResult && !isCorrect && styles.inputIncorrect,
                ]}
                value={currentAnswer}
                onChangeText={handleSingleWordChange}
                placeholder={useCustomKeyboard ? '' : 'Type your answer...'}
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={currentWord.length}
                editable={!useCustomKeyboard && (!isCorrect || !showResult) && !timeLimitExpired}
                showSoftInputOnFocus={!useCustomKeyboard}
              />

              {/* Letter count indicator */}
              {!showResult && (
                <Text style={styles.letterCountIndicator}>
                  {currentAnswer.length} / {currentWord.length} letters
                </Text>
              )}

              {/* Button row */}
              {showResult && isCorrect && (
                <TouchableOpacity
                  style={styles.oneMoreButton}
                  onPress={fetchOneMoreWord}
                >
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.card} />
                  <Text style={styles.oneMoreButtonText}>One More</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        ) : null}
        </View>

        {/* Custom Keyboard */}
        {useCustomKeyboard && gameStarted && !loading && !gameCompleted && !wordleGameOver && !timeLimitExpired && (
          <CustomKeyboard
            onKey={handleCustomKey}
            onBackspace={handleCustomBackspace}
            letterStates={wordleLetterStates}
            disabled={timeLimitExpired}
          />
        )}

        {/* Summary Modal */}
        <Modal
          visible={showSummary}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSummary(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.summaryModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Game Summary</Text>
                <TouchableOpacity onPress={() => setShowSummary(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {timeLimitExpired && (
                <View style={styles.timesUpBanner}>
                  <Ionicons name="alarm-outline" size={20} color={COLORS.errorDark} />
                  <Text style={styles.timesUpText}>Time's Up!</Text>
                </View>
              )}
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatNumber}>{Object.keys(gameState.results).length}</Text>
                  <Text style={styles.summaryStatLabel}>Played</Text>
                </View>
                <View style={[styles.summaryStatItem, styles.summaryStatCorrect]}>
                  <Text style={[styles.summaryStatNumber, { color: COLORS.successDark }]}>
                    {Object.values(gameState.results).filter(r => r === true).length}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Correct</Text>
                </View>
                <View style={[styles.summaryStatItem, styles.summaryStatIncorrect]}>
                  <Text style={[styles.summaryStatNumber, { color: COLORS.errorDark }]}>
                    {Object.values(gameState.results).filter(r => r === false).length}
                  </Text>
                  <Text style={styles.summaryStatLabel}>Incorrect</Text>
                </View>
              </View>
              <View style={styles.summaryTimeContainer}>
                <Ionicons name="time-outline" size={20} color={COLORS.textLight} />
                <Text style={styles.summaryTime}>Time: {formatTime(elapsedTime)}</Text>
              </View>
              <View style={styles.summaryActions}>
                {!gameCompleted && !wordleGameOver && !timeLimitExpired && (
                  <TouchableOpacity
                    style={styles.summaryCloseButton}
                    onPress={() => setShowSummary(false)}
                  >
                    <Text style={styles.summaryCloseButtonText}>Continue Playing</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.summaryRestartButton}
                  onPress={() => { setShowSummary(false); fetchWords(); }}
                >
                  <Ionicons name="refresh" size={18} color={COLORS.card} />
                  <Text style={styles.summaryRestartButtonText}>Start Over</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

              {/* Game Style Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Game Style</Text>
                <View style={styles.optionRow}>
                  {(['classic', 'wordle'] as const).map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.optionButton,
                        tempGameStyle === style && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempGameStyle(style)}
                    >
                      <Text style={[
                        styles.optionText,
                        tempGameStyle === style && styles.optionTextActive,
                      ]}>
                        {style === 'classic' ? 'Classic' : 'Wordle'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                      <Text style={[
                        styles.optionText,
                        tempWordLength === length && styles.optionTextActive,
                      ]}>
                        {length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Word Count Selection */}
              <View style={[
                styles.settingSection,
                tempGameStyle === 'wordle' && styles.settingSectionDisabled,
              ]}>
                <Text style={styles.settingLabel}>
                  {tempGameStyle === 'wordle' ? 'Number of Words (1 in Wordle mode)' : 'Number of Words'}
                </Text>
                <View style={styles.optionRow} pointerEvents={tempGameStyle === 'wordle' ? 'none' : 'auto'}>
                  {[1, 3, 5, 10].map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.optionButton,
                        tempWordCount === count && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempWordCount(count)}
                    >
                      <Text style={[
                        styles.optionText,
                        tempWordCount === count && styles.optionTextActive,
                      ]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Limit Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Time Limit (Optional)</Text>
                <View style={styles.optionRow}>
                  {([null, 60, 120, 180, 300] as (number | null)[]).map((limit) => (
                    <TouchableOpacity
                      key={limit === null ? 'none' : limit}
                      style={[
                        styles.optionButton,
                        tempTimeLimit === limit && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempTimeLimit(limit)}
                    >
                      <Text style={[
                        styles.optionText,
                        tempTimeLimit === limit && styles.optionTextActive,
                      ]}>
                        {limit === null ? 'None' : `${limit / 60}m`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Keyboard Selection */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Keyboard</Text>
                <View style={styles.optionRow}>
                  {(['system', 'custom'] as const).map((kb) => (
                    <TouchableOpacity
                      key={kb}
                      style={[
                        styles.optionButton,
                        tempKeyboardStyle === kb && styles.optionButtonActive,
                      ]}
                      onPress={() => setTempKeyboardStyle(kb)}
                    >
                      <Text style={[
                        styles.optionText,
                        tempKeyboardStyle === kb && styles.optionTextActive,
                      ]}>
                        {kb === 'system' ? 'System' : 'Custom'}
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
