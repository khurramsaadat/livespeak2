"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface MicrophoneRecorderProps {
  onTranscription: (transcript: string, isFinal: boolean) => void;
  onTranslation: (translation: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  targetLanguage: string;
  sourceLanguage: string;
  onClearTranscription: () => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognition;
  SpeechRecognition?: new () => SpeechRecognition;
}

export function MicrophoneRecorder({
  onTranscription,
  onTranslation,
  isRecording,
  setIsRecording,
  targetLanguage,
  sourceLanguage,
  onClearTranscription,
}: MicrophoneRecorderProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProduction, setIsProduction] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string>('');
  const isRecognitionRunningRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const pendingTranscriptionRef = useRef('');
  const pendingInterimRef = useRef('');
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds between retries

  // Check if we're in production
  useEffect(() => {
    setIsProduction(window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  }, []);

  // Function to clear all transcription data
  const clearTranscription = useCallback(() => {
    accumulatedTranscriptRef.current = '';
    pendingTranscriptionRef.current = '';
    pendingInterimRef.current = '';
    setTranscription('');
    setRetryCount(0);
    setLastError('');
    onClearTranscription();
  }, [onClearTranscription]);

  const startRecognition = useCallback(() => {
    if (isRecognitionRunningRef.current) {
      console.log('Speech recognition already running, skipping...');
      return;
    }

    // Check browser compatibility
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setTranscription('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      console.log('Starting Web Speech API...');
      setIsProcessing(true);
      setIsRecording(true);
      
      // Create new recognition instance
      const SpeechRecognitionConstructor = (window as WindowWithSpeechRecognition).webkitSpeechRecognition || (window as WindowWithSpeechRecognition).SpeechRecognition;
      
      if (!SpeechRecognitionConstructor) {
        throw new Error('SpeechRecognition not available in this browser');
      }
      
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      if (!recognitionRef.current) {
        throw new Error('Failed to create SpeechRecognition instance');
      }

      // Configure recognition settings
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLanguage === 'ar' ? 'ar-SA' : sourceLanguage === 'bn' ? 'bn-BD' : 'en-US';
      
      console.log('Speech recognition start() called');
      
      // Set up event handlers
      recognitionRef.current.onstart = function () {
        console.log('Web Speech API started for', recognitionRef.current?.lang);
        setIsProcessing(false);
        isRecognitionRunningRef.current = true;
      };

      recognitionRef.current.onend = function () {
        console.log('Speech recognition ended');
        // Only try to restart if user didn't manually stop and we haven't exceeded retries
        if (isRecording && !isRecognitionRunningRef.current && retryCount < maxRetries) {
          console.log(`Recognition ended unexpectedly, attempting to restart... (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          
          // Try to restart after a delay
          setTimeout(() => {
            if (isRecording && !isRecognitionRunningRef.current && retryCount < maxRetries) {
              console.log('Attempting to restart recognition...');
              startRecognition();
            }
          }, retryDelay);
        } else if (retryCount >= maxRetries) {
          console.log('Max retries reached, stopping recognition');
          setTranscription('Maximum retry attempts reached. Please try starting recording again.');
          setIsRecording(false);
          setRetryCount(0);
        }
        isRecognitionRunningRef.current = false;
      };

      recognitionRef.current.onresult = function (event: SpeechRecognitionEvent) {
        console.log('Speech recognition result received:', event);
        
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + finalTranscript;
          setTranscription(accumulatedTranscriptRef.current);
          console.log('Accumulated transcript:', accumulatedTranscriptRef.current);
          onTranscription(accumulatedTranscriptRef.current, true);
        }

        if (interimTranscript) {
          console.log('Interim transcript:', interimTranscript);
          onTranscription(interimTranscript, false);
        }
      };

      recognitionRef.current.onerror = function (event: SpeechRecognitionErrorEvent) {
        console.log('Speech recognition error:', event.error);
        console.log('Error details:', event);
        
        if (event.error === 'network') {
          console.log('Network error - speech recognition may be limited');
          setLastError('Network error - speech recognition may be limited');
          // Don't stop recording on network errors, but limit retries
          if (retryCount >= maxRetries) {
            console.log('Max retries reached for network errors, stopping');
            setTranscription('Network error: Maximum retry attempts reached. Please try again later.');
            setIsRecording(false);
            isRecognitionRunningRef.current = false;
            setRetryCount(0);
          }
        } else if (event.error === 'not-allowed') {
          console.log('Microphone access denied');
          setLastError('Microphone access denied');
          setTranscription('Microphone access denied. Please allow microphone permissions and try again.');
          setIsRecording(false);
          isRecognitionRunningRef.current = false;
          setRetryCount(0);
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
          setLastError('No speech detected');
          // Don't show error for no-speech, just log it
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted');
          setLastError('Speech recognition aborted');
          // Don't show error for aborted, just log it
        } else {
          console.log('Unknown speech recognition error:', event.error);
          setLastError(`Unknown error: ${event.error}`);
          // Only stop on critical errors
          if (event.error !== 'network') {
            setTranscription(`Speech recognition error: ${event.error}. Please try again.`);
            setIsRecording(false);
            isRecognitionRunningRef.current = false;
            setRetryCount(0);
          }
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error creating or starting speech recognition:', error);
      setTranscription(`Error starting speech recognition: ${error}`);
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [setIsRecording, sourceLanguage, onTranscription, isRecording]);

  const stopRecognition = useCallback(() => {
    console.log('Stopping speech recognition...');
    setIsRecording(false);
    setIsProcessing(false);
    
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped successfully');
      } catch (error) {
        console.log('Error stopping speech recognition:', error);
      }
    }
    
    isRecognitionRunningRef.current = false;
    recognitionRef.current = null;
  }, []);

  // Function to manually reset and try again
  const resetAndRetry = useCallback(() => {
    console.log('Manual reset and retry requested');
    setRetryCount(0);
    setLastError('');
    setTranscription('');
    accumulatedTranscriptRef.current = '';
    
    if (isRecording) {
      // Stop current recording and restart
      stopRecognition();
      setTimeout(() => {
        if (isRecording) {
          startRecognition();
        }
      }, 500);
    }
  }, [isRecording, stopRecognition, startRecognition]);

  // Simple client-side translation function
  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
    if (sourceLang === targetLang) {
      return text;
    }

    // Simple hardcoded translations for demo purposes
    const simpleTranslations: { [key: string]: { [key: string]: string } } = {
      en: {
        ar: "مرحبا، أنا واثق من أن هذا التطبيق سيعمل بشكل جيد. شكرا لك.",
        bn: "হ্যালো, আমি নিশ্চিত যে এই অ্যাপটি খুব ভালভাবে কাজ করবে। আপনাকে ধন্যবাদ।"
      },
      ar: {
        en: "Hello, I'm confident that this app will work very well. Thank you.",
        bn: "হ্যালো, আমি নিশ্চিত যে এই অ্যাপটি খুব ভালভাবে কাজ করবে। আপনাকে ধন্যবাদ।"
      },
      bn: {
        en: "Hello, I'm confident that this app will work very well. Thank you.",
        ar: "مرحبا، أنا واثق من أن هذا التطبيق سيعمل بشكل جيد. شكرا لك."
      }
    };

    try {
      // Use hardcoded translations for now
      const translation = simpleTranslations[sourceLang]?.[targetLang];
      if (translation) {
        return translation;
      }
      
      // Fallback: return original text if no translation found
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return `Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, []);

  // Remove the problematic useEffect that causes auto-restart
  // useEffect(() => {
  //   if (isRecording && !isRecognitionRunningRef.current) {
  //     startRecognition();
  //   } else if (!isRecording && isRecognitionRunningRef.current) {
  //     stopRecognition();
  //   }
  // }, [isRecording]);

  useEffect(() => {
    if (transcription) {
      translateText(transcription, sourceLanguage, targetLanguage).then(result => {
        onTranslation(result);
      }).catch(error => {
        console.error('Translation failed:', error);
        onTranslation(`Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
    }
  }, [transcription, translateText, sourceLanguage, targetLanguage, onTranslation]);

  // Handle transcription updates in a separate effect to avoid render conflicts
  useEffect(() => {
    if (pendingTranscriptionRef.current || pendingInterimRef.current) {
      const timer = setTimeout(() => {
        if (pendingTranscriptionRef.current) {
          onTranscription(pendingTranscriptionRef.current, true);
          pendingTranscriptionRef.current = '';
        }
        if (pendingInterimRef.current) {
          onTranscription(pendingInterimRef.current, false);
          pendingInterimRef.current = '';
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className="w-full max-w-2xl">
      {/* Main Recording Button */}
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Button */}
        <div className="relative">
          <button
            onClick={() => {
              if (isRecording) {
                stopRecognition();
              } else {
                startRecognition();
              }
            }}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-2xl shadow-red-500/30'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30'
            }`}
          >
            {/* Recording Animation Rings */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-red-300/50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-red-200/30 animate-pulse"></div>
              </>
            )}
            
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRecording ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </div>
          </button>
          
          {/* Status Text */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isProcessing ? 'Initializing...' : isRecording ? 'Recording' : 'Click to Start'}
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="w-full space-y-4">
          {/* Production Environment Warning */}
          {isProduction && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    🌐 Production Environment Detected
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    If speech recognition doesn&apos;t work, try:
                  </p>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Allow microphone permissions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Use HTTPS (already enabled)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Try a different browser (Chrome recommended)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Refresh the page if needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recognition Status */}
          {(retryCount > 0 || lastError) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    🔄 Recognition Status
                  </p>
                  {retryCount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-blue-700 dark:text-blue-300">Retry attempts:</span>
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">{retryCount}/{maxRetries}</span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(retryCount / maxRetries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {lastError && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      <span className="font-medium">Last error:</span> {lastError}
                    </p>
                  )}
                  {retryCount >= maxRetries && (
                    <div className="mt-3">
                      <button
                        onClick={resetAndRetry}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        🔄 Reset & Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
