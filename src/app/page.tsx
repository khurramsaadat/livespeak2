"use client";

import { useState } from "react";
import MicrophoneRecorder from "@/components/microphone-recorder";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRTL } from "@/lib/use-rtl";

export default function Home() {
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [copyFeedback, setCopyFeedback] = useState<{transcription: boolean, translation: boolean}>({transcription: false, translation: false});

  // Footer state variables
  const [currentDetectedLanguage, setCurrentDetectedLanguage] = useState("");
  const [isMixedLanguage, setIsMixedLanguage] = useState(false);
  const [languageSwitchCount, setLanguageSwitchCount] = useState(0);
  const [lastLanguageSwitch, setLastLanguageSwitch] = useState<{from: string, to: string, confidence: number} | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(50);
  const [lastError, setLastError] = useState<string | null>(null);

  // RTL and language-specific styling
  const rtlConfig = useRTL(sourceLanguage);

  const handleTranscriptionUpdate = (newSegment: string, isFinal: boolean) => {
    if (isFinal) {
      setTranscription(newSegment);
      setInterimTranscription("");
    } else {
      setInterimTranscription(newSegment);
    }
  };

  const handleClearTranscription = () => {
    setTranscription("");
    setInterimTranscription("");
  };

  const handleCopyText = (text: string, type: 'transcription' | 'translation') => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyFeedback(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  // Helper functions for footer
  const getLanguageConfig = (lang: string) => {
    const configs = {
      'en': { dialect: 'English (US)', maxAlternatives: 4 },
      'ar': { dialect: 'Palestinian Arabic', maxAlternatives: 4 },
      'bn': { dialect: 'Standard Bengali', maxAlternatives: 4 }
    };
    return configs[lang as keyof typeof configs] || configs['en'];
  };

  const getLanguageCode = (lang: string) => {
    const codes = {
      'en': 'en-US',
      'ar': 'ar-PS',
      'bn': 'bn-BD'
    };
    return codes[lang as keyof typeof codes] || 'en-US';
  };

  const resetAndRetry = () => {
    setRetryCount(0);
    setLastError(null);
    // Additional reset logic can be added here
  };

  // Update footer state from microphone recorder
  const handleFooterStateUpdate = (updates: {
    currentDetectedLanguage?: string;
    isMixedLanguage?: boolean;
    languageSwitchCount?: number;
    lastLanguageSwitch?: {from: string, to: string, confidence: number} | null;
    retryCount?: number;
    lastError?: string | null;
  }) => {
    if (updates.currentDetectedLanguage !== undefined) setCurrentDetectedLanguage(updates.currentDetectedLanguage);
    if (updates.isMixedLanguage !== undefined) setIsMixedLanguage(updates.isMixedLanguage);
    if (updates.languageSwitchCount !== undefined) setLanguageSwitchCount(updates.languageSwitchCount);
    if (updates.lastLanguageSwitch !== undefined) setLastLanguageSwitch(updates.lastLanguageSwitch);
    if (updates.retryCount !== undefined) setRetryCount(updates.retryCount);
    if (updates.lastError !== undefined) setLastError(updates.lastError);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${rtlConfig.fontFamily}`} dir={rtlConfig.direction}>
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'flex-row-reverse' : 'justify-between'}`}>
            <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className={`text-${rtlConfig.textAlign}`}>
                <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${rtlConfig.textSize}`}>
                  LiveSpeak
                </h1>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${rtlConfig.textSize}`}>Real-time Speech Recognition</p>
              </div>
            </div>
            <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm text-gray-600 dark:text-gray-400 ${rtlConfig.textSize}`}>Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 ${rtlConfig.direction === 'rtl' ? 'rtl' : ''}`}>
          {/* Transcription Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <CardTitle className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className={`text-sm ${rtlConfig.textSize}`}>Live Transcription</span>
                </CardTitle>
                {transcription && (
                  <button
                    onClick={handleClearTranscription}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-full flex items-center justify-center">
                  {interimTranscription ? (
                    <div className={`text-center ${rtlConfig.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center justify-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'} mb-3`}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className={`text-sm text-gray-700 dark:text-gray-300 italic ${rtlConfig.textSize} ${rtlConfig.lineHeight}`}>
                        {interimTranscription}
                      </p>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-2 ${rtlConfig.textSize}`}>Listening...</p>
                    </div>
                  ) : transcription ? (
                    <div className={`text-center ${rtlConfig.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className={`text-sm text-gray-900 dark:text-gray-100 ${rtlConfig.textSize} ${rtlConfig.lineHeight} ${rtlConfig.letterSpacing}`}>
                        {transcription}
                      </p>
                      <button
                        onClick={() => handleCopyText(transcription, 'transcription')}
                        className="mt-3 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors flex items-center space-x-1 mx-auto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Text</span>
                      </button>
                      {copyFeedback.transcription && (
                        <p className="text-xs text-green-500 mt-2">Copied!</p>
                      )}
                    </div>
                  ) : (
                    <div className={`text-center ${rtlConfig.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className={`text-gray-500 dark:text-gray-400 ${rtlConfig.textSize} ${rtlConfig.lineHeight}`}>Start speaking to see transcription</p>
                      <p className={`text-gray-400 dark:text-gray-500 text-xs mt-1 ${rtlConfig.textSize}`}>Click the record button below</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span className={`text-sm ${rtlConfig.textSize}`}>Translation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-full flex items-center justify-center">
                  {translation ? (
                    <div className={`text-center ${rtlConfig.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                        </svg>
                      </div>
                      <p className={`text-sm text-gray-900 dark:text-gray-100 ${rtlConfig.textSize} ${rtlConfig.lineHeight} ${rtlConfig.letterSpacing}`}>
                        {translation}
                      </p>
                      <button
                        onClick={() => handleCopyText(translation, 'translation')}
                        className="mt-3 text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md transition-colors flex items-center space-x-1 mx-auto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Text</span>
                      </button>
                      {copyFeedback.translation && (
                        <p className="text-xs text-green-500 mt-2">Copied!</p>
                      )}
                    </div>
                  ) : (
                    <div className={`text-center ${rtlConfig.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                        </svg>
                      </div>
                      <p className={`text-gray-500 dark:text-gray-400 ${rtlConfig.textSize} ${rtlConfig.lineHeight}`}>Translation will appear here</p>
                      <p className={`text-gray-400 dark:text-gray-500 text-xs mt-1 ${rtlConfig.textSize}`}>After you start speaking</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Settings */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${rtlConfig.direction === 'rtl' ? 'rtl' : ''}`}>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span className={rtlConfig.textSize}>Source Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">US</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">English</span>
                        <span className="text-xs text-gray-500">English (US)</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ar">
                    <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="w-6 h-4 bg-gradient-to-r from-green-600 to-white to-black rounded-sm flex items-center justify-center">
                        <span className="text-xs">🇸🇦</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">العربية</span>
                        <span className="text-xs text-gray-500">Arabic</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span className={rtlConfig.textSize}>Target Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">US</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">English</span>
                        <span className="text-xs text-gray-500">English (US)</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ar">
                    <div className={`flex items-center ${rtlConfig.direction === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="w-6 h-4 bg-gradient-to-r from-green-600 to-white to-black rounded-sm flex items-center justify-center">
                        <span className="text-xs">🇸🇦</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">العربية</span>
                        <span className="text-xs text-gray-500">Arabic</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Microphone Recorder */}
        <div className="flex justify-center">
          <MicrophoneRecorder
            onTranscription={handleTranscriptionUpdate}
            onTranslation={setTranslation}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            targetLanguage={targetLanguage}
            sourceLanguage={sourceLanguage}
            onClearTranscription={handleClearTranscription}
            onFooterStateUpdate={handleFooterStateUpdate}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        isRecording={isRecording}
        currentDetectedLanguage={currentDetectedLanguage}
        isMixedLanguage={isMixedLanguage}
        languageSwitchCount={languageSwitchCount}
        lastLanguageSwitch={lastLanguageSwitch}
        retryCount={retryCount}
        maxRetries={maxRetries}
        lastError={lastError}
        getLanguageConfig={getLanguageConfig}
        getLanguageCode={getLanguageCode}
        resetAndRetry={resetAndRetry}
      />
    </div>
  );
}
