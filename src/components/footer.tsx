import React from 'react';

interface FooterProps {
  sourceLanguage: string;
  targetLanguage: string;
  isRecording: boolean;
  currentDetectedLanguage: string;
  isMixedLanguage: boolean;
  languageSwitchCount: number;
  lastLanguageSwitch: {from: string, to: string, confidence: number} | null;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  getLanguageConfig: (lang: string) => { dialect: string; maxAlternatives: number };
  getLanguageCode: (lang: string) => string;
  resetAndRetry: () => void;
}

export default function Footer({
  sourceLanguage,
  targetLanguage,
  isRecording,
  currentDetectedLanguage,
  isMixedLanguage,
  languageSwitchCount,
  lastLanguageSwitch,
  retryCount,
  maxRetries,
  lastError,
  getLanguageConfig,
  getLanguageCode,
  resetAndRetry
}: FooterProps) {
  return (
    <footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Enhanced Features Panel */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Enhanced Features
                </p>
                <div className="mt-2 text-xs text-green-700 dark:text-green-300 space-y-1">
                  <p>✓ <span className="font-medium">Dialect Support</span>: {getLanguageConfig(sourceLanguage).dialect}</p>
                  <p>✓ <span className="font-medium">Confidence Tracking</span>: Real-time accuracy monitoring</p>
                  <p>✓ <span className="font-medium">Fallback System</span>: Automatic dialect switching</p>
                  <p>✓ <span className="font-medium">Enhanced Alternatives</span>: {getLanguageConfig(sourceLanguage).maxAlternatives} recognition options</p>
                  <p>✓ <span className="font-medium">Auto-Restart</span>: Continuous recording without stopping</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition Status Panel */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Recognition Status
                </p>
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p>Current Language: <span className="font-medium">
                    {sourceLanguage === 'ar' ? 'العربية (Arabic)' : sourceLanguage === 'bn' ? 'বাংলা (Bengali)' : 'English (US)'}
                  </span></p>
                  <p>Dialect: <span className="font-medium text-blue-600">{getLanguageConfig(sourceLanguage).dialect}</span></p>
                  <p>Language Code: <span className="font-medium">{getLanguageCode(sourceLanguage)}</span></p>
                  <p>Max Alternatives: <span className="font-medium">{getLanguageConfig(sourceLanguage).maxAlternatives}</span></p>
                  <p>Retry Count: <span className="font-medium">{retryCount}/{maxRetries}</span></p>
                  {lastError && (
                    <p className="text-red-600 dark:text-red-400">Last Error: {lastError}</p>
                  )}
                </div>
                
                {/* Reset Button */}
                {retryCount >= maxRetries && (
                  <button
                    onClick={resetAndRetry}
                    className="mt-3 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    Reset & Try Again
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cross-Language Recognition Panel */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9l-9-9m9 9l9-9" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Cross-Language Recognition
                </p>
                <div className="mt-2 text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <p>🌍 <span className="font-medium">Detected Language</span>: <span className="font-medium text-purple-600">
                    {currentDetectedLanguage ? 
                      (currentDetectedLanguage === 'arabic' ? 'العربية (Arabic)' : 
                       currentDetectedLanguage === 'bengali' ? 'বাংলা (Bengali)' : 
                       currentDetectedLanguage === 'english' ? 'English' : 
                       currentDetectedLanguage === 'unknown' ? 'Unknown' : currentDetectedLanguage)
                    : 'Not detected yet'}
                  </span></p>
                  <p>🔀 <span className="font-medium">Mixed Language</span>: <span className="font-medium text-purple-600">
                    {isMixedLanguage ? 'Yes - Multiple languages detected' : 'No - Single language'}
                  </span></p>
                  <p>🔄 <span className="font-medium">Language Switches</span>: <span className="font-medium text-purple-600">
                    {languageSwitchCount} detected
                  </span></p>
                  {lastLanguageSwitch && (
                    <p>📊 <span className="font-medium">Last Switch</span>: <span className="font-medium text-purple-600">
                      {lastLanguageSwitch.from} → {lastLanguageSwitch.to} ({lastLanguageSwitch.confidence.toFixed(1)}% confidence)
                    </span></p>
                  )}
                  <p>⚡ <span className="font-medium">Status</span>: <span className="font-medium text-purple-600">
                    {isRecording ? 'Active - Monitoring for language changes' : 'Inactive - Start recording to enable'}
                  </span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Translation System Enhancement Panel */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Translation System Enhancement
                </p>
                <div className="mt-2 text-xs text-orange-700 dark:text-orange-300 space-y-1">
                  <p>🌍 <span className="font-medium">Source Language</span>: <span className="font-medium text-orange-600">
                    {sourceLanguage === 'ar' ? 'العربية (Arabic)' : sourceLanguage === 'bn' ? 'বাংলা (Bengali)' : 'English (US)'}
                  </span></p>
                  <p>🎯 <span className="font-medium">Target Language</span>: <span className="font-medium text-orange-600">
                    {targetLanguage === 'ar' ? 'العربية (Arabic)' : targetLanguage === 'bn' ? 'বাংলা (Bengali)' : 'English (US)'}
                  </span></p>
                  <p>📚 <span className="font-medium">Translation Dictionary</span>: <span className="font-medium text-orange-600">
                    {sourceLanguage !== targetLanguage ? 'Enhanced with cultural context' : 'No translation needed'}
                  </span></p>
                  <p>🔤 <span className="font-medium">Vocabulary Coverage</span>: <span className="font-medium text-orange-600">
                    {sourceLanguage !== targetLanguage ? 'Greetings, phrases, tech terms, numbers' : 'N/A'}
                  </span></p>
                  <p>⚡ <span className="font-medium">Translation Engine</span>: <span className="font-medium text-orange-600">
                    {sourceLanguage !== targetLanguage ? 'Word-by-word + cultural context' : 'Direct display'}
                  </span></p>
                  <p>🎨 <span className="font-medium">Cultural Context</span>: <span className="font-medium text-orange-600">
                    {sourceLanguage !== targetLanguage ? 'Regional greetings & expressions' : 'N/A'}
                  </span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credits */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 LiveSpeak - Professional Real-time Speech Recognition & Translation Platform
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Built with Next.js 15.5.0 • Enhanced with Cross-Language Recognition • Powered by Web Speech API
          </p>
        </div>
      </div>
    </footer>
  );
}
