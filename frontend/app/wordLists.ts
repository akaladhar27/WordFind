/costexport const WORD_LISTS: Record<number, string[]> = {
  4: [
    // original 50
    'book', 'tree', 'game', 'play', 'word', 'time', 'life', 'home', 'work', 'love',
    'fish', 'bird', 'moon', 'star', 'rain', 'snow', 'leaf', 'rock', 'sand', 'wave',
    'cake', 'milk', 'rice', 'soup', 'meat', 'corn', 'bean', 'salt', 'chip', 'nuts',
    'bear', 'deer', 'frog', 'goat', 'lamb', 'lion', 'moth', 'seal', 'swan', 'wolf',
    'blue', 'gold', 'gray', 'pink', 'teal', 'jade', 'rose', 'ruby', 'onyx', 'opal',
    // 100 new
    'fire', 'wind', 'hill', 'pond', 'path', 'road', 'city', 'farm', 'barn', 'ship',
    'boat', 'sail', 'flag', 'king', 'ring', 'song', 'bell', 'drum', 'fork', 'bowl',
    'coat', 'boot', 'shoe', 'sock', 'belt', 'door', 'wall', 'roof', 'yard', 'park',
    'lake', 'pool', 'well', 'cave', 'mine', 'iron', 'coal', 'clay', 'silk', 'coin',
    'bill', 'mile', 'inch', 'foot', 'hour', 'week', 'dawn', 'dusk', 'noon', 'tide',
    'gust', 'haze', 'heat', 'cold', 'warm', 'cool', 'soft', 'hard', 'fast', 'slow',
    'high', 'wide', 'thin', 'long', 'dark', 'pale', 'bold', 'kind', 'wise', 'calm',
    'free', 'pure', 'true', 'fair', 'deep', 'flat', 'oval', 'tall', 'slim', 'lean',
    'keen', 'neat', 'tidy', 'cozy', 'mild', 'wild', 'tame', 'huge', 'loud', 'glad',
    'open', 'shut', 'damp', 'dull', 'glow', 'grip', 'hunt', 'jump', 'knot', 'loft',
  ],

  5: [
    // original 50
    'apple', 'grape', 'lemon', 'mango', 'peach', 'beach', 'ocean', 'river', 'storm', 'cloud',
    'house', 'table', 'chair', 'couch', 'light', 'music', 'dance', 'smile', 'laugh', 'dream',
    'bread', 'toast', 'pasta', 'pizza', 'salad', 'green', 'brown', 'white', 'black', 'cream',
    'tiger', 'zebra', 'horse', 'mouse', 'sheep', 'whale', 'shark', 'eagle', 'robin', 'crane',
    'water', 'earth', 'flame', 'stone', 'glass', 'metal', 'paper', 'cloth', 'wood', 'brick',
    // 100 new
    'tulip', 'daisy', 'lilac', 'cedar', 'birch', 'blaze', 'frost', 'trail', 'ridge', 'slope',
    'cliff', 'swamp', 'field', 'grove', 'brook', 'creek', 'cabin', 'lodge', 'tower', 'fence',
    'bench', 'swing', 'plaza', 'court', 'alley', 'sword', 'spear', 'arrow', 'crown', 'jewel',
    'feast', 'broth', 'steak', 'gravy', 'olive', 'sugar', 'honey', 'spice', 'thyme', 'basil',
    'clove', 'pearl', 'amber', 'coral', 'topaz', 'ivory', 'ebony', 'flute', 'piano', 'viola',
    'banjo', 'chess', 'poker', 'rugby', 'climb', 'brave', 'quiet', 'swift', 'sharp', 'dense',
    'clear', 'vivid', 'giant', 'noble', 'harsh', 'sweet', 'crisp', 'juicy', 'smoky', 'silky',
    'rough', 'thick', 'plump', 'sleek', 'plain', 'fancy', 'proud', 'angry', 'silly', 'lucky',
    'shiny', 'leafy', 'rocky', 'sandy', 'misty', 'rainy', 'sunny', 'muddy', 'windy', 'snowy',
    'bloom', 'craft', 'grace', 'pride', 'bliss', 'mayor', 'guest', 'scout', 'reply', 'north',
  ],

  6: [
    // original 50
    'banana', 'orange', 'cherry', 'papaya', 'tomato', 'garden', 'flower', 'forest', 'meadow', 'canyon',
    'window', 'mirror', 'pillow', 'carpet', 'closet', 'planet', 'rocket', 'galaxy', 'cosmos', 'comet',
    'butter', 'cheese', 'yogurt', 'cereal', 'waffle', 'purple', 'yellow', 'silver', 'golden', 'copper',
    'rabbit', 'turtle', 'monkey', 'parrot', 'pigeon', 'salmon', 'shrimp', 'oyster', 'clover', 'cactus',
    'bridge', 'castle', 'church', 'market', 'school', 'museum', 'temple', 'palace', 'tunnel', 'island',
    // 100 new
    'orchid', 'dahlia', 'violet', 'bamboo', 'willow', 'spruce', 'walnut', 'almond', 'cashew', 'sesame',
    'ginger', 'pepper', 'garlic', 'fennel', 'millet', 'quinoa', 'lentil', 'turnip', 'radish', 'celery',
    'squash', 'muffin', 'cookie', 'noodle', 'omelet', 'fondue', 'quiche', 'sorbet', 'toffee', 'coffee',
    'jigsaw', 'puzzle', 'candle', 'bottle', 'bucket', 'barrel', 'basket', 'saddle', 'anchor', 'vessel',
    'cannon', 'dagger', 'helmet', 'shield', 'goblet', 'throne', 'knight', 'bishop', 'pirate', 'sailor',
    'hunter', 'farmer', 'dancer', 'singer', 'writer', 'doctor', 'lawyer', 'banker', 'archer', 'wizard',
    'goblin', 'dragon', 'falcon', 'jaguar', 'badger', 'ferret', 'iguana', 'lizard', 'python', 'condor',
    'toucan', 'magpie', 'puffin', 'osprey', 'marmot', 'gibbon', 'alpaca', 'donkey', 'jungle', 'desert',
    'tundra', 'valley', 'lagoon', 'harbor', 'beacon', 'parish', 'avenue', 'arcade', 'studio', 'clinic',
    'bakery', 'tavern', 'chapel', 'prison', 'estate', 'hamlet', 'colony', 'suburb', 'sector', 'domain',
  ],

  7: [
    // original 50
    'avocado', 'apricot', 'coconut', 'pumpkin', 'spinach', 'rainbow', 'thunder', 'volcano', 'glacier', 'tornado',
    'kitchen', 'bedroom', 'balcony', 'hallway', 'library', 'jupiter', 'neptune', 'mercury', 'uranium', 'element',
    'chicken', 'seafood', 'popcorn', 'pretzel', 'biscuit', 'diamond', 'emerald', 'crystal', 'granite', 'ceramic',
    'dolphin', 'penguin', 'gorilla', 'buffalo', 'leopard', 'panther', 'peacock', 'seagull', 'sparrow', 'cricket',
    'airport', 'station', 'factory', 'stadium', 'theater', 'gallery', 'academy', 'college', 'capitol', 'embassy',
    // 100 new
    'paprika', 'saffron', 'oregano', 'mustard', 'vinegar', 'lobster', 'catfish', 'halibut', 'sardine', 'octopus',
    'pelican', 'ostrich', 'vulture', 'rooster', 'hamster', 'cheetah', 'gazelle', 'caribou', 'mammoth', 'manatee',
    'piranha', 'reptile', 'serpent', 'lantern', 'compass', 'captain', 'admiral', 'general', 'colonel', 'soldier',
    'warrior', 'sheriff', 'senator', 'counsel', 'cabinet', 'charter', 'victory', 'history', 'journey', 'harvest',
    'village', 'pasture', 'orchard', 'terrace', 'cottage', 'mansion', 'dungeon', 'chamber', 'passage', 'gateway',
    'archway', 'pathway', 'railway', 'highway', 'capsule', 'shuttle', 'mission', 'quantum', 'nucleus', 'neutron',
    'gravity', 'eclipse', 'diagram', 'program', 'formula', 'science', 'biology', 'physics', 'english', 'spanish',
    'italian', 'chinese', 'digital', 'network', 'browser', 'monitor', 'printer', 'scanner', 'speaker', 'charger',
    'battery', 'blanket', 'curtain', 'cushion', 'dresser', 'counter', 'furnace', 'chimney', 'ceiling', 'rooftop',
    'meadows', 'flowers', 'streams', 'valleys', 'sunrise', 'outside', 'welcome', 'freedom', 'ancient', 'popular',
  ],

  8: [
    // original 50
    'blueberry', 'raspberry', 'pineapple', 'broccoli', 'zucchini', 'sunshine', 'moonlight', 'starlight', 'twilight', 'midnight',
    'bathroom', 'basement', 'elevator', 'stairway', 'corridor', 'asteroid', 'satellite', 'universe', 'molecule', 'particle',
    'sandwich', 'smoothie', 'pancakes', 'doughnut', 'meatball', 'amethyst', 'sapphire', 'platinum', 'titanium', 'aluminum',
    'elephant', 'kangaroo', 'flamingo', 'antelope', 'squirrel', 'caterpillar', 'crocodile', 'butterfly', 'dragonfly', 'honeybee',
    'hospital', 'monument', 'cathedral', 'fountain', 'skyscraper', 'aquarium', 'pavilion', 'coliseum', 'sanctuary', 'monastery',
    // 100 new
    'absolute', 'abstract', 'accident', 'accurate', 'activity', 'actually', 'addition', 'adequate', 'advanced', 'affected',
    'altitude', 'ambition', 'animated', 'annually', 'apparent', 'appetite', 'arranged', 'artifact', 'attitude', 'audacity',
    'aviation', 'balanced', 'baseball', 'birthday', 'blackout', 'blizzard', 'bookmark', 'bracelet', 'brochure', 'bulletin',
    'calendar', 'carriage', 'ceremony', 'champion', 'charcoal', 'cheerful', 'children', 'chipmunk', 'clothing', 'collapse',
    'colorful', 'comeback', 'complete', 'compound', 'concrete', 'conquest', 'cookbook', 'creative', 'criminal', 'critical',
    'crossbow', 'cupboard', 'customer', 'darkness', 'daughter', 'daybreak', 'deadline', 'decision', 'defender', 'definite',
    'delicate', 'delivery', 'describe', 'designer', 'diagonal', 'dialogue', 'discover', 'distinct', 'dominant', 'doorstep',
    'dramatic', 'duration', 'equation', 'eruption', 'evaluate', 'evidence', 'football', 'fracture', 'fragment', 'grateful',
    'guardian', 'guidance', 'headline', 'highland', 'humanity', 'identity', 'innocent', 'latitude', 'laughter', 'lavender',
    'lifetime', 'marathon', 'material', 'mechanic', 'mobility', 'moreover', 'national', 'notebook', 'obstacle', 'organize',
  ],
};
