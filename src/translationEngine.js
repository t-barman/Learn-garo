import garoDictionary from '../garo_dictionary.json'

/**
 * Semantic Translation Engine for Garo Language
 * Handles morphology, classifiers, fuzzy matching, and semantic understanding
 */

class GaroTranslationEngine {
  constructor() {
    // Phrase dictionary for common expressions (checked FIRST before word-by-word)
    this.phraseDictionary = {
      'hi': 'Salam',
      'hello': 'Salam',
      'hi how are you': 'Salam, Na·a namengama?',
      'hello how are you': 'Salam, Na·a namengama?',
      'how are you': 'Na·a namengama?',
      'how are you doing': 'Na·a namengama?',
      'good morning': 'Pringnam',
      'good night': 'Walnam',
      'good evening': 'Attamnam',
      'thank you': 'Mitela',
      'thanks': 'Mitela',
      'i am fine': 'Anga namengaba',
      'i am good': 'Anga namengaba',
      'what are you doing': 'Maidakenga?',
      'good day': 'Salnam',
      'have a nice day': "Nang·na namgipa sal ong·china",
      'i love you': 'Angna nang·na ka·sa',
      'where are you from': 'Na·ra banoni?',
      'i am sorry': 'Angko kema ka·pabo',
      'did you go to the market': 'Na·a bajalchi re·angama?',
      'did you eat': 'Na·a chiba?',
      'did you come': 'Na·a chamba?',
      'i went to the market': 'Anga bajalchi re·ang·a',
      'lets go': 'Chingna re·china',
      'let us go': 'Chingna re·china',
      'i': 'Anga',
      'you': 'Na·a',
      'they': 'Bisong',
      'good': 'Nama',
      'very good': 'Nambea',
      'beautiful': 'Nitoa',
      'rice': 'Mi',
      'water': 'Chi',
      'yes': 'Hae',
      'no': 'Daeh'
    }

    // Number mappings for counting
    this.NUMBERS = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    }

    // Classifier mappings - each classifier handles specific noun types
    this.CLASSIFIERS = {
      mang: ['animals', 'birds', 'fish', 'insects', 'chicken', 'hen', 'rooster', 'duck', 'cow', 'pig', 'goat', 'dog', 'cat'],
      sak: ['people', 'person', 'man', 'woman', 'boy', 'girl', 'child', 'teacher', 'doctor', 'father', 'mother', 'brother', 'sister'],
      gong: ['money', 'coin', 'currency', 'rupee', 'taka'],
      king: ['book', 'paper', 'leaf', 'page', 'letter', 'notebook'],
      ge: [] // general fallback
    }

    // Garo number words for classifier output
    this.garoNumbers = {
      1: 'sa', 2: 'gni', 3: 'gittam', 4: 'bri', 5: 'bonga',
      6: 'dok', 7: 'sni', 8: 'chet', 9: 'sku', 10: 'chiking'
    }

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
        
        // Handle new trilingual format: value is an object with garo and hindi properties
        let garo = ''
        let hindi = ''
        
        if (typeof value === 'object' && value !== null) {
          garo = (value.garo || '').toLowerCase().trim()
          hindi = (value.hindi || '').toLowerCase().trim()
        } else {
          // Handle old simple string format
          garo = String(value).toLowerCase().trim()
        }

        // Build indices
        if (english && garo) {
          this.englishToGaro[english] = {
            garo,
            hindi,
            category,
            priority: 'exact'
          }
          this.garoToEnglish[garo] = {
            english,
            hindi,
            category,
            priority: 'exact'
          }
          if (hindi) {
            this.englishToHindi[english] = {
              hindi,
              garo,
              category,
              priority: 'exact'
            }
            this.hindiToGaro[hindi] = {
              garo,
              english,
              category,
              priority: 'exact'
            }
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
   * Get classifier for a noun based on category
   */
  getClassifierForNoun(englishNoun) {
    const nounLower = englishNoun.toLowerCase()
    for (const [classifier, words] of Object.entries(this.CLASSIFIERS)) {
      if (words.includes(nounLower)) {
        return classifier
      }
    }
    return 'ge' // default fallback classifier
  }

  /**
   * Count a noun with proper classifier and word order
   * Word order in Garo: NOUN + CLASSIFIER-NUMBER
   */
  countNoun(garoNoun, englishNoun, count) {
    const number = this.garoNumbers[count]
    if (!number) return `${garoNoun} (number out of range 1-10)`
    const classifier = this.getClassifierForNoun(englishNoun)
    return `${garoNoun} ${classifier}-${number}`
  }

  /**
   * Detect if a text contains a number word followed by a noun
   * Returns {hasNumber: bool, count: number, nounStartIndex: number}
   */
  detectNumberPhrase(words) {
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i].toLowerCase()
      if (this.NUMBERS[word]) {
        return {
          hasNumber: true,
          count: this.NUMBERS[word],
          numberIndex: i,
          nounIndex: i + 1
        }
      }
    }
    return { hasNumber: false }
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
   * Translate using phrase-first sliding window approach
   * Checks phrases FIRST (3-word, 2-word) before falling back to word-by-word
   */
  translateWithPhrases(text, fromLang = 'en', toLang = 'garo') {
    const lower = text.toLowerCase().trim()
    
    // Only do phrase matching for English to Garo
    if (fromLang === 'en' && toLang === 'garo') {
      // Check exact phrase match first
      if (this.phraseDictionary[lower]) {
        return this.phraseDictionary[lower]
      }

      // Sliding window: 3-word, 2-word, then 1-word
      const words = lower.split(/\s+/)
      const result = []
      let i = 0

      while (i < words.length) {
        const three = words.slice(i, i + 3).join(' ')
        const two = words.slice(i, i + 2).join(' ')
        const one = words[i]

        // Check number + noun pattern first
        if (i + 1 < words.length && this.NUMBERS[one]) {
          const noun = words[i + 1]
          const nounTranslation = this.translateWord(noun, fromLang, toLang)
          if (nounTranslation) {
            result.push(this.countNoun(nounTranslation.garo, noun, this.NUMBERS[one]))
            i += 2
            continue
          }
        }

        // Try phrase matching with sliding window
        if (this.phraseDictionary[three]) {
          result.push(this.phraseDictionary[three])
          i += 3
        } else if (this.phraseDictionary[two]) {
          result.push(this.phraseDictionary[two])
          i += 2
        } else if (this.phraseDictionary[one]) {
          result.push(this.phraseDictionary[one])
          i += 1
        } else {
          // Fallback to dictionary word-by-word lookup
          const translation = this.translateWord(one, fromLang, toLang)
          result.push(translation ? translation.garo : one)
          i += 1
        }
      }

      return result.join(' ')
    }

    // For non-English or non-Garo, fall back to word-by-word
    return this.translateSentenceWordByWord(text, fromLang, toLang).translated
  }

  /**
   * Translate sentence word-by-word (fallback)
   */
  translateSentenceWordByWord(text, fromLang = 'en', toLang = 'garo') {
    const tokens = this.tokenize(text)
    if (tokens.length === 0) return { original: text, translated: '', breakdown: [] }

    const translations = []
    const breakdown = []

    tokens.forEach((token, idx) => {
      // Check for number + noun pattern
      if (fromLang === 'en' && this.NUMBERS[token.toLowerCase()] && idx + 1 < tokens.length) {
        const count = this.NUMBERS[token.toLowerCase()]
        const noun = tokens[idx + 1]
        const nounTranslation = this.translateWord(noun, fromLang, toLang)
        if (nounTranslation) {
          const counted = this.countNoun(nounTranslation.garo, noun, count)
          translations.push(counted)
          breakdown.push({
            english: `${token} ${noun}`,
            garo: counted,
            category: nounTranslation.category
          })
          return // Skip next iteration since we processed the noun
        }
      }

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
   * Translate sentence with phrase-first approach
   */
  translateSentence(text, fromLang = 'en', toLang = 'garo') {
    try {
      const translated = this.translateWithPhrases(text, fromLang, toLang)
      const breakdown = []
      
      // Build breakdown for display
      const tokens = this.tokenize(text)
      tokens.forEach(token => {
        const result = this.translateWord(token, fromLang, toLang)
        if (result) {
          if (toLang === 'garo') {
            breakdown.push({
              english: token,
              garo: result.garo,
              category: result.category
            })
          }
        }
      })

      return {
        original: text,
        translated,
        breakdown,
        language: toLang
      }
    } catch (error) {
      console.error('Translation error:', error)
      return {
        original: text,
        translated: '',
        breakdown: [],
        language: toLang,
        error: 'Translation failed'
      }
    }
  }

  /**
   * Get all vocabulary in a category
   */
  getCategoryVocabulary(category) {
    const section = this.dictionary[category]
    if (!section) return []

    const results = []
    Object.entries(section).forEach(([english, value]) => {
      if (!english.startsWith('_')) {
        let garo = ''
        let hindi = ''
        
        if (typeof value === 'object' && value !== null) {
          garo = value.garo || ''
          hindi = value.hindi || ''
        } else {
          garo = String(value)
        }
        
        results.push({
          english,
          garo,
          hindi,
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
      Object.entries(section).forEach(([english, value]) => {
        if (english.startsWith('_')) return

        let garo = ''
        let hindi = ''
        
        if (typeof value === 'object' && value !== null) {
          garo = value.garo || ''
          hindi = value.hindi || ''
        } else {
          garo = String(value)
        }

        const eng = english.toLowerCase()
        const gar = garo.toLowerCase()

        if (language === 'all' || language === 'english') {
          if (eng.includes(normalized)) {
            results.push({
              english: english.toLowerCase(),
              garo,
              hindi,
              category,
              matched: 'english'
            })
          }
        }

        if (language === 'all' || language === 'garo') {
          if (gar.includes(normalized)) {
            results.push({
              english: english.toLowerCase(),
              garo,
              hindi,
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
