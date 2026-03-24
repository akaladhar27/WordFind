import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './types';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export interface CustomKeyboardProps {
  onKey: (key: string) => void;
  onBackspace: () => void;
  // Wordle letter state colouring — omit for classic mode
  letterStates?: Record<string, 'correct' | 'present' | 'absent'>;
  disabled?: boolean;
}

export function CustomKeyboard({ onKey, onBackspace, letterStates = {}, disabled = false }: CustomKeyboardProps) {
  const keyBg = (key: string) => {
    const s = letterStates[key.toLowerCase()];
    if (s === 'correct') return styles.keyCorrect;
    if (s === 'present') return styles.keyPresent;
    if (s === 'absent')  return styles.keyAbsent;
    return null;
  };

  const keyTextColor = (key: string) =>
    letterStates[key.toLowerCase()] ? styles.keyTextLight : null;

  return (
    <View style={styles.keyboard}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(key => (
            <TouchableOpacity
              key={key}
              disabled={disabled}
              style={[styles.key, keyBg(key)]}
              onPress={() => onKey(key.toLowerCase())}
              activeOpacity={0.65}
            >
              <Text style={[styles.keyText, keyTextColor(key)]}>{key}</Text>
            </TouchableOpacity>
          ))}

          {/* Backspace only on the last row */}
          {rowIndex === 2 && (
            <TouchableOpacity
              disabled={disabled}
              style={[styles.key, styles.backspaceKey]}
              onPress={onBackspace}
              activeOpacity={0.65}
            >
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: '#ECF0F1',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 6,
    gap: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  key: {
    flex: 1,
    maxWidth: 38,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  backspaceKey: {
    flex: 1.5,
    maxWidth: 52,
    backgroundColor: '#B0BEC5',
  },
  keyCorrect: {
    backgroundColor: COLORS.successDark,
  },
  keyPresent: {
    backgroundColor: COLORS.hint,
  },
  keyAbsent: {
    backgroundColor: COLORS.accent,
  },
  keyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  keyTextLight: {
    color: COLORS.card,
  },
});
