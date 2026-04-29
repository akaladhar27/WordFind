# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start           # Start Expo dev server (scan QR or press i/a/w)
yarn ios             # Run on iOS simulator
yarn android         # Run on Android emulator
yarn web             # Run in browser
yarn lint            # Run ESLint via expo lint
```

## Architecture

This is an **Expo (React Native) app** using **expo-router** for file-based routing, written in TypeScript with strict mode enabled. The New Architecture (`newArchEnabled: true`) is active.

### App structure

```
app/
  index.tsx          # Main game UI (WordUnjumbleGame component)
  useGameLogic.ts    # All game state and logic (custom hook)
  wordService.ts     # Word selection and shuffling logic
  wordLists.ts       # Bundled word lists keyed by word length (4–8)
  types.ts           # Shared TypeScript types (GameState, JumbledWord, HintState, etc.)
  styles.ts          # StyleSheet factory (createStyles) — responsive, takes screenWidth/Height
  CustomKeyboard.tsx # In-app QWERTY keyboard component
  +html.tsx          # Web shell wrapper only
```

There are no sub-routes.

### Game logic

All state and logic lives in `useGameLogic` (`app/useGameLogic.ts`). `app/index.tsx` only handles rendering and responsive layout calculations.

The app supports two **game styles** (selectable in Settings):

- **Classic** — unjumble a shuffled word by typing the answer
  - **Single-word mode** (`wordCount = 1`): one word at a time; auto-submits when answer length matches word length; "One More" button after correct
  - **Multi-word mode** (`wordCount > 1`): all words shown at once; each auto-submits individually; "One More" after all answered
- **Wordle** — guess the hidden word in `wordLength + 1` attempts; each row auto-submits when filled; invalid words (checked against dictionary API) flash red and clear

### Key state in `useGameLogic`

- `gameState` — `{ words, currentIndex, score, answers, results }`
- `hints` — per-word array of revealed letter indices
- `elapsedTime` / `timerRunning` / `timeLimit` / `timeLimitExpired` — optional countdown timer
- `wordleGuesses` / `wordleCurrentGuess` / `wordleAttempt` / `wordleGameOver` / `wordleWon` — Wordle mode state
- `dictionaryErrors` — per-word flag set when the entered word fails dictionary validation
- `wordleCurrentRowInvalid` — true while the current Wordle row is flashing red
- `seenWords` — per-length list of already-played words (persisted via `AsyncStorage`)
- `keyboardStyle` — `'system'` (native keyboard) or `'custom'` (in-app `CustomKeyboard`)
- `gameStyle` — `'classic'` or `'wordle'`

### Word source

Words are served entirely client-side — there is **no backend**. `wordService.getWords(length, count, exclude)` picks random words from `WORD_LISTS` in `wordLists.ts`, shuffles them, and returns `JumbledWord[]`. Seen words are tracked in `AsyncStorage` and passed as the `exclude` list so the same word isn't repeated across sessions.

### Dictionary validation

Classic mode and Wordle mode both validate answers against the free public API:
`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`

Network failures silently pass (the player is not penalised).

### Settings modal

Accessible via the **New** button in the header. Options:
- **Game Style**: Classic / Wordle
- **Word Complexity**: 4–8 letters
- **Number of Words**: 1, 3, 5, 10 (locked to 1 in Wordle mode)
- **Time Limit**: None / 1m / 2m / 3m / 5m
- **Keyboard**: System / Game Keyboard

### Path aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

### Metro cache

Metro is configured to use `.metro-cache/` as a persistent on-disk cache with 2 workers. This directory is untracked and can be deleted safely if you hit stale-cache issues.
