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

| Requirement | Version | Download |
|-------------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.9+ | [python.org](https://python.org/) |
| MongoDB | 6.0+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Yarn | 1.22+ | `npm install -g yarn` |

### Installation

#### Step 1: Clone/Download the Project

```bash
# If using git
git clone <your-repo-url>
cd word-unjumble
```

#### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=word_unjumble" >> .env

# Start the backend server
uvicorn server:app --reload --port 8001
```

Backend will be running at: `http://localhost:8001`

#### Step 3: Setup Frontend

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Install Node.js dependencies
yarn install

# Create .env file
echo "EXPO_PUBLIC_BACKEND_URL=http://localhost:8001" > .env

# Start the Expo development server
yarn start
```

#### Step 4: Run the App

After running `yarn start`, you'll see a menu with options:

| Key | Action |
|-----|--------|
| `w` | Open in web browser |
| `i` | Open in iOS Simulator (Mac only, requires Xcode) |
| `a` | Open in Android Emulator (requires Android Studio) |
| Scan QR | Open on physical device with **Expo Go** app |

### Running on Mobile Device

1. Download **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Make sure your phone and laptop are on the **same WiFi network**

3. Scan the QR code shown in terminal with Expo Go app

### Quick Reference

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---------------------|----------------------|
| `cd backend` | `cd frontend` |
| `source venv/bin/activate` | `yarn install` |
| `uvicorn server:app --reload --port 8001` | `yarn start` |

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

### Using MongoDB Atlas (Cloud - No Local Install)

If you don't want to install MongoDB locally:

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Update backend `.env`:
```
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
DB_NAME=word_unjumble
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running: `mongod` or use MongoDB Atlas |
| Port 8001 already in use | Use different port: `uvicorn server:app --reload --port 8002` |
| `expo` command not found | Install Expo CLI: `npm install -g expo-cli` |
| Network error on mobile | Ensure phone and laptop are on same WiFi |
| Module not found (Python) | Activate venv: `source venv/bin/activate` |
| Module not found (Node) | Run `yarn install` in frontend folder |

## Game Rules

1. You are presented with jumbled letters
2. Type the correct word in the input field
3. Answer is **auto-checked** when you type the correct number of letters
4. **Correct answer**: Green background, "One More" button appears
5. **Incorrect answer**: Red background, delete to try again
6. Use **Hint** to reveal one letter at a time
7. Use **Shuffle** to rearrange the jumbled letters
8. Click **New** button to start a fresh game with new settings
9. Click **Summary** to see your score statistics

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
