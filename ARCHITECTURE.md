# 🏗️ System Architecture

Complete technical documentation of the A'chik Garo Language Platform.

## 📐 Overview

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE (React)                 │
│  ┌──────────────┬──────────────┬──────────┬────────────┐ │
│  │  Translator  │  Dictionary  │ Phrases  │   Grammar  │ │
│  └──────────────┴──────────────┴──────────┴────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│            TRANSLATION ENGINE (JavaScript)              │
│  ┌──────────┬──────────┬──────────┬─────────────────┐  │
│  │ Semantic │Morphology│Classifier│ Fuzzy Matching │  │
│  │  Engine  │  Parser  │  System  │                 │  │
│  └──────────┴──────────┴──────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER (JSON Database)                  │
│              garo_dictionary.json (6000+ entries)       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              SERVER (Express.js + Node)                  │
│  - Static File Serving                                  │
│  - API Endpoints (Extensible)                           │
│  - Database Management                                  │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Technology Stack
- **Framework**: React 18.2.0
- **Styling**: TailwindCSS 3.4.1
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.0
- **Search**: Fuse.js 7.3.0 (fuzzy search library)

### Component Hierarchy

```
App (Router Wrapper)
├── Navigation Bar
│   ├── Logo (Link to home)
│   ├── Nav Items (4 pages)
│   └── Dark Mode Toggle
├── Main Routes
│   ├── / → Translator.jsx
│   ├── /dictionary → Dictionary.jsx
│   ├── /phrases → Phrases.jsx
│   └── /grammar → VerbsGrammar.jsx
└── Footer
```

### State Management

**Client-side State** (React hooks):
- `inputText`: Current input (Translator)
- `inputLang` / `outputLang`: Language pair (Translator)
- `searchQuery`: Search term (Dictionary)
- `selectedCategory`: Active category (Dictionary/Phrases/Grammar)
- `darkMode`: Theme toggle (App)

No external state management (Redux/Context) needed due to simple data flow.

### Data Flow

```
User Input
    ↓
React State Update
    ↓
Translation Engine Processing
    ↓
Component Re-render
    ↓
Display Results
```

### Pages

#### 1. **Translator.jsx**
- Real-time translation as user types
- Supports English ↔ Garo ↔ Hindi
- Features:
  - Word-by-word breakdown
  - Grammar analysis (morphology, tenses, numbers)
  - Example phrases
  - Language swap button

#### 2. **Dictionary.jsx**
- Searchable vocabulary browser
- Advanced filters:
  - Search language (English/Garo/Hindi/All)
  - Category filter
  - Sort options (A-Z, By Category)
- Results table with semantic categories
- Category overview cards showing word counts

#### 3. **Phrases.jsx**
- Curated phrase collections (9 categories)
- Categories:
  - Greetings & Politeness
  - Market & Shopping
  - Travel & Directions
  - Hospital & Health
  - School & Education
  - Family & Home
  - Emotions & Feelings
  - Cultural & Festive
  - Requests & Politeness
- Each phrase shows: English, Garo, Hindi, and context

#### 4. **VerbsGrammar.jsx**
- Grammar reference and learning resource
- Tabs:
  - **Verbs**: Conjugation patterns
  - **Classifiers**: Noun counter system
  - **Counting**: Number system and dynamic generation
  - **Grammar**: 6 grammatical concepts
  - **Pronouns**: Complete pronoun paradigm

## 🔧 Translation Engine Architecture

### File: `src/translationEngine.js`

**Class**: `GaroTranslationEngine`

#### Data Structures

```javascript
englishToGaro = {
  'dog': { garo: 'achak', category: 'animals', priority: 'exact' },
  'cat': { garo: 'menggo', category: 'animals', priority: 'exact' },
  // ... 6000+ entries
}

garoToEnglish = {
  'achak': { english: 'dog', category: 'animals', priority: 'exact' },
  'menggo': { english: 'cat', category: 'animals', priority: 'exact' },
  // ... 6000+ entries
}
```

#### Core Methods

**Indexing**:
- `buildIndexes()`: Parses dictionary.json and creates reverse lookups
- `constructor()`: Initializes all indexes

**Translation**:
- `translateWord(word, fromLang, toLang)`: Single word translation
- `translateSentence(text, fromLang, toLang)`: Full sentence translation with breakdown

**Analysis**:
- `analyzeGrammar(sentence, language)`: Detects tenses, numbers, morphology
- `detectMorphology(word)`: Extracts verb roots and affixes
- `detectNumber(word)`: Identifies numeric words
- `getClassifier(english, category)`: Maps nouns to classifiers

**Search & Utility**:
- `normalize(text)`: Lowercase, trim, remove punctuation
- `tokenize(text)`: Split into words
- `fuzzyMatch(word, dictionary)`: Typo-tolerant matching
- `searchVocabulary(query, language)`: Search across all entries
- `getCategoryVocabulary(category)`: Get all words in category
- `getAllCategories()`: List all semantic categories

**Generation**:
- `generateNumber(num)`: Dynamic number generation (21 → "Kolgrik-sa")

### Translation Priority System

```
1. Exact Match (englishToGaro[normalized_word])
2. Compound Word Match (rasin-gipok → garlic)
3. Classifier-Aware Match (noun category + classifier)
4. Normalization Match (hand-wash → hand wash)
5. Morphology Match (cha·enga → root: cha·a, tense: present)
6. Grammar-Aware Match (sentence structure reconstruction)
7. Semantic Match (contextual similarity)
8. Fuzzy Match (typo tolerance)
9. AI Fallback (never used in this system - fallback to original)
```

### Morphology Engine

**Verb Suffixes**:
```javascript
{
  'enga': 'present continuous',  // cha·enga = eating
  'aha': 'past tense',            // cha·aha = ate
  'gen': 'future tense'           // cha·gen = will eat
}
```

**Process**:
1. Extract word
2. Check for known suffixes
3. Find root (word without suffix)
4. Identify tense
5. Return morphological breakdown

### Classifier System

**Classifier Mappings**:
```javascript
{
  'animals': 'Mang',           // Sa·mang = one animal
  'birds': 'Mang',
  'insects_and_aquatic': 'Mang',
  'family_members': 'Sak',     // Sa·sak = one person
  'occupations': 'Sak',
  'social_people': 'Sak',
  'education': 'King',         // Sa·king = one book
  'household_items': 'Ge',     // Sa·ge = one item
  'clothing_and_wearables': 'Ge',
  'kitchen_and_cooking': 'Ge',
  'at_the_market': 'Gong'      // Sa·gong = one coin
}
```

**Number Generation Algorithm**:
```javascript
generateNumber(num) {
  if (num <= 10) return baseNumbers[num]
  if (num <= 90) return combineBaseWithTens(num)
  if (num <= 1000) return combineHundreds(num)
  if (num > 1000) return generateThousands(num)
}
```

Example: 25 = "Kolgrik-bonga" (twenty-five)

### Fuzzy Matching Algorithm

```
Input: "handwash"
Query: "hand" in "handwash"? No direct match
Partial: "handwash" similar to "hand wash"?
Result: Return matches for both "hand" and "wash"
```

## 📊 Data Structure

### Dictionary.json Format

```json
{
  "_meta": {
    "language": "Garo",
    "version": "2.0"
  },
  
  "classifier_engine": {
    "Mang": {
      "use_for": ["animals", "birds"],
      "examples": [...]
    }
  },
  
  "pronouns": {
    "i": "Anga",
    "you": "Na·a",
    "_examples": [...]
  },
  
  "animals": {
    "_classifier": "Mang",
    "_examples": [...],
    "dog": "Achak",
    "cat": "Menggo"
  },
  
  "verbs_present": {
    "_classifier": null,
    "_examples": [...],
    "eat": "Cha·a",
    "sleep": "Tusia"
  }
}
```

### Category Organization

| Category | Count | Classifier | Examples |
|----------|-------|-----------|----------|
| pronouns | 20 | null | I, you, he, we, they |
| animals | 15 | Mang | dog, cat, cow |
| birds | 10 | Mang | crow, hen, eagle |
| colors | 6 | null | red, white, black |
| verbs_present | 40+ | null | eat, sleep, walk |
| household_items | 25+ | Ge | house, door, table |
| family_members | 10 | Sak | father, mother, sister |

**Total**: 6000+ unique vocabulary entries

## 🖥️ Backend Architecture

### Server File: `server.js`

```javascript
Express App
├── Middleware
│   ├── express.json() - Parse JSON bodies
│   └── express.static() - Serve static files
├── Routes
│   ├── POST /translate - API endpoint (extensible)
│   └── GET * - SPA fallback to index.html
└── Server
    ├── Port: 3001
    ├── Static: dist/ folder
    └── SPA Mode: All routes → index.html
```

### Static File Serving

```
/dist/index.html          ← Main entry point
/dist/assets/
├── index-XXXXX.js        ← React app bundle
└── index-XXXXX.css       ← Styles bundle
```

### API Extensibility

Future endpoints can be added:

```javascript
// POST /translate - Server-side translation (unused, client-side only)
// GET /dictionary/search - Extended search
// POST /analysis - Deep grammar analysis
// GET /phrases/by-category - Phrase collections
```

## 🎨 Styling Architecture

### TailwindCSS Configuration

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        garo: {
          50: '#f7fafc',
          100: '#edf2f7',
          500: '#4a5568',
          600: '#2d3748',
          700: '#1a202c'
        }
      }
    }
  },
  plugins: ['@tailwindcss/forms']
}
```

### CSS Customizations

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
.card { /* Reusable card styles */ }
.text-shadow { /* Text effects */ }
.garo-text { /* Garo-specific styling */ }
.fade-in { /* Animations */ }
.transition-smooth { /* Smooth transitions */ }
```

### Dark Mode

- TailwindCSS built-in dark mode
- Toggle via `darkMode` state
- Applied to entire app:
  ```javascript
  <div className={darkMode ? 'dark' : ''}>
    {/* Contents apply dark: prefix styles */}
  </div>
  ```

## 🔄 Data Flow Diagrams

### Translation Flow

```
User Types → React State Update
           → translationEngine.translateSentence()
           → Parse tokens
           → Lookup each word
           → Apply rules
           → Return result with breakdown
           → React renders results
```

### Search Flow

```
User Enters Query → Normalize query
                  → CaseMatch all categories
                  → Filter results
                  → Sort results
                  → Display in table
```

### Grammar Analysis Flow

```
User Enters Sentence → Tokenize
                     → detectMorphology()
                     → detectNumber()
                     → extractTenses()
                     → compilAnalysis()
                     → Display breakdown
```

## 🚀 Performance Optimizations

1. **Lazy Loading**: Components loaded on route change
2. **Code Splitting**: Vite auto-splits bundles
3. **Memoization**: useMemo for expensive computations
4. **Local Indexes**: All data indexed in memory (no API calls)
5. **Compressed CSS**: TailwindCSS produces ~5KB gzipped
6. **Bundle Size**: ~240KB uncompressed, ~75KB gzipped

## 🔒 Security Considerations

1. **Client-Side Only**: No sensitive data stored
2. **Input Validation**: Text input sanitized
3. **No Authentication**: Public access platform
4. **CORS**: Not applicable (no external APIs)
5. **CSP**: Can add Content Security Policy headers

## 📈 Scalability

### To Add More Vocabulary
1. Edit `garo_dictionary.json`
2. Add entries in appropriate category
3. Rebuild: `npm run build`
4. Redeploy

### To Add New Categories
1. In `garo_dictionary.json`: Create new section
2. In `Dictionary.jsx`: Add emoji mapping
3. In `translationEngine.js`: Update classifier mappings if needed
4. No code changes to engine needed

### To Extend Translation Engine
1. Add new morphology rules in `detectMorphology()`
2. Add classifier mappings in `getClassifier()`
3. Enhance fuzzy matching in `fuzzyMatch()`
4. Add number generation rules in `generateNumber()`

## 📚 Knowledge Base

### Language Rules Implemented

1. **SOV Word Order**: Subject-Object-Verb structure
2. **Verb Conjugation**: Present (-enga), Past (-aha), Future (-gen)
3. **Classifier Agreement**: Noun + Classifier + Number
4. **Possessive Markers**: Angni (my), Nang·ni (your), Uni (his/her)
5. **Negative**: -ba or -ja suffix
6. **Questions**: Question marker + word order
7. **Compound Words**: Meaning preserved (rasin-gipok ≠ gipok)
8. **Numbers**: 1-10 base, tens, hundreds, dynamic generation

### Linguistic Features

- **Tone Markers** (·): Phonetically significant
- **Classifier System**: 5 main classifiers for different noun types
- **Morphology**: Affixation with verb roots
- **Gender**: Not marked in this system (included if specified)
- **Animacy**: Affects classifier choice

## 🧪 Testing Strategy

### Unit Tests (Can be added)
- `translateWord()` with various inputs
- `detectMorphology()` with verb forms
- `generateNumber()` with edge cases
- `fuzzyMatch()` with typos

### Integration Tests
- Full sentence translation
- Dictionary search with filters
- Grammar analysis pipeline

### E2E Tests
- All 4 pages load
- Translations produce results
- Search returns expected results
- Dark mode toggles
- Mobile responsiveness

## 📖 Example Flows

### Example 1: Simple Translation

```
Input: "dog"
Process:
  1. Normalize: "dog"
  2. Lookup englishToGaro: Found "dog" → "achak"
  3. Get category: "animals"
  4. Return { garo: "achak", category: "animals" }
Output: "achak" (Animal)
```

### Example 2: Sentence Translation

```
Input: "I am eating rice"
Process:
  1. Tokenize: ["I", "am", "eating", "rice"]
  2. Translate each:
     - "I" → "Anga" (pronoun)
     - "am" → (skip, auxiliary)
     - "eating" → "cha·enga" (verb present)
     - "rice" → "mi" (food)
  3. Reconstruct SOV: "Anga mi cha·enga"
  4. Analyze morphology:
     - cha·enga → root: cha·a, tense: present
  5. Provide breakdown for each word
Output:
  Translated: "Anga mi cha·enga"
  Breakdown: [Anga=pronoun, mi=noun, cha·enga=verb]
```

### Example 3: Number with Classifier

```
Input: "two chickens"
Process:
  1. Detect number: "two" → Gni (2)
  2. Detect noun: "chickens" → Do·o
  3. Get category: "birds" → Classifier "Mang"
  4. Reconstruct: Classifier + Number + Noun
  5. Garo order: "Mang Gni Do·o"
Output: "Mang Gni Do·o"
```

---

**This architecture ensures semantic understanding, extensibility, and performance for the A'chik Garo learning platform.**
