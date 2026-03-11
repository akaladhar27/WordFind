# Word Unjumble Game

A mobile word puzzle game where players unscramble jumbled letters to form words. Built with React Native/Expo and FastAPI.

## Features

- **Word Unjumble Gameplay**: Unscramble jumbled letters to find the correct word
- **Customizable Difficulty**: Choose word length (4-8 letters) and number of words (1, 3, 5, or 10)
- **Single & Multi-Word Modes**: Play one word at a time or see all words on screen
- **Timer**: Track how long it takes to complete each game
- **Hints**: Reveal letters one at a time when you're stuck
- **Shuffle**: Rearrange the jumbled letters for a fresh perspective
- **Score Tracking**: See your results with percentage correct
- **Neutral Color Design**: Clean, modern UI with a neutral color palette

## Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework for iOS, Android, and Web |
| **Expo (v54)** | Development platform that simplifies React Native development |
| **Expo Router** | File-based routing for navigation |
| **TypeScript** | Type-safe JavaScript for better code quality |
| **@expo/vector-icons (Ionicons)** | Icon library for UI elements |

### Backend (API Server)
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern Python web framework for building APIs |
| **Python 3** | Backend programming language |
| **Pydantic** | Data validation and serialization |
| **Uvicorn** | ASGI server to run the FastAPI application |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB** | NoSQL database for storing game scores |
| **Motor** | Async MongoDB driver for Python |

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│         (React Native + Expo + TypeScript)           │
│                                                      │
│  • Single-page app with game UI                      │
│  • State management with React hooks                 │
│  • Timer using useEffect + setInterval               │
│  • Responsive design for mobile screens              │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                           │
│              (FastAPI + Python)                      │
│                                                      │
│  • POST /api/words - Get jumbled words               │
│  • Word lists stored in-memory (by length 4-8)       │
│  • Shuffle algorithm for jumbling                    │
│  • POST /api/scores - Save game scores               │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                   Database                           │
│                   (MongoDB)                          │
│                                                      │
│  • game_scores collection                            │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/words` | Get jumbled words based on length and count |
| GET | `/api/words/random` | Get a single random jumbled word |
| POST | `/api/scores` | Save a game score |
| GET | `/api/scores` | Get top scores |

### Request/Response Examples

**Get Words**
```json
// POST /api/words
// Request
{
  "word_length": 5,
  "word_count": 3
}

// Response
{
  "words": [
    {
      "id": "uuid",
      "original": "apple",
      "jumbled": "pplae",
      "length": 5
    }
  ],
  "total": 3
}
```

## Key Features Implementation

| Feature | Technology Used |
|---------|-----------------|
| **Timer** | React `useRef` + `useEffect` with `setInterval` |
| **Hints** | React state tracking revealed letter indices |
| **Shuffle** | Fisher-Yates shuffle algorithm in frontend |
| **Word Generation** | Backend Python with pre-defined word lists |
| **Styling** | React Native `StyleSheet.create()` |

## Project Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI application with word generation
│   ├── .env               # Backend environment variables
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── app/
│   │   └── index.tsx      # Main game component
│   ├── assets/            # Images and static files
│   ├── .env               # Frontend environment variables
│   ├── app.json           # Expo configuration
│   └── package.json       # Node.js dependencies
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB

### Installation

1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

2. **Frontend Setup**
```bash
cd frontend
yarn install
yarn start
```

### Environment Variables

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=word_unjumble
```

**Frontend (.env)**
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

## Game Rules

1. You are presented with jumbled letters
2. Type the correct word in the input field
3. Use **Hint** to reveal one letter at a time (up to n-1 letters)
4. Use **Shuffle** to rearrange the letters
5. Click **Check** to verify your answer
6. Complete all words to see your final score and time

## Color Palette

The app uses a neutral color scheme:
- Background: `#F5F5F5` (Light Gray)
- Cards: `#FFFFFF` (White)
- Primary: `#4A5568` (Slate Gray)
- Success: `#68D391` (Green)
- Error: `#FC8181` (Red)
- Hint: `#ECC94B` (Yellow)

## License

This project is open source and available under the MIT License.
