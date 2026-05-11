import garoDictionary from '../garo_dictionary.json'

class GaroTranslationEngine {

  constructor() {

    this.dictionary = garoDictionary

    this.englishToGaro = {}
    this.garoToEnglish = {}

    // =====================================================
    // PRONOUNS
    // =====================================================

    this.PRONOUNS = {

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

    this.VERBS = {

      go: 're·ang',
      come: 're·ba',
      eat: 'cha·',
      drink: 'ring',
      sleep: 'tusi',
      sit: 'asong',
      work: 'dak',
      help: 'dakchak',
      give: 'on·',
      take: 'ra·',
      see: 'ni',
      write: 'se·',
      read: 'porai',
      speak: 'agan',
      buy: 'bre',
      sell: 'pal',
      know: 'ui',
      love: 'ka·sa',
      play: 'kal',
      wash: 'rong',
      wait: 'damo',
      look: 'nia',
    }

    // =====================================================
    // SPECIAL OBJECT VERB RULES
    // =====================================================

    this.OBJECT_VERBS = {

      'drink water': 'Chi ringbo',
      'eat rice': 'Mi cha·bo',
      'eat food': 'Be·en cha·bo',
      'go market': 'Bajalchi re·angbo',
      'go school': 'Skulchi re·angbo',
      'go home': 'Nokchi re·angbo',
      'come here': 'Ianona re·babo',
      'sit down': 'Asongbo',
      'read book': 'Ki·tap poraibo',
      'wash clothes': 'Gaina rongbo',
    }

    // =====================================================
    // PHRASES
    // =====================================================

    this.PHRASES = {

      'hi': 'Salam',
      'hello': 'Salam',
      'thank you': 'Mitela',
      'good morning': 'Pringnam',
      'good night': 'Walnam',
      'how are you': 'Na·a namengama?',
      'what are you doing': 'Maidakenga?',
      'i love you': 'Anga nang·na ka·sa',
      "i don't know": 'Anga uija',
      "let's go": "Hai re'naha",
      'lets go': "Hai re'naha",
    }

    this.buildIndexes()
  }

  // =====================================================
  // BUILD DICTIONARY
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

    } catch (err) {

      console.error(err)
    }
  }

  // =====================================================
  // NORMALIZE
  // =====================================================

  normalize(text) {

    if (!text) return ''

    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?]/g, '')
      .replace(/\s+/g, ' ')
  }

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
      this.PRONOUNS[word] ||
      word
    )
  }

  // =====================================================
  // SIMPLE VERB DETECTION
  // =====================================================

  isVerb(word) {

    return !!this.VERBS[word]
  }

  // =====================================================
  // BUILD SENTENCE
  // =====================================================

  buildSentence(words) {

    let subject = ''
    let object = ''
    let verb = ''

    words.forEach(word => {

      if (this.PRONOUNS[word]) {

        subject = this.PRONOUNS[word]
        return
      }

      if (this.isVerb(word)) {

        verb = this.VERBS[word] + 'bo'
        return
      }

      object += this.translateWord(word) + ' '
    })

    return `${subject} ${object.trim()} ${verb}`
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

      // PHRASES

      if (this.PHRASES[normalized]) {
        return this.PHRASES[normalized]
      }

      // OBJECT VERB

      if (this.OBJECT_VERBS[normalized]) {
        return this.OBJECT_VERBS[normalized]
      }

      // WORDS

      const words =
        this.tokenize(normalized)

      // SENTENCE

      return this.buildSentence(words)

    } catch (err) {

      console.error(err)

      return 'Translation failed'
    }
  }

  // =====================================================
  // REQUIRED FRONTEND METHODS
  // =====================================================

  translateSentence(text) {

    return {

      original: text,

      translated: this.translate(text),

      language: 'garo',

      breakdown: []
    }
  }

  translateSentenceWordByWord(text) {

    const words =
      this.tokenize(text)

    return {

      original: text,

      translated: words
        .map(w => this.translateWord(w))
        .join(' '),

      breakdown: words.map(word => ({

        english: word,

        garo: this.translateWord(word),
      })),
    }
  }

  analyzeGrammar(text) {

    const words =
      this.tokenize(text)

    return {

      tokens: words,

      subject:
        words.find(w => this.PRONOUNS[w]) || null,

      verbs:
        words.filter(w => this.VERBS[w]),

      objects:
        words.filter(
          w =>
            !this.PRONOUNS[w] &&
            !this.VERBS[w]
        ),

      translatedPreview:
        this.translate(text)
    }
  }

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

  getAllCategories() {

    return Object.keys(this.dictionary)
  }

  getCategoryVocabulary(category) {

    return this.dictionary[category] || {}
  }
}

export default new GaroTranslationEngine()
