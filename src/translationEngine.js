import garoDictionary from '../garo_dictionary.json'

class GaroTranslationEngine {

  constructor() {

    this.dictionary = garoDictionary || {}

    this.englishToGaro = {}
    this.garoToEnglish = {}

    // =====================================================
    // TRUE GARO GRAMMAR ENGINE
    // =====================================================
    //
    // GARO IS:
    // SUBJECT + OBJECT + VERB
    //
    // English:
    // I am eating rice
    //
    // Garo:
    // Anga mi cha·enga
    //
    // OBJECT COMES BEFORE VERB
    // VERB CHANGES WITH SUFFIX
    //
    // PRESENT = cha·bo
    // CONTINUOUS = cha·enga
    // PERFECT = cha·manjok
    // PAST = cha·aha
    //
    // =====================================================

    // =====================================================
    // PRONOUNS
    // =====================================================

    this.pronouns = {

      i: 'Anga',
      me: 'Angko',
      you: 'Na·a',
      he: 'Ua',
      she: 'Ua',
      we: 'An·ching',
      they: 'Bisong',

      my: 'Angni',
      your: 'Nangni',
    }

    // =====================================================
    // NOUNS
    // =====================================================

    this.nouns = {

      rice: 'mi',
      food: 'be·en',
      water: 'chi',
      tea: 'cha',
      milk: 'to',
      meat: 'bik',

      market: 'bajal',
      school: 'skul',
      house: 'nok',
      home: 'nok',

      book: 'ki·tap',
      clothes: 'gaina',
      letter: 'chithi',

      road: 'rama',
      work: 'kam',
      fish: 'na·tok',
      dog: 'a·chak',
      cat: 'bi·sim',
    }

    // =====================================================
    // TRUE GARO VERB ROOTS
    // =====================================================

    this.verbs = {

      eat: {
        root: 'cha·',
      },

      drink: {
        root: 'ring',
      },

      go: {
        root: 're·ang',
      },

      come: {
        root: 're·ba',
      },

      sleep: {
        root: 'tusi',
      },

      sit: {
        root: 'asong',
      },

      run: {
        root: 'kat',
      },

      walk: {
        root: 'song',
      },

      read: {
        root: 'porai',
      },

      write: {
        root: 'se·',
      },

      work: {
        root: 'dak',
      },

      speak: {
        root: 'agan',
      },

      play: {
        root: 'kal',
      },

      wash: {
        root: 'rong',
      },

      see: {
        root: 'ni',
      },

      help: {
        root: 'dakchak',
      },

      buy: {
        root: 'bre',
      },

      sell: {
        root: 'pal',
      },

      cook: {
        root: 'soa',
      },
    }

    // =====================================================
    // TRUE GARO TENSE SUFFIXES
    // =====================================================

    this.tenseSuffixes = {

      present: 'bo',

      continuous: 'enga',

      perfect: 'manjok',

      past: 'aha',

      future: 'gen',
    }

    // =====================================================
    // COMMON PHRASES
    // =====================================================

    this.phrases = {

      hello: 'Salam',

      hi: 'Salam',

      'thank you': 'Mitela',

      'good morning': 'Pringnam',

      'good night': 'Walnam',

      'good evening': 'Attamnam',

      'how are you':
        'Na·a namengama?',

      'i love you':
        'Anga nang·na ka·sa',

      "i don't know":
        'Anga uija',

      "let's go":
        "Hai re'naha",
    }

    this.buildIndexes()
  }

  // =====================================================
  // BUILD DICTIONARY INDEXES
  // =====================================================

  buildIndexes() {

    try {

      Object.keys(this.dictionary).forEach(category => {

        const section =
          this.dictionary[category]

        if (!section) return

        Object.entries(section).forEach(([english, value]) => {

          if (english.startsWith('_')) {
            return
          }

          let garo = ''

          if (
            typeof value === 'object'
          ) {

            garo =
              value.garo || ''

          } else {

            garo =
              String(value)
          }

          english =
            english
              .toLowerCase()
              .trim()

          garo =
            garo
              .toLowerCase()
              .trim()

          if (english && garo) {

            this.englishToGaro[english] =
              garo

            this.garoToEnglish[garo] =
              english
          }
        })
      })

    } catch (err) {

      console.error(
        'Dictionary load failed',
        err
      )
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
      .replace(/[.,!?]/g, '')
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
  // DETECT TENSE
  // =====================================================

  detectTense(words) {

    // PRESENT CONTINUOUS

    if (
      words.includes('am') ||
      words.includes('is') ||
      words.includes('are')
    ) {

      return 'continuous'
    }

    // PERFECT

    if (
      words.includes('have') ||
      words.includes('has')
    ) {

      return 'perfect'
    }

    // PAST

    if (
      words.includes('was') ||
      words.includes('were')
    ) {

      return 'past'
    }

    return 'present'
  }

  // =====================================================
  // ENGLISH VERB → ROOT
  // =====================================================

  detectVerb(word) {

    // DIRECT

    if (this.verbs[word]) {
      return word
    }

    // eating → eat
    // running → run
    // sitting → sit

    if (word.endsWith('ing')) {

      let base =
        word.slice(0, -3)

      // running

      if (base.endsWith('nn')) {
        base =
          base.slice(0, -1)
      }

      // sitting

      if (base.endsWith('tt')) {
        base =
          base.slice(0, -1)
      }

      // swimming

      if (base.endsWith('mm')) {
        base =
          base.slice(0, -1)
      }

      // sleeping

      if (base === 'sleep') {
        return 'sleep'
      }

      // eating

      if (base === 'eat') {
        return 'eat'
      }

      if (this.verbs[base]) {
        return base
      }
    }

    // played → play

    if (word.endsWith('ed')) {

      let base =
        word.slice(0, -2)

      if (this.verbs[base]) {
        return base
      }
    }

    return null
  }

  // =====================================================
  // TRUE GARO VERB BUILDER
  // =====================================================

  buildGaroVerb(
    englishVerb,
    tense
  ) {

    const data =
      this.verbs[englishVerb]

    if (!data) {
      return englishVerb
    }

    const root =
      data.root

    const suffix =
      this.tenseSuffixes[tense]

    // TRUE GARO MORPHOLOGY

    return root + suffix
  }

  // =====================================================
  // TRANSLATE SINGLE WORD
  // =====================================================

  translateWord(word) {

    return (

      this.pronouns[word] ||

      this.nouns[word] ||

      this.englishToGaro[word] ||

      word
    )
  }

  // =====================================================
  // BUILD TRUE GARO SENTENCE
  // =====================================================

  buildSentence(words) {

    let subject = ''

    let objects = []

    let verb = ''

    const tense =
      this.detectTense(words)

    for (const word of words) {

      // =================================================
      // SKIP HELPERS
      // =================================================

      if (
        [
          'am',
          'is',
          'are',
          'was',
          'were',
          'have',
          'has',
          'had',
          'the',
          'a',
          'an',
          'to',
          'be',
          'will',
        ].includes(word)
      ) {

        continue
      }

      // =================================================
      // SUBJECT
      // =================================================

      if (this.pronouns[word]) {

        subject =
          this.pronouns[word]

        continue
      }

      // =================================================
      // VERB
      // =================================================

      const detectedVerb =
        this.detectVerb(word)

      if (detectedVerb) {

        verb =
          this.buildGaroVerb(
            detectedVerb,
            tense
          )

        continue
      }

      // =================================================
      // OBJECT
      // =================================================

      objects.push(
        this.translateWord(word)
      )
    }

    // =====================================================
    // TRUE GARO ORDER
    // SUBJECT + OBJECT + VERB
    // =====================================================

    return [

      subject,

      ...objects,

      verb,

    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // =====================================================
  // MAIN TRANSLATE
  // =====================================================

  translate(text) {

    try {

      if (!text) {
        return ''
      }

      const normalized =
        this.normalize(text)

      // =================================================
      // PHRASE CHECK
      // =================================================

      if (this.phrases[normalized]) {

        return this.phrases[normalized]
      }

      // =================================================
      // TOKENIZE
      // =================================================

      const words =
        this.tokenize(normalized)

      // =================================================
      // BUILD TRUE GARO SENTENCE
      // =================================================

      return this.buildSentence(words)

    } catch (error) {

      console.error(
        'Translation failed',
        error
      )

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

        garo:
          this.translateWord(word),

        category: 'general',
      })),

      tokens: words,

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

      original: text,

      translated:
        words
          .map(word =>
            this.translateWord(word)
          )
          .join(' '),

      breakdown: [],

      tokens: words,
    }
  }

  // =====================================================
  // ANALYZE GRAMMAR
  // =====================================================

  analyzeGrammar(text) {

    return {

      original: text,

      normalized:
        this.normalize(text),

      translatedPreview:
        this.translate(text),

      structure: 'SOV',

      grammar:
        'True Garo grammar engine',

      tenses:
        Object.keys(
          this.tenseSuffixes
        ),
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  searchVocabulary(query) {

    const q =
      this.normalize(query)

    return Object.keys(
      this.englishToGaro
    )

      .filter(word =>
        word.includes(q)
      )

      .map(word => ({

        english: word,

        garo:
          this.englishToGaro[word]
      }))
  }

  // =====================================================
  // CATEGORY HELPERS
  // =====================================================

  getAllCategories() {

    return Object.keys(
      this.dictionary
    )
  }

  getCategoryVocabulary(category) {

    return (
      this.dictionary[category] || {}
    )
  }
}

export default new GaroTranslationEngine()
