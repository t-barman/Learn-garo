/**
 * Garo classifier helpers and validation utilities.
 * This module keeps noun counting and phrase validation consistent.
 */

export const NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10
}

export const CLASSIFIERS = {
  mang: ['animals', 'birds', 'fish', 'insects', 'chicken', 'hen', 'rooster', 'duck', 'cow', 'pig', 'goat', 'dog', 'cat'],
  sak: ['people', 'person', 'man', 'woman', 'boy', 'girl', 'child', 'teacher', 'doctor', 'father', 'mother', 'brother', 'sister'],
  gong: ['money', 'coin', 'currency', 'rupee', 'taka'],
  king: ['book', 'paper', 'leaf', 'page', 'letter', 'notebook'],
  ge: []
}

export function getClassifierForNoun(englishNoun) {
  const nounLower = englishNoun.toLowerCase()
  for (const [classifier, words] of Object.entries(CLASSIFIERS)) {
    if (words.includes(nounLower)) {
      return classifier
    }
  }
  return 'ge'
}

export function countNoun(garoNoun, englishNoun, count) {
  const number = NUMBERS[count]
  if (!number) return `${garoNoun} (number out of range 1-10)`
  const classifier = getClassifierForNoun(englishNoun)
  return `${garoNoun} ${classifier}-${number}`
}

export function countNounWithClassifier(garoNoun, classifier, numberWord) {
  return `${garoNoun} ${classifier}-${numberWord}`
}

export function buildPhrase(garoWord, classifier, numberWord) {
  return `${garoWord} ${classifier}-${numberWord}`
}

export function validatePhrase(phrase) {
  const lower = phrase.trim().toLowerCase()
  return /^(?:[^\s]+)\s+(?:mang|sak|gong|king|ge)-(?:sa|gni|gittam|bri|bonga|dok|sni|chet|sku|chiking)$/.test(lower)
}
