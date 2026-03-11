from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Word lists organized by length
WORD_LISTS = {
    4: [
        "book", "tree", "game", "play", "word", "time", "life", "home", "work", "love",
        "fish", "bird", "moon", "star", "rain", "snow", "leaf", "rock", "sand", "wave",
        "cake", "milk", "rice", "soup", "meat", "corn", "bean", "salt", "chip", "nuts",
        "bear", "deer", "frog", "goat", "lamb", "lion", "moth", "seal", "swan", "wolf",
        "blue", "gold", "gray", "pink", "teal", "jade", "rose", "ruby", "onyx", "opal"
    ],
    5: [
        "apple", "grape", "lemon", "mango", "peach", "beach", "ocean", "river", "storm", "cloud",
        "house", "table", "chair", "couch", "light", "music", "dance", "smile", "laugh", "dream",
        "bread", "toast", "pasta", "pizza", "salad", "green", "brown", "white", "black", "cream",
        "tiger", "zebra", "horse", "mouse", "sheep", "whale", "shark", "eagle", "robin", "crane",
        "water", "earth", "flame", "stone", "glass", "metal", "paper", "cloth", "wood", "brick"
    ],
    6: [
        "banana", "orange", "cherry", "papaya", "tomato", "garden", "flower", "forest", "meadow", "canyon",
        "window", "mirror", "pillow", "carpet", "closet", "planet", "rocket", "galaxy", "cosmos", "comet",
        "butter", "cheese", "yogurt", "cereal", "waffle", "purple", "yellow", "silver", "golden", "copper",
        "rabbit", "turtle", "monkey", "parrot", "pigeon", "salmon", "shrimp", "oyster", "clover", "cactus",
        "bridge", "castle", "church", "market", "school", "museum", "temple", "palace", "tunnel", "island"
    ],
    7: [
        "avocado", "apricot", "coconut", "pumpkin", "spinach", "rainbow", "thunder", "volcano", "glacier", "tornado",
        "kitchen", "bedroom", "balcony", "hallway", "library", "jupiter", "neptune", "mercury", "uranium", "element",
        "chicken", "seafood", "popcorn", "pretzel", "biscuit", "diamond", "emerald", "crystal", "granite", "ceramic",
        "dolphin", "penguin", "gorilla", "buffalo", "leopard", "panther", "peacock", "seagull", "sparrow", "cricket",
        "airport", "station", "factory", "stadium", "theater", "gallery", "academy", "college", "capitol", "embassy"
    ],
    8: [
        "blueberry", "raspberry", "pineapple", "broccoli", "zucchini", "sunshine", "moonlight", "starlight", "twilight", "midnight",
        "bathroom", "basement", "elevator", "stairway", "corridor", "asteroid", "satellite", "universe", "molecule", "particle",
        "sandwich", "smoothie", "pancakes", "doughnut", "meatball", "amethyst", "sapphire", "platinum", "titanium", "aluminum",
        "elephant", "kangaroo", "flamingo", "antelope", "squirrel", "caterpillar", "crocodile", "butterfly", "dragonfly", "honeybee",
        "hospital", "monument", "cathedral", "fountain", "skyscraper", "aquarium", "pavilion", "coliseum", "sanctuary", "monastery"
    ]
}

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class WordRequest(BaseModel):
    word_length: int = 5  # 4, 5, 6, 7, or 8
    word_count: int = 1   # Number of words to return

class JumbledWord(BaseModel):
    id: str
    original: str
    jumbled: str
    length: int

class WordsResponse(BaseModel):
    words: List[JumbledWord]
    total: int

class GameScore(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    score: int
    total_words: int
    word_length: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GameScoreCreate(BaseModel):
    score: int
    total_words: int
    word_length: int

def shuffle_word(word: str) -> str:
    """Shuffle letters in a word, ensuring it's different from original"""
    letters = list(word)
    original = word
    max_attempts = 10
    attempts = 0
    
    while attempts < max_attempts:
        random.shuffle(letters)
        shuffled = ''.join(letters)
        if shuffled != original:
            return shuffled
        attempts += 1
    
    # If we can't get a different shuffle, reverse the word
    return word[::-1] if word[::-1] != word else letters[1:] + [letters[0]]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Word Unjumble Game API"}

@api_router.post("/words", response_model=WordsResponse)
async def get_words(request: WordRequest):
    """Get jumbled words based on length and count"""
    word_length = max(4, min(8, request.word_length))  # Clamp between 4-8
    word_count = max(1, min(20, request.word_count))   # Clamp between 1-20
    
    available_words = WORD_LISTS.get(word_length, WORD_LISTS[5])
    
    # Select random words
    selected_words = random.sample(available_words, min(word_count, len(available_words)))
    
    # Create jumbled words
    jumbled_words = []
    for word in selected_words:
        jumbled_words.append(JumbledWord(
            id=str(uuid.uuid4()),
            original=word,
            jumbled=shuffle_word(word),
            length=len(word)
        ))
    
    return WordsResponse(words=jumbled_words, total=len(jumbled_words))

@api_router.get("/words/random", response_model=JumbledWord)
async def get_random_word(length: int = 5):
    """Get a single random jumbled word"""
    word_length = max(4, min(8, length))
    available_words = WORD_LISTS.get(word_length, WORD_LISTS[5])
    word = random.choice(available_words)
    
    return JumbledWord(
        id=str(uuid.uuid4()),
        original=word,
        jumbled=shuffle_word(word),
        length=len(word)
    )

@api_router.post("/scores", response_model=GameScore)
async def save_score(input: GameScoreCreate):
    """Save a game score"""
    score_obj = GameScore(**input.dict())
    await db.game_scores.insert_one(score_obj.dict())
    return score_obj

@api_router.get("/scores", response_model=List[GameScore])
async def get_scores(limit: int = 10):
    """Get top scores"""
    scores = await db.game_scores.find().sort("score", -1).limit(limit).to_list(limit)
    return [GameScore(**score) for score in scores]

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
