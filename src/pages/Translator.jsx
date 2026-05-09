import React, { useState, useEffect } from 'react'
import translationEngine from '../translationEngine'

export default function Translator() {
  const [inputText, setInputText] = useState('')
  const [inputLang, setInputLang] = useState('en')
  const [outputLang, setOutputLang] = useState('garo')
  const [result, setResult] = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [grammar, setGrammar] = useState(null)

  // Real-time translation
  useEffect(() => {
    if (!inputText.trim()) {
      setResult(null)
      setBreakdown([])
      setGrammar(null)
      return
    }

    // Perform translation
    const translationResult = translationEngine.translateSentence(
      inputText,
      inputLang,
      outputLang
    )
    setResult(translationResult)
    setBreakdown(translationResult.breakdown || [])

    // Analyze grammar
    const grammarAnalysis = translationEngine.analyzeGrammar(inputText, inputLang)
    setGrammar(grammarAnalysis)
  }, [inputText, inputLang, outputLang])

  const examples = [
    { en: 'I am eating rice', garo: 'Anga mi cha·enga' },
    { en: 'I went to see the doctor', garo: 'Anga doctorko ni·china re·angaha' },
    { en: 'two chickens', garo: 'Mang Gni Do·o' },
    { en: 'How are you?', garo: 'Na·a namengama?' },
  ]

  const handleExample = (example) => {
    if (inputLang === 'en') {
      setInputText(example.en)
    }
  }

  const swapLanguages = () => {
    if (inputLang !== outputLang) {
      setInputLang(outputLang)
      setOutputLang(inputLang)
    }
  }

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">🔄 Semantic Translator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time translation engine with grammar analysis and morphology detection
        </p>
      </div>

      {/* Main Translation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <label className="block text-sm font-bold mb-3">
            Input Language
            <select
              value={inputLang}
              onChange={(e) => setInputLang(e.target.value)}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English 🇬🇧</option>
              <option value="garo">Garo 🌍</option>
              <option value="hi">Hindi 🇮🇳</option>
            </select>
          </label>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type something to translate..."
            className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {inputText.length} characters
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <label className="block text-sm font-bold mb-3">
            Output Language
            <select
              value={outputLang}
              onChange={(e) => setOutputLang(e.target.value)}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="garo">Garo 🌍</option>
              <option value="en">English 🇬🇧</option>
              <option value="hi">Hindi 🇮🇳</option>
            </select>
          </label>

          <div className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white overflow-y-auto font-mono select-all">
            {result ? (
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {result.translated}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {result.original}
                </div>
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">Translation will appear here...</span>
            )}
          </div>

          <button
            onClick={swapLanguages}
            className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors font-medium"
          >
            ⇅ Swap Languages
          </button>
        </div>
      </div>

      {/* Word Breakdown */}
      {breakdown.length > 0 && (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4">📊 Word Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {inputLang === 'en' ? 'English' : 'Garo'}
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {inputLang === 'en' ? item.english : item.garo}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  → {item.garo || item.english}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Analysis */}
      {grammar && (grammar.morphology.length > 0 || grammar.numbers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {grammar.morphology.length > 0 && (
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4">📝 Morphology Analysis</h3>
              <div className="space-y-3">
                {grammar.morphology.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700"
                  >
                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                      {item.word}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Root: <span className="font-mono">{item.root}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Suffix: <span className="font-mono">{item.suffix}</span>
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold mt-1">
                      {item.tense}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grammar.numbers.length > 0 && (
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4">🔢 Numbers & Classifiers</h3>
              <div className="space-y-3">
                {grammar.numbers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700"
                  >
                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                      {item.word}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Value: {item.number}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">💡 Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExample(example)}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all cursor-pointer text-left"
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {example.en}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {example.garo}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
