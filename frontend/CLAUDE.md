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

The entire game UI lives in a single file: `app/index.tsx` (`WordUnjumbleGame` component). There are no sub-routes — `app/+html.tsx` is only a web shell wrapper.

### Game logic

The app is a word unjumble game with two modes:
- **Single-word mode** (`wordCount = 1`): navigate through words one at a time with Next/Fetch More
- **Multi-word mode** (`wordCount > 1`): all words shown at once, submit all answers together

State is managed entirely with `useState`/`useRef` inside the single component. Key state groups:
- `gameState` — words array, currentIndex, score, per-word answers and results
- `hints` — per-word array of revealed letter indices
- `elapsedTime` / `timerRunning` — game timer

### Backend API

The app calls a separate backend service. Configure the URL in `.env`:

```
EXPO_PUBLIC_BACKEND_URL=http://<your-local-ip>:8001
```

The only API call is `POST /api/words` with body `{ word_length, word_count }`, returning `{ words: JumbledWord[] }` where each word has `{ id, original, jumbled, length }`.

### Path aliases

`@/*` maps to the project root (configured in `tsconfig.json`).

### Metro cache

Metro is configured to use `.metro-cache/` as a persistent on-disk cache with 2 workers. This directory is untracked and can be deleted safely if you hit stale-cache issues.
