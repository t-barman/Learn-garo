import garoDictionary from '../garo_dictionary.json'

class GaroTranslationEngine {

  constructor() {

    this.dictionary = garoDictionary || {}

    this.englishToGaro = {}
    this.garoToEnglish = {}

    // =====================================================
    // PRONOUNS
    // =====================================================

    this.pronouns = {

      i: 'Anga',
      me: 'Angko',
      you: 'Na·a',
      he: 'Ua',
      she: 'Ua',
      they: 'Bisong',
      we: 'An·ching',
      my: 'Angni',
      your: 'Nangni',
    }

    // =====================================================
    // VERBS
    // =====================================================

    this.verbs = {

      eat: 'cha·',
      drink: 'ring',
      go: 're·ang',
      come: 're·ba',
      sleep: 'tusi',
      read: 'porai',
      write: 'se·',
      play: 'kal',
      wash: 'rong',
      help: 'dakchak',
      give: 'on·',
      take: 'ra·',
      love: 'ka·sa',
      know: 'ui',
      sit: 'asong',
      work: 'dak',
      speak: 'agan',
      see: 'ni',
      wait: 'damo',
      buy: 'bre',
      sell: 'pal',
    }

    // =====================================================
    // PHRASES
    // =====================================================

    this.phrases = {

      'hello': 'Salam',
      'hi': 'Salam',

      'thank you': 'Mitela',

      'good morning': 'Pringnam',
      'good evening': 'Attamnam',
      'good night': 'Walnam',

      'how are you': 'Na·a namengama?',

      'what are you doing': 'Maidakenga?',

      'i love you': 'Anga nang·na ka·sa',

      "i don't know": 'Anga uija',

      'lets go': "Hai re'naha",
      "let's go": "Hai re'naha",

      // OBJECT + VERB SPOKEN GARO

      'drink water': 'Chi ringbo',
      'drink tea': 'Cha ringbo',
      'drink milk': 'To ringbo',

      'eat rice': 'Mi cha·bo',
      'eat food': 'Be·en cha·bo',

      'go market': 'Bajalchi re·angbo',
      'go school': 'Skulchi re·angbo',
      'go home': 'Nokchi re·angbo',

      'come here': 'Ianona re·babo',

      'sit down': 'Asongbo',

      'read book': 'Ki·tap poraibo',

      'write letter': 'Chithi se·bo',

      'wash clothes': 'Gaina rongbo',
    }

    this.buildIndexes()
  }

  // =====================================================
  // BUILD INDEXES
  // =====================================================

  buildIndexes() {

    try {

      Object.keys(this.dictionary).forEach(category => {

        const section = this.dictionary[category]

        if (!section || typeof section !== 'object') {
          return
        }

        Object.entries(section).forEach(([english, value]) => {

          if (english.startsWith('_')) {
            return
          }

          let garo = ''

          if (typeof value === 'object') {
            garo = value.garo || ''
          } else {
            garo = String(value)
          }

          english = english.toLowerCase().trim()
          garo = garo.toLowerCase().trim()

          if (english && garo) {

            this.englishToGaro[english] = garo
            this.garoToEnglish[garo] = english
          }
        })
      })

    } catch (error) {

      console.error('Dictionary build failed:', error)
    }
  }

  // =====================================================
  // NORMALIZE
  // =====================================================

  normalize(text) {

    if (!text) return ''

    return text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // =====================================================
  // TOKENIZE
  // =====================================================

  tokenize(text) {

    return this.normalize(text)
      .split(' ')
      .filter(Boolean)
  }

  // =====================================================
  // TRANSLATE WORD
  // =====================================================

  translateWord(word) {

    return (

      this.englishToGaro[word] ||

      this.pronouns[word] ||

      word
    )
  }

  // =====================================================
  // IS VERB
  // =====================================================

  isVerb(word) {

    return !!this.verbs[word]
  }

  // =====================================================
  // BUILD GARO SENTENCE
  // =====================================================

  buildSentence(words) {

    let subject = ''

    let objectWords = []

    let verb = ''

    words.forEach(word => {

      // SUBJECT

      if (this.pronouns[word]) {

        subject = this.pronouns[word]

        return
      }

      // VERB

      if (this.isVerb(word)) {

        verb = this.verbs[word] + 'bo'

        return
      }

      // IGNORE HELPERS

      if (
        [
          'am',
          'is',
          'are',
          'was',
          'were',
          'the',
          'a',
          'an',
          'to',
          'will',
          'be'
        ].includes(word)
      ) {
        return
      }

      // OBJECT

      objectWords.push(
        this.translateWord(word)
      )
    })

    // TRUE GARO ORDER:
    // SUBJECT + OBJECT + VERB

    return [
      subject,
      ...objectWords,
      verb
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // =====================================================
  // MAIN TRANSLATE
  // =====================================================

  translate(text, fromLang = 'en', toLang = 'garo') {

    try {

      if (!text) {
        return ''
      }

      const normalized =
        this.normalize(text)

      // EXACT PHRASE

      if (this.phrases[normalized]) {

        return this.phrases[normalized]
      }

      // TOKENIZE

      const words =
        this.tokenize(normalized)

      // BUILD SENTENCE

      return this.buildSentence(words)

    } catch (error) {

      console.error('Translation failed:', error)

      return 'Translation failed'
    }
  }

  // =====================================================
  // TRANSLATE SENTENCE
  // =====================================================

  translateSentence(text) {

    const translated =
      this.translate(text)

    const words =
      this.tokenize(text)

    return {

      original: text || '',

      translated: translated || '',

      language: 'garo',

      breakdown: words.map(word => ({

        english: word,

        garo: this.translateWord(word),

        category: 'general',
      })),

      tokens: words || [],

      morphology: [],

      classifiers: [],

      numbers: [],

      tenses: [],
    }
  }

  // =====================================================
  // WORD BY WORD
  // =====================================================

  translateSentenceWordByWord(text) {

    const words =
      this.tokenize(text)

    return {

      original: text || '',

      translated: words
        .map(word => this.translateWord(word))
        .join(' '),

      breakdown: words.map(word => ({

        english: word,

        garo: this.translateWord(word),

        category: 'general',
      })),

      tokens: words || [],

      morphology: [],

      classifiers: [],

      numbers: [],

      tenses: [],
    }
  }

  // =====================================================
  // ANALYZE GRAMMAR
  // =====================================================

  analyzeGrammar(text) {

    const words =
      this.tokenize(text)

    return {

      original: text || '',

      normalized:
        this.normalize(text),

      tokens: words || [],

      morphology: [],

      classifiers: [],

      numbers: [],

      tenses: [],

      negative: false,

      question: false,

      structure: 'SOV',

      subject: null,

      verb: null,

      objects: [],

      translatedPreview:
        this.translate(text) || '',
    }
  }

  // =====================================================
  // SEARCH VOCABULARY
  // =====================================================

  searchVocabulary(query) {

    const q =
      this.normalize(query)

    return Object.keys(this.englishToGaro)

      .filter(word => word.includes(q))

      .map(word => ({

        english: word,

        garo:
          this.englishToGaro[word]
      }))
  }

  // =====================================================
  // GET ALL CATEGORIES
  // =====================================================

  getAllCategories() {

    return Object.keys(this.dictionary)
  }

  // =====================================================
  // GET CATEGORY VOCAB
  // =====================================================

  getCategoryVocabulary(category) {

    return this.dictionary[category] || {}
  }
}

export default new GaroTranslationEngine()
