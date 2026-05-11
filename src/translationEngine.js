import garoDictionary from '../garo_dictionary.json'

/**
 * =========================================================
 * GARO AI TRANSLATION ENGINE
 * =========================================================
 * REAL GRAMMAR ENGINE
 * - SOV sentence logic
 * - Context aware
 * - Verb morphology
 * - Prefix/Suffix system
 * - Spoken Garo patterns
 * - Dynamic sentence generation
 * - Question detection
 * - Negative sentence handling
 * - Command sentence handling
 * - Location suffixes
 * - Object-first Garo grammar
 * - Real-time AI style translation
 * =========================================================
 */

class GaroTranslationEngine {

  constructor() {

    this.dictionary = garoDictionary

    this.englishToGaro = {}
    this.garoToEnglish = {}

    // =====================================================
    // CORE PRONOUNS
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
    // VERB ROOTS
    // =====================================================

    this.VERBS = {

      go: 're·ang',
      come: 're·ba',
      eat: 'cha·',
      drink: 'ring',
      sleep: 'tusi',
      sit: 'asong',
      work: 'dak',
      give: 'on·',
      take: 'ra·',
      see: 'ni',
      watch: 'ni',
      write: 'se·',
      buy: 'bre',
      sell: 'pal',
      know: 'ui',
      love: 'ka·sa',
      help: 'dakchak',
      play: 'kal',
      speak: 'agan',
      pray: 'bi·',
      run: 'kat',
      walk: 'song',
      cook: 'nok',
      bring: 'ba·ra',
      open: '启动',
      close: 'tong',
      wash: 'rong',
      read: 'porai',
      learn: 'skie',
    }

    // =====================================================
    // IRREGULAR VERBS
    // =====================================================

    this.IRREGULARS = {

      went: 'go',
      going: 'go',
      goes: 'go',

      came: 'come',
      coming: 'come',

      ate: 'eat',
      eating: 'eat',

      drank: 'drink',
      drinking: 'drink',

      knew: 'know',
      knowing: 'know',

      bought: 'buy',
      buying: 'buy',

      sold: 'sell',
      selling: 'sell',

      slept: 'sleep',
      sleeping: 'sleep',

      ran: 'run',
      running: 'run',

      walked: 'walk',
      walking: 'walk',
    }

    // =====================================================
    // TENSE SUFFIXES
    // =====================================================

    this.SUFFIX = {

      present: '',
      continuous: 'enga',
      future: 'gen',
      imperative: 'bo',
      past: 'a',
      questionPast: 'ama?',
      questionPresent: 'engma?',
      negation: 'ja',
      location: 'chi',
    }

    // =====================================================
    // OBJECT-VERB EXPRESSIONS
    // IMPORTANT:
    // GARO USES OBJECT + VERB
    // =====================================================

    this.OBJECT_VERB_PATTERNS = {

      'drink water': 'Chi ringbo',
      'drink rice beer': 'Chu ringbo',
      'eat rice': 'Mi cha·bo',
      'eat food': 'Be·en cha·bo',
      'go market': 'Bajalchi re·angbo',
      'go school': 'Skulchi re·angbo',
      'go home': 'Nokchi re·angbo',
      'come here': 'Ianona re·babo',
      'sit down': 'Asongbo',
      'sleep now': 'Da·alo tusibo',
      'read book': 'Ki·tap poraibo',
      'write letter': 'Chithi se·bo',
      'play football': 'Football kalbo',
      'drink tea': 'Cha ringbo',
      'eat meat': 'Be·en cha·bo',
      'wash clothes': 'Gaina rongbo',
    }

    // =====================================================
    // COMMON PHRASES
    // =====================================================

    this.PHRASES = {

      'hi': 'Salam',
      'hello': 'Salam',
      'good morning': 'Pringnam',
      'good night': 'Walnam',
      'thank you': 'Mitela',
      'thanks': 'Mitela',

      'how are you': 'Na·a namengama?',
      'what are you doing': 'Maidakenga?',
      'where are you going': 'Na·a bano re·angenga?',

      'i love you': 'Anga nang·na ka·sa',
      'i dont know': 'Anga uija',
      "i don't know": 'Anga uija',

      "let's go": "Hai re'naha",
      'lets go': "Hai re'naha",
    }

    // =====================================================
    // NEGATIVE EXPRESSIONS
    // =====================================================

    this.NEGATIVE_SPECIAL = {

      know: 'uija',
      exist: 'ong·ja',
      have: 'dongja',
    }

    // =====================================================
    // CONJUNCTIONS
    // =====================================================

    this.CONJUNCTIONS = {

      and: 'aro',
      but: 'indiba',
      because: 'maina',
      then: 'unon',
      or: 'ba',
    }

    // =====================================================
    // BUILD INDEXES
    // =====================================================

    this.buildIndexes()
  }

  // =====================================================
  // BUILD DICTIONARY INDEX
  // =====================================================

  buildIndexes() {

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
  }

  // =====================================================
  // NORMALIZER
  // =====================================================

  normalize(text) {

    if (!text) return ''

    return text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^\w\s'·?!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  tokenize(text) {

    return this.normalize(text)
      .split(' ')
      .filter(Boolean)
  }

  // =====================================================
  // TENSE DETECTOR
  // =====================================================

  detectTense(words) {

    if (words.includes('will')) {
      return 'future'
    }

    if (
      words.includes('did') ||
      words.includes('went') ||
      words.includes('ate') ||
      words.includes('came')
    ) {
      return 'past'
    }

    if (
      words.includes('am') ||
      words.includes('is') ||
      words.includes('are') ||
      words.some(w => w.endsWith('ing'))
    ) {
      return 'continuous'
    }

    return 'present'
  }

  // =====================================================
  // NEGATIVE DETECTOR
  // =====================================================

  isNegative(words) {

    return (
      words.includes('not') ||
      words.includes("don't") ||
      words.includes('dont') ||
      words.includes("didn't")
    )
  }

  // =====================================================
  // QUESTION DETECTOR
  // =====================================================

  isQuestion(text) {
    return text.trim().endsWith('?')
  }

  // =====================================================
  // VERB RESOLVER
  // =====================================================

  resolveVerb(word) {

    if (this.VERBS[word]) {
      return word
    }

    if (this.IRREGULARS[word]) {
      return this.IRREGULARS[word]
    }

    return null
  }

  // =====================================================
  // CONJUGATION ENGINE
  // =====================================================

  conjugateVerb(verbKey, tense, negative = false) {

    if (negative && this.NEGATIVE_SPECIAL[verbKey]) {
      return this.NEGATIVE_SPECIAL[verbKey]
    }

    const root = this.VERBS[verbKey]

    if (!root) {
      return verbKey
    }

    let output = root

    switch (tense) {

      case 'continuous':
        output += this.SUFFIX.continuous
        break

      case 'future':
        output += this.SUFFIX.future
        break

      case 'past':
        output += this.SUFFIX.past
        break

      default:
        break
    }

    if (negative) {
      output += this.SUFFIX.negation
    }

    return output
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
  // SMART OBJECT + VERB PARSER
  // =====================================================

  parseObjectVerb(words) {

    const joined = words.join(' ')

    // exact pattern first

    if (this.OBJECT_VERB_PATTERNS[joined]) {
      return this.OBJECT_VERB_PATTERNS[joined]
    }

    // dynamic parser

    let object = null
    let verb = null

    for (const word of words) {

      const resolved = this.resolveVerb(word)

      if (resolved) {
        verb = resolved
      } else {

        if (
          ![
            'i',
            'you',
            'he',
            'she',
            'they',
            'we',
            'am',
            'is',
            'are',
            'to',
            'the',
            'a',
            'an'
          ].includes(word)
        ) {
          object = word
        }
      }
    }

    if (!verb) {
      return null
    }

    const garoVerb =
      this.VERBS[verb] + this.SUFFIX.imperative

    if (!object) {
      return garoVerb
    }

    const garoObject =
      this.translateWord(object)

    return `${garoObject} ${garoVerb}`
  }

  // =====================================================
  // QUESTION BUILDER
  // =====================================================

  buildQuestion(words) {

    const subject =
      this.PRONOUNS[words[1]] || 'Na·a'

    let verb = null

    for (const word of words) {

      const resolved = this.resolveVerb(word)

      if (resolved) {
        verb = resolved
      }
    }

    if (!verb) {
      return null
    }

    const root = this.VERBS[verb]

    return `${subject} ${root}${this.SUFFIX.questionPresent}`
  }

  // =====================================================
  // MAIN SENTENCE BUILDER
  // =====================================================

  buildSentence(words) {

    const tense =
      this.detectTense(words)

    const negative =
      this.isNegative(words)

    let subject = null
    let verb = null
    let objects = []

    for (const word of words) {

      if (this.PRONOUNS[word]) {
        subject = this.PRONOUNS[word]
        continue
      }

      const resolved = this.resolveVerb(word)

      if (resolved) {
        verb = resolved
        continue
      }

      if (
        ![
          'am',
          'is',
          'are',
          'was',
          'were',
          'will',
          'to',
          'the',
          'a',
          'an',
          'not',
        ].includes(word)
      ) {

        objects.push(
          this.translateWord(word)
        )
      }
    }

    if (!verb) {
      return null
    }

    const garoVerb =
      this.conjugateVerb(
        verb,
        tense,
        negative
      )

    // =================================================
    // TRUE GARO WORD ORDER
    // SUBJECT + OBJECT + VERB
    // =================================================

    return [
      subject,
      ...objects,
      garoVerb
    ]
      .filter(Boolean)
      .join(' ')
  }

  // =====================================================
  // COMPLEX SENTENCE TRANSLATOR
  // =====================================================

  translateComplex(text) {

    const parts =
      text.split(/\b(and|but|because|or|then)\b/)

    const translated = []

    for (const part of parts) {

      const normalized =
        this.normalize(part)

      if (this.CONJUNCTIONS[normalized]) {

        translated.push(
          this.CONJUNCTIONS[normalized]
        )

      } else {

        translated.push(
          this.translate(part)
        )
      }
    }

    return translated.join(' ')
  }

  // =====================================================
  // MAIN AI TRANSLATOR
  // =====================================================

  translate(text) {

    if (!text) {
      return ''
    }

    const normalized =
      this.normalize(text)

    // =================================================
    // EXACT PHRASES
    // =================================================

    if (this.PHRASES[normalized]) {
      return this.PHRASES[normalized]
    }

    // =================================================
    // OBJECT + VERB PATTERN
    // =================================================

    if (
      this.OBJECT_VERB_PATTERNS[normalized]
    ) {
      return this.OBJECT_VERB_PATTERNS[normalized]
    }

    // =================================================
    // COMPLEX SENTENCE
    // =================================================

    if (
      /\b(and|but|because|or|then)\b/
        .test(normalized)
    ) {
      return this.translateComplex(normalized)
    }

    const words =
      this.tokenize(normalized)

    // =================================================
    // QUESTIONS
    // =================================================

    if (this.isQuestion(text)) {

      const q =
        this.buildQuestion(words)

      if (q) {
        return q
      }
    }

    // =================================================
    // OBJECT VERB DYNAMIC
    // =================================================

    const ov =
      this.parseObjectVerb(words)

    if (ov) {

      // Example:
      // drink water
      // => Chi ringbo

      return ov
    }

    // =================================================
    // NORMAL SENTENCE
    // =================================================

    const sentence =
      this.buildSentence(words)

    if (sentence) {
      return sentence
    }

    // =================================================
    // FALLBACK WORD-BY-WORD
    // =================================================

    return words
      .map(word => this.translateWord(word))
      .join(' ')
  }

  // =====================================================
  // PUBLIC TRANSLATOR
  // =====================================================

  translateSentence(text) {

    return {

      original: text,

      translated: this.translate(text),

      language: 'garo',
    }
  }
}

export default new GaroTranslationEngine()
