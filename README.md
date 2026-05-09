# Language-translator

A local translator website for Garo, English, and Hindi.

This project includes:
- a React frontend with live text translation
- a local dictionary and sentence engine in `src/translator.js`
- support for English ↔ Garo, Hindi ↔ Garo, and English ↔ Hindi via Garo
- auto-detection for Latin-based English/Garo and Devanagari Hindi

## Run locally

1. `npm install`
2. `npm run dev`

## Build and serve

1. `npm run build`
2. `npm start`

Open the site in your browser and type a sentence in English, Hindi, or Garo.

## Extend dictionary

Add more words and phrases in `src/translator.js` to expand daily usage and sentence coverage.
