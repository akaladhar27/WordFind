import { StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from './types';

/**
 * All layout values scale relative to a 375 × 812 baseline (iPhone X / SE2).
 * Width drives most sizing; height drives vertical spacing.
 * Values are clamped so the UI remains usable on tiny and tablet-sized screens.
 */
export function createStyles(width: number, height: number) {
  // Clamped scale factors
  const ws = Math.min(1.35, Math.max(0.82, width / 375));
  const hs = Math.min(1.3,  Math.max(0.82, height / 812));

  // Helpers
  const w  = (n: number) => Math.round(n * ws);          // width-driven spacing
  const hv = (n: number) => Math.round(n * hs);          // height-driven spacing
  const f  = (n: number) => Math.round(n * Math.min(1.2, Math.max(0.88, ws))); // font

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: w(20),
      paddingVertical: hv(13),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.card,
    },
    title: {
      fontSize: f(22),
      fontWeight: '700',
      color: COLORS.text,
    },
    subtitle: {
      fontSize: f(13),
      color: COLORS.textLight,
      marginTop: hv(2),
    },
    settingsIcon: {
      width: w(44),
      height: w(44),
      borderRadius: w(22),
      backgroundColor: COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: w(8),
    },
    newGameButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingHorizontal: w(12),
      paddingVertical: hv(7),
      borderRadius: w(20),
      gap: w(4),
    },
    newGameButtonText: {
      fontSize: f(13),
      fontWeight: '600',
      color: COLORS.card,
    },
    headerSummaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: w(10),
      paddingVertical: hv(6),
      borderRadius: w(20),
      gap: w(4),
    },
    headerSummaryButtonText: {
      fontSize: f(12),
      fontWeight: '500',
      color: COLORS.textLight,
    },

    // ── Loading ──────────────────────────────────────────────────────────────
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: hv(12),
      fontSize: f(15),
      color: COLORS.textLight,
    },

    // ── Game content wrapper ─────────────────────────────────────────────────
    gameContent: {
      flexGrow: 1,
      padding: w(16),
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hv(18),
    },
    progressText: {
      fontSize: f(14),
      color: COLORS.textLight,
    },
    scoreText: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.primary,
    },

    // ── Single-word card ─────────────────────────────────────────────────────
    wordCard: {
      backgroundColor: COLORS.card,
      borderRadius: w(14),
      padding: w(20),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: hv(18),
    },
    wordCardLabel: {
      fontSize: f(14),
      color: COLORS.textLight,
      marginBottom: hv(14),
    },
    letterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: w(7),
    },
    // Base style only — width/height/fontSize applied inline per word length
    letterCard: {
      backgroundColor: COLORS.primary,
      borderRadius: w(8),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    letterText: {
      fontWeight: '700',
      color: COLORS.card,
    },

    // ── Answer input ─────────────────────────────────────────────────────────
    inputContainer: {
      gap: hv(12),
    },
    input: {
      backgroundColor: COLORS.card,
      borderRadius: w(12),
      paddingHorizontal: w(16),
      paddingVertical: hv(13),
      fontSize: f(17),
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.border,
      textAlign: 'center',
    },
    letterCountIndicator: {
      fontSize: f(13),
      color: COLORS.textMuted,
      textAlign: 'center',
      marginTop: hv(4),
    },

    // ── Buttons ──────────────────────────────────────────────────────────────
    checkButton: {
      backgroundColor: COLORS.primary,
      borderRadius: w(12),
      paddingVertical: hv(14),
      alignItems: 'center',
    },
    checkButtonDisabled: {
      backgroundColor: COLORS.textMuted,
    },
    checkButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },
    oneMoreButton: {
      backgroundColor: COLORS.successDark,
      borderRadius: w(12),
      paddingVertical: hv(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: w(8),
    },
    oneMoreButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },
    oneMoreButtonFlex: {
      flex: 1,
    },
    singleWordButtonRow: {
      flexDirection: 'row',
      gap: w(10),
      marginTop: hv(12),
    },
    checkButtonFlex: {
      flex: 1,
    },

    // ── Result boxes ─────────────────────────────────────────────────────────
    resultContainer: {
      gap: hv(14),
    },
    resultBox: {
      borderRadius: w(14),
      padding: w(20),
      alignItems: 'center',
    },
    resultCorrect: {
      backgroundColor: '#E6FFED',
    },
    resultIncorrect: {
      backgroundColor: '#FFF5F5',
    },
    resultText: {
      fontSize: f(22),
      fontWeight: '700',
      marginTop: hv(6),
    },
    resultTextCorrect: {
      color: COLORS.successDark,
    },
    resultTextIncorrect: {
      color: COLORS.errorDark,
    },
    correctAnswerText: {
      fontSize: f(14),
      color: COLORS.textLight,
      marginTop: hv(6),
    },
    correctWord: {
      fontWeight: '700',
      color: COLORS.text,
    },
    correctAnswerInline: {
      fontSize: f(13),
      color: COLORS.textLight,
      textAlign: 'center',
      marginTop: hv(6),
    },
    nextButton: {
      backgroundColor: COLORS.primary,
      borderRadius: w(12),
      paddingVertical: hv(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: w(8),
    },
    nextButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },

    // ── Completed screen ─────────────────────────────────────────────────────
    completedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: w(20),
    },
    completedTitle: {
      fontSize: f(26),
      fontWeight: '700',
      color: COLORS.text,
      marginTop: hv(14),
    },
    completedScore: {
      fontSize: f(22),
      fontWeight: '600',
      color: COLORS.primary,
      marginTop: hv(6),
    },
    completedPercentage: {
      fontSize: f(16),
      color: COLORS.textLight,
      marginTop: hv(4),
    },
    completedButtons: {
      marginTop: hv(28),
      gap: hv(12),
      width: '100%',
    },
    completedButton: {
      borderRadius: w(12),
      paddingVertical: hv(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: w(8),
    },
    playAgainButton: {
      backgroundColor: COLORS.primary,
    },
    playAgainText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },
    settingsButton: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    settingsButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.primary,
    },
    completedTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hv(8),
      gap: w(6),
    },
    completedTime: {
      fontSize: f(14),
      color: COLORS.textLight,
    },

    // ── Modal ────────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: w(24),
      borderTopRightRadius: w(24),
      padding: w(22),
      paddingBottom: hv(36),
    },
    summaryModalContent: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: w(24),
      borderTopRightRadius: w(24),
      padding: w(22),
      paddingBottom: hv(36),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hv(20),
    },
    modalTitle: {
      fontSize: f(20),
      fontWeight: '700',
      color: COLORS.text,
    },
    settingSection: {
      marginBottom: hv(20),
    },
    settingSectionDisabled: {
      opacity: 0.4,
    },
    settingLabel: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: hv(10),
    },
    optionRow: {
      flexDirection: 'row',
      gap: w(8),
    },
    optionButton: {
      flex: 1,
      paddingVertical: hv(12),
      borderRadius: w(10),
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
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.textLight,
    },
    optionTextActive: {
      color: COLORS.card,
    },
    applyButton: {
      backgroundColor: COLORS.primary,
      borderRadius: w(12),
      paddingVertical: hv(14),
      alignItems: 'center',
      marginTop: hv(6),
    },
    applyButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },

    // ── Summary modal ────────────────────────────────────────────────────────
    summaryStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: hv(20),
    },
    summaryStatItem: {
      alignItems: 'center',
      padding: w(14),
      borderRadius: w(12),
      minWidth: w(72),
    },
    summaryStatCorrect: {
      backgroundColor: '#E6FFED',
    },
    summaryStatIncorrect: {
      backgroundColor: '#FEF3E7',
    },
    summaryStatNumber: {
      fontSize: f(28),
      fontWeight: '700',
      color: COLORS.text,
    },
    summaryStatLabel: {
      fontSize: f(12),
      color: COLORS.textLight,
      marginTop: hv(4),
    },
    summaryTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: w(8),
      marginBottom: hv(20),
    },
    summaryTime: {
      fontSize: f(14),
      color: COLORS.textLight,
    },
    summaryActions: {
      gap: hv(10),
    },
    summaryCloseButton: {
      backgroundColor: COLORS.background,
      borderRadius: w(12),
      paddingVertical: hv(14),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    summaryCloseButtonText: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.primary,
    },
    summaryRestartButton: {
      backgroundColor: COLORS.primary,
      borderRadius: w(12),
      paddingVertical: hv(14),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: w(8),
    },
    summaryRestartButtonText: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.card,
    },
    summaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.background,
      paddingHorizontal: w(14),
      paddingVertical: hv(14),
      borderRadius: w(12),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: w(6),
    },
    summaryButtonText: {
      fontSize: f(13),
      fontWeight: '500',
      color: COLORS.primary,
    },
    summaryButtonFull: {
      flex: 1,
    },
    timesUpBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF5F5',
      borderRadius: w(8),
      paddingVertical: hv(8),
      paddingHorizontal: w(14),
      marginBottom: hv(10),
      gap: w(6),
    },
    timesUpText: {
      fontSize: f(14),
      fontWeight: '700',
      color: COLORS.errorDark,
    },

    // ── Timer ────────────────────────────────────────────────────────────────
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      paddingHorizontal: w(10),
      paddingVertical: hv(5),
      borderRadius: w(14),
      gap: w(4),
    },
    timerText: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.primary,
    },
    timerContainerWarning: {
      backgroundColor: '#FFF5F5',
    },
    timerTextWarning: {
      color: COLORS.errorDark,
    },

    // ── Hints ────────────────────────────────────────────────────────────────
    hintSection: {
      alignItems: 'center',
      marginBottom: hv(10),
      gap: hv(6),
    },
    hintDisplay: {
      fontSize: f(15),
      fontWeight: '600',
      color: COLORS.hintDark,
      letterSpacing: 2,
    },
    hintButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBEB',
      paddingHorizontal: w(10),
      paddingVertical: hv(5),
      borderRadius: w(14),
      borderWidth: 1,
      borderColor: COLORS.hint,
      gap: w(4),
    },
    hintButtonDisabled: {
      backgroundColor: COLORS.background,
      borderColor: COLORS.border,
    },
    hintButtonText: {
      fontSize: f(11),
      fontWeight: '500',
      color: COLORS.hintDark,
    },
    hintButtonTextDisabled: {
      color: COLORS.textMuted,
    },
    singleWordHintSection: {
      marginTop: hv(16),
      alignItems: 'center',
      gap: hv(8),
    },
    singleWordHintDisplay: {
      fontSize: f(18),
      fontWeight: '600',
      color: COLORS.hintDark,
      letterSpacing: 3,
    },
    singleWordHintButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBEB',
      paddingHorizontal: w(14),
      paddingVertical: hv(8),
      borderRadius: w(18),
      borderWidth: 1,
      borderColor: COLORS.hint,
      gap: w(5),
    },
    singleWordHintButtonText: {
      fontSize: f(13),
      fontWeight: '500',
      color: COLORS.hintDark,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: w(8),
    },
    reshuffleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      paddingHorizontal: w(10),
      paddingVertical: hv(5),
      borderRadius: w(14),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: w(4),
    },
    reshuffleButtonText: {
      fontSize: f(11),
      fontWeight: '500',
      color: COLORS.primary,
    },
    singleWordActionButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: w(10),
    },
    singleWordReshuffleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.background,
      paddingHorizontal: w(14),
      paddingVertical: hv(8),
      borderRadius: w(18),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: w(5),
    },
    singleWordReshuffleButtonText: {
      fontSize: f(13),
      fontWeight: '500',
      color: COLORS.primary,
    },

    // ── Multi-word mode ──────────────────────────────────────────────────────
    multiWordCard: {
      backgroundColor: COLORS.card,
      borderRadius: w(12),
      padding: w(14),
      marginBottom: hv(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    multiWordCardFocused: {
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    multiWordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hv(10),
    },
    multiWordNumber: {
      fontSize: f(13),
      fontWeight: '600',
      color: COLORS.textMuted,
    },
    multiWordLetters: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: w(5),
      marginBottom: hv(10),
    },
    // Base only — width/height/fontSize set inline per word length
    smallLetterCard: {
      backgroundColor: COLORS.primary,
      borderRadius: w(6),
      justifyContent: 'center',
      alignItems: 'center',
    },
    smallLetterText: {
      fontWeight: '700',
      color: COLORS.card,
    },
    multiWordInput: {
      backgroundColor: COLORS.background,
      borderRadius: w(8),
      paddingHorizontal: w(14),
      paddingVertical: hv(10),
      fontSize: f(15),
      color: COLORS.text,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    multiWordInputFocused: {
      borderColor: COLORS.primary,
      borderWidth: 2,
    },
    multiWordResult: {
      alignItems: 'center',
      gap: hv(4),
    },
    multiWordAnswer: {
      fontSize: f(13),
      fontWeight: '500',
    },
    answerCorrect: {
      color: COLORS.successDark,
    },
    answerIncorrect: {
      color: COLORS.errorDark,
    },
    multiWordCorrect: {
      fontSize: f(13),
      fontWeight: '600',
      color: COLORS.text,
    },
    multiWordLetterCount: {
      fontSize: f(11),
      color: COLORS.textMuted,
      textAlign: 'center',
      marginTop: hv(4),
    },
    multiWordCorrectAnswer: {
      fontSize: f(11),
      color: COLORS.textLight,
      textAlign: 'center',
      marginTop: hv(4),
    },
    multiWordSummaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.background,
      paddingHorizontal: w(14),
      paddingVertical: hv(14),
      borderRadius: w(12),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: w(6),
      marginTop: hv(10),
      marginBottom: hv(16),
    },
    checkAllButton: {
      backgroundColor: COLORS.primary,
      borderRadius: w(12),
      paddingVertical: hv(14),
      alignItems: 'center',
      marginTop: hv(6),
      marginBottom: hv(16),
    },
    checkAllButtonText: {
      fontSize: f(16),
      fontWeight: '600',
      color: COLORS.card,
    },

    // ── Input state colours ──────────────────────────────────────────────────
    inputCorrect: {
      backgroundColor: '#E6FFED',
      borderColor: COLORS.successDark,
    },
    inputIncorrect: {
      backgroundColor: '#FFF5F5',
      borderColor: COLORS.errorDark,
    },
    inputInvalidWord: {
      backgroundColor: '#FED7D7',
      borderColor: '#C53030',
    },

    // ── Wordle grid ──────────────────────────────────────────────────────────
    wordleGrid: {
      alignItems: 'center',
      gap: w(6),
      marginBottom: hv(16),
    },
    wordleRow: {
      flexDirection: 'row',
      gap: w(6),
    },
    workleTile: {
      borderRadius: w(4),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    workleTileEmpty: {
      borderColor: COLORS.border,
      backgroundColor: COLORS.card,
    },
    workleTileFilled: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.card,
    },
    workleTileCorrect: {
      borderColor: '#48BB78',
      backgroundColor: '#48BB78',
    },
    workleTilePresent: {
      borderColor: '#D69E2E',
      backgroundColor: '#ECC94B',
    },
    workleTileAbsent: {
      borderColor: '#718096',
      backgroundColor: '#718096',
    },
    workleTileInvalid: {
      borderColor: '#C53030',
      backgroundColor: '#C53030',
    },
    workleTileLetter: {
      fontWeight: '700',
      color: COLORS.text,
    },
    workleTileLetterLight: {
      fontWeight: '700',
      color: COLORS.card,
    },

    // ── Wordle outcome banners ───────────────────────────────────────────────
    wordleWinBanner: {
      backgroundColor: '#E6FFED',
      borderRadius: w(12),
      padding: w(18),
      alignItems: 'center',
      gap: hv(8),
      marginBottom: hv(14),
    },
    wordleLoseBanner: {
      backgroundColor: '#FFF5F5',
      borderRadius: w(12),
      padding: w(18),
      alignItems: 'center',
      gap: hv(8),
      marginBottom: hv(14),
    },
    wordleOutcomeTitle: {
      fontSize: f(18),
      fontWeight: '700',
      color: COLORS.text,
    },
    wordleCorrectAnswer: {
      fontSize: f(14),
      color: COLORS.textLight,
    },
    wordleCorrectWord: {
      fontWeight: '700',
      color: COLORS.text,
    },
    wordlePlayAgainButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary,
      paddingHorizontal: w(18),
      paddingVertical: hv(9),
      borderRadius: w(18),
      gap: w(5),
      marginTop: hv(4),
    },
    wordlePlayAgainText: {
      fontSize: f(14),
      fontWeight: '600',
      color: COLORS.card,
    },
  });
}
