import React from 'react';
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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './types';
import { styles } from './styles';
import { useGameLogic } from './useGameLogic';

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
    wordleGuesses,
    wordleCurrentGuess,
    wordleAttempt,
    wordleGameOver,
    wordleWon,
  } = useGameLogic();

  const screenWidth = Dimensions.get('window').width;
  const tileSize = Math.min(56, Math.floor((screenWidth - 40 - (wordLength - 1) * 6) / wordLength));

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

  // Render letter cards for jumbled word
  const renderJumbledWord = (word: string) => (
    <View style={styles.letterContainer}>
      {word.split('').map((letter, index) => (
        <View key={index} style={styles.letterCard}>
          <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
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
            <TouchableOpacity style={styles.newGameButton} onPress={openSettings}>
              <Ionicons name="add-outline" size={18} color={COLORS.card} />
              <Text style={styles.newGameButtonText}>New</Text>
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

              return (
                <View key={word.id} style={styles.multiWordCard}>
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
                  <View style={styles.multiWordLetters}>
                    {word.jumbled.split('').map((letter, letterIndex) => (
                      <View key={letterIndex} style={styles.smallLetterCard}>
                        <Text style={styles.smallLetterText}>{letter.toUpperCase()}</Text>
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
                      isWordChecked && isWordCorrect && styles.inputCorrect,
                      isWordChecked && !isWordCorrect && styles.inputIncorrect,
                    ]}
                    value={gameState.answers[word.id] || ''}
                    onChangeText={(text) => handleMultiWordChange(word, text)}
                    placeholder="Type your answer..."
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={word.length}
                    editable={!isWordCorrect && !timeLimitExpired}
                  />

                  {/* Letter count */}
                  {(!isWordChecked || !isWordCorrect) && (
                    <Text style={styles.multiWordLetterCount}>
                      {(gameState.answers[word.id] || '').length} / {word.length} letters
                    </Text>
                  )}
                </View>
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

            {/* Summary Button */}
            <TouchableOpacity
              style={styles.multiWordSummaryButton}
              onPress={() => setShowSummary(true)}
            >
              <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
              <Text style={styles.summaryButtonText}>Summary</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : currentWord && gameStyle === 'wordle' ? (
          /* Wordle mode */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* (wordLength + 1)-row Wordle grid */}
            <View style={styles.wordleGrid}>
              {Array.from({ length: wordLength + 1 }).map((_, rowIndex) => {
                const submittedGuess = wordleGuesses[rowIndex];
                const isCurrentRow = rowIndex === wordleGuesses.length && !wordleGameOver;
                const tileStates = submittedGuess
                  ? getTileStates(submittedGuess, currentWord.original)
                  : null;

                return (
                  <View key={rowIndex} style={styles.wordleRow}>
                    {Array.from({ length: currentWord.length }).map((_, colIndex) => {
                      let letter = '';
                      let tileStyle = styles.workleTileEmpty;
                      let letterStyle = styles.workleTileLetter;

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
                        tileStyle = letter ? styles.workleTileFilled : styles.workleTileEmpty;
                      }

                      return (
                        <View
                          key={colIndex}
                          style={[styles.workleTile, tileStyle, { width: tileSize, height: tileSize }]}
                        >
                          <Text style={[letterStyle, { fontSize: Math.floor(tileSize * 0.42) }]}>
                            {letter.toUpperCase()}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>

            {/* Current guess input */}
            {!wordleGameOver && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={wordleCurrentGuess}
                  onChangeText={handleWordleChange}
                  placeholder={`Type a ${currentWord.length}-letter word...`}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={currentWord.length}
                  editable={!timeLimitExpired}
                />
                <Text style={styles.letterCountIndicator}>
                  {wordleCurrentGuess.length} / {currentWord.length} letters
                  {' '}• Attempt {wordleGuesses.length + 1} of {wordLength + 1}
                </Text>
              </View>
            )}

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

            {/* Summary button */}
            <TouchableOpacity
              style={[styles.summaryButton, styles.summaryButtonFull, { marginTop: 8 }]}
              onPress={() => setShowSummary(true)}
            >
              <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
              <Text style={styles.summaryButtonText}>Summary</Text>
            </TouchableOpacity>
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
                  showResult && isCorrect && styles.inputCorrect,
                  showResult && !isCorrect && styles.inputIncorrect,
                ]}
                value={currentAnswer}
                onChangeText={handleSingleWordChange}
                placeholder="Type your answer..."
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={currentWord.length}
                editable={(!isCorrect || !showResult) && !timeLimitExpired}
              />

              {/* Letter count indicator */}
              {!showResult && (
                <Text style={styles.letterCountIndicator}>
                  {currentAnswer.length} / {currentWord.length} letters
                </Text>
              )}

              {/* Button row */}
              <View style={styles.singleWordButtonRow}>
                {showResult && isCorrect && (
                  <TouchableOpacity
                    style={[styles.oneMoreButton, styles.oneMoreButtonFlex]}
                    onPress={fetchOneMoreWord}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.card} />
                    <Text style={styles.oneMoreButtonText}>One More</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.summaryButton, (!showResult || !isCorrect) && styles.summaryButtonFull]}
                  onPress={() => setShowSummary(true)}
                >
                  <Ionicons name="stats-chart-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.summaryButtonText}>Summary</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : null}

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
