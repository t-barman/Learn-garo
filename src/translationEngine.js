import garoDictionary from '../garo_dictionary.json'

/**
 * Semantic Translation Engine for Garo Language
 * Handles morphology, classifiers, fuzzy matching, and semantic understanding
 */

class GaroTranslationEngine {
  constructor() {
    // Build indexes from dictionary
    this.dictionary = garoDictionary
    this.englishToGaro = {}
    this.garoToEnglish = {}
    this.englishToHindi = {}
    this.hindiToGaro = {}
    
    this.buildIndexes()
  }

  buildIndexes() {
    // Extract all vocabulary entries
    Object.keys(this.dictionary).forEach(category => {
      const section = this.dictionary[category]
      if (!section || typeof section !== 'object') return

      // Skip meta and special sections
      if (category.startsWith('_') || category === '_meta') return

      // Process each entry in the category
      Object.entries(section).forEach(([key, value]) => {
        if (key.startsWith('_')) return

        const english = key.toLowerCase().trim()
        const garo = String(value).toLowerCase().trim()

        // Build bidirectional indexes
        if (english && garo) {
          this.englishToGaro[english] = {
            garo,
            category,
            priority: 'exact'
          }
          this.garoToEnglish[garo] = {
            english,
            category,
            priority: 'exact'
          }
        }
      })
    })
  }

  /**
   * Normalize text for matching
   */
  normalize(text) {
    if (!text) return ''
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[-]/g, ' ')
      .replace(/[.,!?;:]/g, '')
  }

  /**
   * Split text into words/tokens
   */
  tokenize(text) {
    return this.normalize(text).split(/\s+/).filter(t => t.length > 0)
  }

  /**
   * Find closest matching word (fuzzy matching)
   */
  fuzzyMatch(word, dictionary) {
    const normalized = this.normalize(word)
    if (dictionary[normalized]) return dictionary[normalized]

    // Try partial matches
    const keys = Object.keys(dictionary)
    for (const key of keys) {
      if (key.includes(normalized) || normalized.includes(key)) {
        if (key.length > 2 && normalized.length > 2) {
          return dictionary[key]
        }
      }
    }

    return null
  }

  /**
   * Detect morphology - extract root and affixes
   */
  detectMorphology(word) {
    // Common Garo verb suffixes
    const verbSuffixes = {
      'enga': 'present continuous',
      'aha': 'past tense',
      'gen': 'future tense',
    }

    word = word.toLowerCase()

    for (const [suffix, tense] of Object.entries(verbSuffixes)) {
      if (word.endsWith(suffix)) {
        const root = word.slice(0, -suffix.length)
        return {
          root,
          suffix,
          tense,
          morpheme: suffix
        }
      }
    }

    return { root: word, suffix: null, tense: null }
  }

  /**
   * Detect number and classifier
   */
  detectNumber(word) {
    const numbers = {
      'sa': 1, 'gni': 2, 'gittam': 3, 'bri': 4, 'bonga': 5,
      'dok': 6, 'sni': 7, 'chet': 8, 'sku': 9, 'chiking': 10,
      'kolgrik': 20, 'kolatchi': 30, 'sotbri': 40, 'sotbonga': 50,
      'sotdok': 60, 'sotsni': 70, 'sotchet': 80, 'sotsku': 90,
      'ritchasa': 100, 'hajalsa': 1000
    }

    word = word.toLowerCase()
    
    for (const [numWord, value] of Object.entries(numbers)) {
      if (word.includes(numWord)) {
        return { number: value, word: numWord, numeric: true }
      }
    }

    return { number: null, numeric: false }
  }

  /**
   * Detect classifier for a noun category
   */
  getClassifier(english, category) {
    const classifierMap = {
      'animals': 'Mang',
      'birds': 'Mang',
      'insects_and_aquatic': 'Mang',
      'family_members': 'Sak',
      'occupations': 'Sak',
      'social_people': 'Sak',
      'education': 'King',
      'household_items': 'Ge',
      'clothing_and_wearables': 'Ge',
      'kitchen_and_cooking': 'Ge',
      'at_the_market': 'Gong',
    }

    return classifierMap[category] || null
  }

  /**
   * Generate dynamic numbers
   */
  generateNumber(num) {
    const baseNumbers = {
      1: 'Sa', 2: 'Gni', 3: 'Gittam', 4: 'Bri', 5: 'Bonga',
      6: 'Dok', 7: 'Sni', 8: 'Chet', 9: 'Sku', 10: 'Chiking'
    }

    const tens = {
      20: 'Kolgrik', 30: 'Kolatchi', 40: 'Sotbri', 50: 'Sotbonga',
      60: 'Sotdok', 70: 'Sotsni', 80: 'Sotchet', 90: 'Sotsku'
    }

    const hundreds = {
      100: 'Ritchasa',
      1000: 'Hajalsa'
    }

    if (num <= 10) return baseNumbers[num] || String(num)
    if (num <= 90) {
      const tenVal = Math.floor(num / 10) * 10
      const oneVal = num % 10
      if (oneVal === 0) return tens[tenVal]
      return `${tens[tenVal]}-${baseNumbers[oneVal]}`
    }
    if (num <= 1000) {
      const hunVal = Math.floor(num / 100)
      const remainder = num % 100
      const hun = hunVal === 1 ? 'Ritchasa' : `${baseNumbers[hunVal]}-Ritchasa`
      if (remainder === 0) return hun
      return `${hun}-${this.generateNumber(remainder)}`
    }

    return String(num)
  }

  /**
   * Translate single word
   */
  translateWord(word, fromLang = 'en', toLang = 'garo') {
    const normalized = this.normalize(word)
    let result = null

    if (fromLang === 'en' && toLang === 'garo') {
      result = this.englishToGaro[normalized] || this.fuzzyMatch(normalized, this.englishToGaro)
    } else if (fromLang === 'garo' && toLang === 'en') {
      result = this.garoToEnglish[normalized] || this.fuzzyMatch(normalized, this.garoToEnglish)
    }

    return result
  }

  /**
   * Translate sentence with semantic understanding
   */
  translateSentence(text, fromLang = 'en', toLang = 'garo') {
    const tokens = this.tokenize(text)
    if (tokens.length === 0) return ''

    const translations = []
    const breakdown = []

    tokens.forEach(token => {
      const result = this.translateWord(token, fromLang, toLang)
      
      if (result) {
        if (toLang === 'garo') {
          translations.push(result.garo)
          breakdown.push({
            english: token,
            garo: result.garo,
            category: result.category
          })
        } else {
          translations.push(result.english)
          breakdown.push({
            garo: token,
            english: result.english,
            category: result.category
          })
        }
      } else {
        // Unknown word - keep original
        translations.push(token)
        breakdown.push({
          english: fromLang === 'en' ? token : '?',
          garo: fromLang === 'garo' ? token : '?',
          category: 'unknown'
        })
      }
    })

    return {
      original: text,
      translated: translations.join(' '),
      breakdown,
      language: toLang
    }
  }

  /**
   * Get all vocabulary in a category
   */
  getCategoryVocabulary(category) {
    const section = this.dictionary[category]
    if (!section) return []

    const results = []
    Object.entries(section).forEach(([english, garo]) => {
      if (!english.startsWith('_')) {
        results.push({
          english,
          garo: String(garo),
          category
        })
      }
    })

    return results
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return Object.keys(this.dictionary).filter(k => !k.startsWith('_'))
  }

  /**
   * Search vocabulary
   */
  searchVocabulary(query, language = 'all') {
    const normalized = this.normalize(query)
    const results = []

    Object.keys(this.dictionary).forEach(category => {
      if (category.startsWith('_')) return

      const section = this.dictionary[category]
      Object.entries(section).forEach(([english, garo]) => {
        if (english.startsWith('_')) return

        const eng = english.toLowerCase()
        const gar = String(garo).toLowerCase()

        if (language === 'all' || language === 'english') {
          if (eng.includes(normalized)) {
            results.push({
              english: english.toLowerCase(),
              garo: String(garo),
              category,
              matched: 'english'
            })
          }
        }

        if (language === 'all' || language === 'garo') {
          if (gar.includes(normalized)) {
            results.push({
              english: english.toLowerCase(),
              garo: String(garo),
              category,
              matched: 'garo'
            })
          }
        }
      })
    })

    return results
  }

  /**
   * Analyze grammar structure
   */
  analyzeGrammar(sentence, language = 'en') {
    const tokens = this.tokenize(sentence)
    const analysis = {
      tokens,
      morphology: [],
      classifiers: [],
      numbers: [],
      tenses: []
    }

    tokens.forEach(token => {
      const morph = this.detectMorphology(token)
      if (morph.tense) {
        analysis.morphology.push({
          word: token,
          ...morph
        })
        analysis.tenses.push(morph.tense)
      }

      const num = this.detectNumber(token)
      if (num.numeric) {
        analysis.numbers.push({
          word: token,
          ...num
        })
      }
    })

    return analysis
  }
}

// Export singleton instance
export default new GaroTranslationEngine()
