import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/types';
import { createStyles } from '@/lib/styles';
import { useGameLogic } from '@/lib/useGameLogic';
import { CustomKeyboard } from '@/lib/CustomKeyboard';

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
    handleSingleWordEnter,
    handleMultiWordEnter,
    handleWordleEnter,
    gameStyle,
    tempGameStyle,
    setTempGameStyle,
    wordleGuesses,
    wordleCurrentGuess,
    wordleAttempt,
    wordleGameOver,
    wordleWon,
    dictionaryErrors,
    wordleCurrentRowInvalid,
    foundWords,
    invalidWordError,
    duplicateWordError,
    wordSolved,
    solvedHintIndices,
    history,
    clearHistory,
  } = useGameLogic();

  const [showHistory, setShowHistory] = useState(false);

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

  const formatHistoryDate = (ts: number): string => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentWord = gameState.words[gameState.currentIndex];

  const getTileStates = (guess: string, answer: string): ('correct' | 'present' | 'absent')[] => {
    const result: ('correct' | 'present' | 'absent')[] = Array(guess.length).fill('absent');
    const answerArr = answer.toLowerCase().split('');
    const guessArr = guess.toLowerCase().split('');
    guessArr.forEach((letter, i) => {
      if (letter === answerArr[i]) {
        result[i] = 'correct';
        answerArr[i] = '#';
        guessArr[i] = '*';
      }
    });
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

  // Focused word for multi-word mode
  const [focusedWordId, setFocusedWordId] = useState<string | null>(null);

  // Custom keyboard handlers — need local state (focusedWordId) so defined here
  const handleCustomKey = (key: string) => {
    if (!currentWord || timeLimitExpired) return;
    if (gameStyle === 'wordle') {
      if (wordleGameOver) return;
      if (wordleCurrentGuess.length < currentWord.length) handleWordleChange(wordleCurrentGuess + key);
    } else if (wordCount === 1) {
      if (wordSolved) return;
      if (currentAnswer.length < currentWord.length) handleSingleWordChange(currentAnswer + key);
    } else {
      if (!focusedWordId) return;
      const word = gameState.words.find(w => w.id === focusedWordId);
      if (!word || gameState.results[word.id] === true) return;
      const val = gameState.answers[word.id] || '';
      if (val.length < word.length) handleMultiWordChange(word, val + key);
    }
  };

  const handleCustomEnter = () => {
    if (!currentWord || timeLimitExpired) return;
    if (gameStyle === 'wordle') {
      handleWordleEnter();
    } else if (wordCount === 1) {
      handleSingleWordEnter();
    } else {
      if (!focusedWordId) return;
      handleMultiWordEnter(focusedWordId);
    }
  };

  const handleCustomBackspace = () => {
    if (!currentWord || timeLimitExpired) return;
    if (gameStyle === 'wordle') {
      if (wordleGameOver) return;
      handleWordleChange(wordleCurrentGuess.slice(0, -1));
    } else if (wordCount === 1) {
      if (wordSolved) return;
      handleSingleWordChange(currentAnswer.slice(0, -1));
    } else {
      if (!focusedWordId) return;
      const word = gameState.words.find(w => w.id === focusedWordId);
      if (!word || gameState.results[word.id] === true) return;
      const val = gameState.answers[word.id] || '';
      handleMultiWordChange(word, val.slice(0, -1));
    }
  };

  // Wordle letter states for keyboard colouring
  const wordleLetterStates = useMemo(() => {
    const states: Record<string, 'correct' | 'present' | 'absent'> = {};
    if (gameStyle !== 'wordle' || !currentWord) return states;
    wordleGuesses.forEach(guess => {
      const tileStates = getTileStates(guess, currentWord.original);
      guess.toLowerCase().split('').forEach((letter, i) => {
        const state = tileStates[i];
        const cur = states[letter];
        if (!cur || state === 'correct' || (state === 'present' && cur === 'absent')) {
          states[letter] = state;
        }
      });
    });
    return states;
  }, [wordleGuesses, currentWord, gameStyle]);


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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{gameStyle === 'wordle' ? 'Wordle' : 'Word Find'}</Text>
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
<TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
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
        ) : wordCount > 1 ? (
          /* Multi-word mode */
          <ScrollView
            contentContainerStyle={styles.gameContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Header */}

            {/* All Words List */}
            {gameState.words.map((word, index) => {
              const wordResult = gameState.results[word.id];
              const isWordChecked = wordResult !== undefined;
              const isWordCorrect = wordResult === true;

              const isFocused = focusedWordId === word.id;

              return (
                <TouchableOpacity
                  key={word.id}
                  activeOpacity={!isWordCorrect && !timeLimitExpired ? 0.7 : 1}
                  onPress={() => {
                    if (!isWordCorrect && !timeLimitExpired) {
                      setFocusedWordId(word.id);
                    }
                  }}
                >
                <View style={[
                  styles.multiWordCard,
                  isFocused && !isWordCorrect && styles.multiWordCardFocused,
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

                  {/* Hint Button */}
                  {!isWordChecked && (
                    <View style={styles.hintSection}>
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


                  {/* Answer blocks */}
                  <View style={[styles.answerBlocksRow, { gap: smallGap }]}>
                    {Array.from({ length: word.length }).map((_, i) => {
                      const wordAnswer = gameState.answers[word.id] || '';
                      const typedChar = wordAnswer[i];
                      const hintIndices = hints[word.id] || [];
                      const isHintPos = hintIndices.includes(i);
                      const hintChar = isHintPos ? word.original[i] : null;
                      const displayChar = typedChar || hintChar;
                      const isActive = i === wordAnswer.length && isFocused && !isWordChecked && !timeLimitExpired;

                      let tileStyle = styles.workleTileEmpty;
                      let textStyle = styles.workleTileLetter;

                      if (isWordCorrect && isHintPos) {
                        tileStyle = styles.answerHintTile;
                        textStyle = styles.workleTileLetter;
                      } else if (isWordCorrect) {
                        tileStyle = styles.workleTileCorrect;
                        textStyle = styles.workleTileLetterLight;
                      } else if (isWordChecked && !isWordCorrect && typedChar) {
                        tileStyle = styles.workleTileAbsent;
                        textStyle = styles.workleTileLetterLight;
                      } else if (isHintPos && !typedChar) {
                        tileStyle = styles.answerHintTile;
                      } else if (typedChar) {
                        tileStyle = styles.workleTileFilled;
                      }

                      return (
                        <View
                          key={i}
                          style={[styles.workleTile, tileStyle, { width: smallCardSize, height: smallCardSize }]}
                        >
                          <Text style={[textStyle, { fontSize: Math.floor(smallCardSize * 0.42) }]}>
                            {isActive && !displayChar ? '|' : (displayChar?.toUpperCase() || '')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                </TouchableOpacity>
              );
            })}

            {/* One More Button */}
            {Object.keys(gameState.results).length === gameState.words.length &&
              Object.values(gameState.results).every(r => r === true) && (
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

            {/* (wordLength + 1)-row Wordle grid — tap to focus keyboard */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
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

            {/* Answer reveal — shown when time runs out or all guesses used */}
            {(timeLimitExpired || (wordleGameOver && !wordleWon)) && (
              <Text style={styles.wordleAnswerReveal}>
                {currentWord.original.toUpperCase()}
              </Text>
            )}

            {/* Win / Lose banner */}
            {wordleGameOver && (
              <View style={wordleWon ? styles.wordleWinBanner : styles.wordleLoseBanner}>
                <Text style={styles.wordleOutcomeTitle}>
                  {wordleWon ? 'Brilliant!' : 'Better luck next time!'}
                </Text>
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

            {/* Jumbled Word Display */}
            <View style={styles.wordCard}>
              {renderJumbledWord(currentWord.jumbled)}

              {/* Hint Section */}
              {!wordSolved && (
                <View style={styles.singleWordHintSection}>
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

            {/* Solved word — shown below puzzle when word is solved */}
            {wordSolved && (
              <View style={[styles.solvedWordRow, { gap: tileGap }]}>
                {currentWord.original.split('').map((letter, i) => {
                  const wasHinted = solvedHintIndices.includes(i);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.workleTile,
                        wasHinted ? styles.answerHintTile : styles.workleTileCorrect,
                        { width: tileSize, height: tileSize },
                      ]}
                    >
                      <Text style={[
                        wasHinted ? styles.workleTileLetter : styles.workleTileLetterLight,
                        { fontSize: Math.floor(tileSize * 0.42) },
                      ]}>
                        {letter.toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Found words list */}
            {(foundWords[currentWord.id] || []).length > 0 && (
              <View style={styles.foundWordsList}>
                <View style={styles.foundWordsRow}>
                  {(foundWords[currentWord.id] || []).map((word, i) => (
                    <View
                      key={i}
                      style={[
                        styles.foundWordChip,
                        word === currentWord.original.toLowerCase() && styles.foundWordChipCorrect,
                      ]}
                    >
                      <Text style={[
                        styles.foundWordChipText,
                        word === currentWord.original.toLowerCase() && styles.foundWordChipTextCorrect,
                      ]}>
                        {word.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Answer blocks / One More button */}
            {!wordSolved ? (
              <View style={styles.inputContainer}>

                {/* Character blocks — tap to open keyboard */}
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {}}
                  disabled={timeLimitExpired}
                >
                  <View style={[styles.answerBlocksRow, { gap: tileGap }]}>
                    {Array.from({ length: currentWord.length }).map((_, i) => {
                      const typedChar = currentAnswer[i];
                      const hintIndices = hints[currentWord.id] || [];
                      const isHintPos = hintIndices.includes(i);
                      const hintChar = isHintPos ? currentWord.original[i] : null;
                      const displayChar = typedChar || hintChar;
                      const isActive = i === currentAnswer.length && !timeLimitExpired;

                      let tileStyle = styles.workleTileEmpty;
                      let textStyle = styles.workleTileLetter;

                      if (isHintPos && !typedChar) {
                        tileStyle = styles.answerHintTile;
                      } else if (typedChar) {
                        tileStyle = styles.workleTileFilled;
                      }

                      return (
                        <View
                          key={i}
                          style={[styles.workleTile, tileStyle, { width: tileSize, height: tileSize }]}
                        >
                          <Text style={[textStyle, { fontSize: Math.floor(tileSize * 0.42) }]}>
                            {isActive && !displayChar ? '|' : (displayChar?.toUpperCase() || '')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>

                {invalidWordError && (
                  <Text style={styles.invalidWordMessage}>Invalid word</Text>
                )}
                {duplicateWordError && (
                  <Text style={styles.duplicateWordMessage}>Already found!</Text>
                )}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.oneMoreButton} onPress={fetchOneMoreWord}>
                  <Ionicons name="add-circle-outline" size={20} color={COLORS.card} />
                  <Text style={styles.oneMoreButtonText}>One More</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : null}
        </View>

        {/* Custom Keyboard */}
        {!loading && !gameCompleted && (
          <CustomKeyboard
            onKey={handleCustomKey}
            onBackspace={handleCustomBackspace}
            onEnter={handleCustomEnter}
            letterStates={gameStyle === 'wordle' ? wordleLetterStates : {}}
            disabled={
              gameStyle === 'wordle'
                ? wordleGameOver || timeLimitExpired
                : wordCount === 1
                ? wordSolved || timeLimitExpired
                : timeLimitExpired
            }
          />
        )}

        {/* Ad banner placeholder */}
        <View style={styles.adBannerPlaceholder} />

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.historyModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>History</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {history.length > 0 && (
                    <TouchableOpacity onPress={clearHistory}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.errorDark }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setShowHistory(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {history.length === 0 ? (
                  <Text style={styles.historyEmpty}>No games played yet</Text>
                ) : (
                  history.map(entry => (
                    <View key={entry.id} style={styles.historyEntry}>
                      <View style={styles.historyEntryLeft}>
                        <Text style={styles.historyEntryWord}>{entry.word}</Text>
                        <Text style={styles.historyEntryDate}>{formatHistoryDate(entry.timestamp)}</Text>
                      </View>
                      <View style={styles.historyBadgeRow}>
                        {entry.gameStyle === 'wordle' && (
                          <View style={styles.historyBadgeWordle}>
                            <Text style={[styles.historyBadgeText, styles.historyBadgeTextWordle]}>Wordle</Text>
                          </View>
                        )}
                        {entry.usedHint && (
                          <View style={styles.historyBadgeHint}>
                            <Text style={[styles.historyBadgeText, styles.historyBadgeTextHint]}>Hint</Text>
                          </View>
                        )}
                        <View style={entry.solved ? styles.historyBadgeSolved : styles.historyBadgeMissed}>
                          <Text style={[
                            styles.historyBadgeText,
                            entry.solved ? styles.historyBadgeTextSolved : styles.historyBadgeTextMissed,
                          ]}>
                            {entry.solved ? 'Solved' : 'Missed'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
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
