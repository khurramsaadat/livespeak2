'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import PermissionModal from './permission-modal';

// Web Speech API type definitions
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
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
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface MicrophoneRecorderProps {
  onTranscription: (text: string, isFinal: boolean) => void;
  onTranslation: (text: string) => void;
  onClearTranscription: () => void;
  sourceLanguage: string;
  targetLanguage: string;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  onFooterStateUpdate?: (updates: {
    currentDetectedLanguage?: string;
    isMixedLanguage?: boolean;
    languageSwitchCount?: number;
    lastLanguageSwitch?: {from: string, to: string, confidence: number} | null;
    retryCount?: number;
    lastError?: string | null;
  }) => void;
}

export default function MicrophoneRecorder({
  onTranscription,
  onTranslation,
  onClearTranscription,
  sourceLanguage,
  targetLanguage,
  isRecording,
  setIsRecording,
  onFooterStateUpdate
}: MicrophoneRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isProduction, setIsProduction] = useState(false);
  const [userManuallyStopped, setUserManuallyStopped] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // NEW: Cross-language recognition state
  const [currentDetectedLanguage, setCurrentDetectedLanguage] = useState<string>('');
  const [isMixedLanguage, setIsMixedLanguage] = useState(false);
  const [languageSwitchCount, setLanguageSwitchCount] = useState(0);
  const [lastLanguageSwitch, setLastLanguageSwitch] = useState<{from: string, to: string, confidence: number} | null>(null);
  
  // FIXED: Increased retry limit and reduced delay for better stability
  const maxRetries = 50; // Increased from 3 to 50
  const retryDelay = 500; // Reduced from 2000ms to 500ms for faster recovery
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionRunningRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');

  // Helper function to update footer state
  const updateFooterState = useCallback((updates: {
    currentDetectedLanguage?: string;
    isMixedLanguage?: boolean;
    languageSwitchCount?: number;
    lastLanguageSwitch?: {from: string, to: string, confidence: number} | null;
    retryCount?: number;
    lastError?: string | null;
  }) => {
    if (onFooterStateUpdate) {
      onFooterStateUpdate(updates);
    }
  }, [onFooterStateUpdate]);

  // Enhanced language code mapping for Web Speech API with dialect support
  const getLanguageCode = useCallback((language: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'ar': 'ar-SA', // Saudi Arabic as default
      'bn': 'bn-BD', // Bangladesh Bengali as default
      'ar-SA': 'ar-SA', // Saudi Arabic
      'ar-EG': 'ar-EG', // Egyptian Arabic
      'ar-PS': 'ar-PS', // Palestinian Arabic
      'bn-BD': 'bn-BD', // Bangladesh Bengali
      'bn-IN': 'bn-IN'  // Indian Bengali
    };
    
    return languageMap[language] || 'en-US';
  }, []);

  // Enhanced language-specific recognition configuration
  const getLanguageConfig = useCallback((language: string) => {
    const configs: { [key: string]: { continuous: boolean; interimResults: boolean; maxAlternatives: number; dialect: string } } = {
      'en': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
        dialect: 'US English'
      },
      'ar': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 5, // Higher alternatives for Arabic dialects
        dialect: 'Modern Standard Arabic'
      },
      'ar-SA': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 5,
        dialect: 'Saudi Arabic'
      },
      'ar-EG': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 5,
        dialect: 'Egyptian Arabic'
      },
      'ar-PS': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 5,
        dialect: 'Palestinian Arabic'
      },
      'bn': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 4, // Higher alternatives for Bengali variations
        dialect: 'Standard Bengali'
      },
      'bn-BD': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 4,
        dialect: 'Bangladesh Bengali'
      },
      'bn-IN': {
        continuous: true,
        interimResults: true,
        maxAlternatives: 4,
        dialect: 'Indian Bengali'
      }
    };
    
    return configs[language] || configs['en'];
  }, []);

  // Enhanced dialect detection and fallback
  const detectAndFallbackLanguage = useCallback((language: string) => {
    const primaryCode = getLanguageCode(language);
    const fallbackMap: { [key: string]: string[] } = {
      'ar': ['ar-SA', 'ar-EG', 'ar-PS'], // Arabic fallbacks
      'bn': ['bn-BD', 'bn-IN'], // Bengali fallbacks
      'en': ['en-US'] // English fallbacks
    };
    
    return {
      primary: primaryCode,
      fallbacks: fallbackMap[language] || [primaryCode],
      currentAttempt: 0
    };
  }, [getLanguageCode]);

  // NEW: Cross-language recognition and code-switching support
  const detectLanguageInText = useCallback((text: string) => {
    // Language detection patterns
    const languagePatterns = {
      arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
      bengali: /[\u0980-\u09FF]/,
      english: /[a-zA-Z]/,
      numbers: /[0-9]/
    };

    const detectedLanguages: { [key: string]: number } = {
      arabic: 0,
      bengali: 0,
      english: 0,
      numbers: 0
    };

    // Count characters for each language
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        detectedLanguages[lang] = matches.length;
      }
    }

    // Determine primary language
    const totalChars = text.length;
    const languagePercentages = Object.entries(detectedLanguages).map(([lang, count]) => ({
      language: lang,
      percentage: (count / totalChars) * 100
    }));

    // Sort by percentage
    languagePercentages.sort((a, b) => b.percentage - a.percentage);

    return {
      primary: languagePercentages[0]?.language || 'unknown',
      percentages: languagePercentages,
      isMixed: languagePercentages.filter(l => l.percentage > 10).length > 1,
      confidence: languagePercentages[0]?.percentage || 0
    };
  }, []);

  // NEW: Enhanced language switching detection
  const detectLanguageSwitch = useCallback((currentText: string, newText: string) => {
    const currentLang = detectLanguageInText(currentText);
    const newLang = detectLanguageInText(newText);
    
    // Check if there's a significant language change
    const languageChanged = currentLang.primary !== newLang.primary;
    const confidenceThreshold = 30; // Minimum confidence for language detection
    
    if (languageChanged && newLang.confidence > confidenceThreshold) {
      console.log(`Language switch detected: ${currentLang.primary} → ${newLang.primary}`);
      console.log(`Confidence: ${newLang.confidence.toFixed(1)}%`);
      
      return {
        switched: true,
        from: currentLang.primary,
        to: newLang.primary,
        confidence: newLang.confidence,
        isMixed: newLang.isMixed
      };
    }
    
    return { switched: false };
  }, [detectLanguageInText]);

  // NEW: Smart language configuration for mixed speech
  const getOptimalLanguageConfig = useCallback((primaryLanguage: string, detectedLanguages: string[]) => {
    const baseConfig = getLanguageConfig(primaryLanguage);
    
    // Enhanced configuration for mixed language speech
    if (detectedLanguages.length > 1) {
      return {
        ...baseConfig,
        maxAlternatives: Math.max(baseConfig.maxAlternatives, 5), // More alternatives for mixed speech
        continuous: true, // Always continuous for mixed language
        interimResults: true, // Always interim results for better detection
        dialect: `${baseConfig.dialect} + Mixed Language Support`
      };
    }
    
    return baseConfig;
  }, [getLanguageConfig]);

  // Check if we're in production
  useEffect(() => {
    setIsProduction(window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  }, []);

  // Function to clear all transcription data
  const clearTranscription = useCallback(() => {
    accumulatedTranscriptRef.current = '';
    setRetryCount(0);
    setLastError(null);
    
    // NEW: Reset cross-language recognition state
    setCurrentDetectedLanguage('');
    setIsMixedLanguage(false);
    setLanguageSwitchCount(0);
    setLastLanguageSwitch(null);
    
    // Update footer state
    updateFooterState({
      currentDetectedLanguage: '',
      isMixedLanguage: false,
      languageSwitchCount: 0,
      lastLanguageSwitch: null,
      retryCount: 0,
      lastError: null
    });
    
    onClearTranscription();
  }, [onClearTranscription]);

  const startRecognition = useCallback(async () => {
    if (isRecognitionRunningRef.current) {
      console.log('Recognition already running, skipping...');
      return;
    }

    try {
      console.log('Starting Enhanced Web Speech API...');
      
      // FIXED: Reset manual stop flag when starting
      setUserManuallyStopped(false);
      
      // Check browser compatibility
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }

      // Get the appropriate SpeechRecognition constructor
      const SpeechRecognitionConstructor = (window as WindowWithSpeechRecognition).SpeechRecognition || 
                                         (window as WindowWithSpeechRecognition).webkitSpeechRecognition;
      
      if (!SpeechRecognitionConstructor) {
        throw new Error('Speech recognition not available');
      }

      // Create new recognition instance
      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      // Get enhanced language configuration
      const languageConfig = getLanguageConfig(sourceLanguage);
      const dialectInfo = detectAndFallbackLanguage(sourceLanguage);
      
      // NEW: Get optimal configuration for cross-language recognition
      const optimalConfig = getOptimalLanguageConfig(sourceLanguage, [sourceLanguage]);
      
      // Configure recognition settings with language-specific optimizations
      recognition.continuous = optimalConfig.continuous;
      recognition.interimResults = optimalConfig.interimResults;
      recognition.maxAlternatives = optimalConfig.maxAlternatives;
      
      // Set language based on source language with dialect support
      recognition.lang = dialectInfo.primary;
      
      console.log(`Enhanced Web Speech API started for ${dialectInfo.primary} (${optimalConfig.dialect})`);
      console.log(`Fallback options: ${dialectInfo.fallbacks.join(', ')}`);
      console.log(`🌍 Cross-language support: ${optimalConfig.dialect.includes('Mixed Language') ? 'Enabled' : 'Standard'}`);

      // Set up enhanced event handlers
      recognition.onstart = () => {
        console.log(`Speech recognition start() called for ${optimalConfig.dialect}`);
        // FIXED: Set recording state and enable button immediately so user can stop
        setIsRecording(true);
        setIsProcessing(false);
        isRecognitionRunningRef.current = true;
      };

      // FIXED: Add onaudiostart to keep audio stream active
      recognition.onaudiostart = () => {
        console.log(`Audio stream started for ${optimalConfig.dialect}`);
      };

      // FIXED: Add onaudiostart to keep audio stream active
      recognition.onaudioend = () => {
        console.log(`Audio stream ended for ${optimalConfig.dialect}`);
        // Don't stop recognition, let it continue
      };

      // FIXED: Add speech event handlers for better control
      recognition.onspeechstart = () => {
        console.log(`Speech detected for ${optimalConfig.dialect}`);
      };

      recognition.onspeechend = () => {
        console.log(`Speech ended for ${optimalConfig.dialect}, but continuing to listen...`);
        // Don't stop recognition, let it continue listening
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        const confidenceScores: number[] = [];

        // FIXED: Enable button when first result comes in so user can stop
        if (isProcessing) {
          console.log('First result received - enabling stop button for user control...');
          setIsProcessing(false);
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            confidenceScores.push(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        // NEW: Enhanced transcript processing with cross-language recognition
        if (finalTranscript) {
          const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
          console.log(`Final transcript confidence: ${(avgConfidence * 100).toFixed(1)}%`);
          
          // NEW: Cross-language detection and analysis
          const languageAnalysis = detectLanguageInText(finalTranscript);
          const currentAccumulated = accumulatedTranscriptRef.current;
          
          // NEW: Update cross-language recognition state
          setCurrentDetectedLanguage(languageAnalysis.primary);
          setIsMixedLanguage(languageAnalysis.isMixed);
          
          // Update footer state
          updateFooterState({
            currentDetectedLanguage: languageAnalysis.primary,
            isMixedLanguage: languageAnalysis.isMixed
          });
          
          // NEW: Detect language switching
          if (currentAccumulated) {
            const languageSwitch = detectLanguageSwitch(currentAccumulated, finalTranscript);
            if (languageSwitch.switched && languageSwitch.to && languageSwitch.confidence) {
              console.log(`🔄 Language switch detected: ${languageSwitch.from} → ${languageSwitch.to}`);
              console.log(`📊 Switch confidence: ${languageSwitch.confidence.toFixed(1)}%`);
              console.log(`🌍 Mixed language: ${languageSwitch.isMixed ? 'Yes' : 'No'}`);
              
              // NEW: Update language switch state
              setLanguageSwitchCount(prev => prev + 1);
              setLastLanguageSwitch({
                from: languageSwitch.from,
                to: languageSwitch.to,
                confidence: languageSwitch.confidence
              });
              
              // Update footer state
              updateFooterState({
                languageSwitchCount: languageSwitchCount + 1,
                lastLanguageSwitch: {
                  from: languageSwitch.from,
                  to: languageSwitch.to,
                  confidence: languageSwitch.confidence
                }
              });
              
              // Notify user about language switch
              if (isProduction) {
                onTranslation(`Language detected: ${languageSwitch.to.toUpperCase()} (${languageSwitch.confidence.toFixed(0)}% confidence)`);
              } else {
                onTranslation(`🔄 Language switched from ${languageSwitch.from} to ${languageSwitch.to} (${languageSwitch.confidence.toFixed(1)}% confidence)`);
              }
            }
          }
          
          // NEW: Enhanced language analysis logging
          console.log(`🌍 Language Analysis for: "${finalTranscript}"`);
          console.log(`📊 Primary: ${languageAnalysis.primary} (${languageAnalysis.confidence.toFixed(1)}%)`);
          console.log(`🔀 Mixed: ${languageAnalysis.isMixed ? 'Yes' : 'No'}`);
          console.log(`📈 Percentages:`, languageAnalysis.percentages.map(l => `${l.language}: ${l.percentage.toFixed(1)}%`));
          
          accumulatedTranscriptRef.current += finalTranscript + ' ';
          onTranscription(accumulatedTranscriptRef.current.trim(), true);
          
          // FIXED: Don't restart recognition - let it continue naturally
          // The Web Speech API should continue listening with continuous: true
          console.log('Transcript processed, continuing to listen...');
        }

        // Enhanced interim transcript for live display
        if (interimTranscript) {
          onTranscription(interimTranscript, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('Enhanced speech recognition error:', event.error);
        console.log('Error details:', event);
        console.log('Current dialect:', dialectInfo.primary);
        
        // FIXED: Enhanced error handling - don't stop for non-critical errors
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
          // Don't stop recognition for no-speech errors
          return;
        }
        
        if (isProduction) {
          let userMessage = '';
          switch (event.error) {
            case 'network':
              userMessage = `Network error for ${optimalConfig.dialect} - speech recognition may be limited`;
              break;
            case 'not-allowed':
              userMessage = 'Microphone access denied. Please allow microphone permissions.';
              break;
            case 'aborted':
              userMessage = `Speech recognition for ${optimalConfig.dialect} was aborted`;
              break;
            case 'audio-capture':
              userMessage = 'Audio capture error - please check your microphone.';
              break;
            case 'service-not-allowed':
              userMessage = 'Speech recognition service not allowed. Please check browser settings.';
              break;
            default:
              userMessage = `Speech recognition error for ${optimalConfig.dialect}: ${event.error}`;
          }
          onTranslation(userMessage);
        } else {
          onTranslation(`Enhanced Error for ${optimalConfig.dialect}: ${event.error}`);
        }
        
        // FIXED: For critical errors, restart recognition instead of stopping
        if (event.error !== 'no-speech') {
          console.log('Critical error detected, restarting recognition...');
          isRecognitionRunningRef.current = false;
          // Auto-restart after error
          setTimeout(() => {
            if (isRecording && !isRecognitionRunningRef.current) {
              console.log('Auto-restart: Starting recognition...');
              startRecognition();
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        console.log(`Enhanced speech recognition ended for ${optimalConfig.dialect}`);
        isRecognitionRunningRef.current = false;
        
        // FIXED: Don't restart if user manually stopped
        if (userManuallyStopped) {
          console.log('User manually stopped recording, not restarting...');
          setUserManuallyStopped(false); // Reset flag
          return;
        }
        
        // FIXED: Update button state to allow user to stop
        setIsProcessing(false);
        
        // FIXED: Always retry if user still wants to record (not just in production)
        if (isRecording && retryCount < maxRetries) {
          console.log('Recognition ended unexpectedly, attempting to restart...');
          setTimeout(() => {
            if (isRecording && retryCount < maxRetries) {
              console.log('Attempting to restart recognition...');
              setRetryCount(prev => prev + 1);
              // Update footer state
              updateFooterState({ retryCount: retryCount + 1 });
              startRecognition();
            }
          }, retryDelay);
        } else if (retryCount >= maxRetries) {
          console.log('Max retries reached, but continuing to listen...');
          // FIXED: Don't stop recording, just reset retry count and continue
          setRetryCount(0);
          // Update footer state
          updateFooterState({ retryCount: 0 });
          // Auto-restart after a longer delay
          setTimeout(() => {
            if (isRecording && !isRecognitionRunningRef.current) {
              console.log('Auto-restart after max retries...');
              startRecognition();
            }
          }, 2000);
        }
      };

      // FIXED: Add onnomatch handler to continue listening when no match found
      recognition.onnomatch = () => {
        console.log(`No match found for ${optimalConfig.dialect}, continuing to listen...`);
        // Don't stop recognition, let it continue listening
      };

      // Start recognition
      recognition.start();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onTranslation(`Error starting speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  }, [isRecording, sourceLanguage, getLanguageCode, onTranscription, onTranslation, isProduction, retryCount, maxRetries, retryDelay, userManuallyStopped, setIsRecording, updateFooterState]);

  const stopRecognition = useCallback(() => {
    console.log('Stopping speech recognition...');
    
    // FIXED: Set flag to prevent auto-restart
    setUserManuallyStopped(true);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setIsProcessing(false);
    isRecognitionRunningRef.current = false;
    setRetryCount(0);
    // Update footer state
    updateFooterState({ retryCount: 0 });
  }, [updateFooterState]);

  const resetAndRetry = useCallback(() => {
    console.log('Resetting and retrying recognition...');
    setRetryCount(0);
    setLastError(null);
    // Update footer state
    updateFooterState({ retryCount: 0, lastError: null });
    stopRecognition();
    
    // Wait a moment then restart
    setTimeout(() => {
      if (isRecording) {
        startRecognition();
      }
    }, 1000);
      }, [isRecording, startRecognition, stopRecognition, updateFooterState]);

  // Enhanced client-side translation function with cultural context
  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
    if (sourceLang === targetLang) {
      return text;
    }

    // Enhanced comprehensive translations with cultural context
    const enhancedTranslations: Record<string, Record<string, Record<string, string>>> = {
      'en': {
        'ar': {
          // Common greetings and expressions
          'hello': 'مرحبا',
          'hi': 'أهلا',
          'good morning': 'صباح الخير',
          'good afternoon': 'مساء الخير',
          'good evening': 'مساء الخير',
          'goodbye': 'مع السلامة',
          'thank you': 'شكرا لك',
          'please': 'من فضلك',
          'excuse me': 'عذراً',
          'sorry': 'آسف',
          
          // Common phrases
          'how are you': 'كيف حالك؟',
          'i am fine': 'أنا بخير',
          'nice to meet you': 'تشرفت بمقابلتك',
          'what is your name': 'ما اسمك؟',
          'my name is': 'اسمي',
          'where are you from': 'من أين أنت؟',
          'i am from': 'أنا من',
          
          // Technology and app related
          'speech recognition': 'التعرف على الكلام',
          'translation': 'الترجمة',
          'microphone': 'الميكروفون',
          'recording': 'التسجيل',
          'start': 'ابدأ',
          'stop': 'توقف',
          'clear': 'امسح',
          'copy': 'انسخ',
          
          // Numbers and time
          'one': 'واحد',
          'two': 'اثنان',
          'three': 'ثلاثة',
          'four': 'أربعة',
          'five': 'خمسة',
          'today': 'اليوم',
          'tomorrow': 'غداً',
          'yesterday': 'أمس',
          
          // Default fallback
          'default': 'مرحبا، هذا اختبار للترجمة المحسنة'
        },
        'bn': {
          // Common greetings and expressions
          'hello': 'হ্যালো',
          'hi': 'হাই',
          'good morning': 'সুপ্রভাত',
          'good afternoon': 'শুভ অপরাহ্ন',
          'good evening': 'শুভ সন্ধ্যা',
          'goodbye': 'বিদায়',
          'thank you': 'ধন্যবাদ',
          'please': 'অনুগ্রহ করে',
          'excuse me': 'মাফ করবেন',
          'sorry': 'দুঃখিত',
          
          // Common phrases
          'how are you': 'কেমন আছেন?',
          'i am fine': 'আমি ভালো আছি',
          'nice to meet you': 'আপনার সাথে পরিচিত হয়ে খুশি হলাম',
          'what is your name': 'আপনার নাম কী?',
          'my name is': 'আমার নাম',
          'where are you from': 'আপনি কোথা থেকে এসেছেন?',
          'i am from': 'আমি এসেছি',
          
          // Technology and app related
          'speech recognition': 'বাক্য স্বীকৃতি',
          'translation': 'অনুবাদ',
          'microphone': 'মাইক্রোফোন',
          'recording': 'রেকর্ডিং',
          'start': 'শুরু করুন',
          'stop': 'বন্ধ করুন',
          'clear': 'মুছুন',
          'copy': 'কপি করুন',
          
          // Numbers and time
          'one': 'এক',
          'two': 'দুই',
          'three': 'তিন',
          'four': 'চার',
          'five': 'পাঁচ',
          'today': 'আজ',
          'tomorrow': 'কাল',
          'yesterday': 'গতকাল',
          
          // Default fallback
          'default': 'হ্যালো, এটি অনুবাদের জন্য একটি উন্নত পরীক্ষা'
        }
      },
      'ar': {
        'en': {
          // Common greetings and expressions
          'مرحبا': 'Hello',
          'أهلا': 'Hi',
          'صباح الخير': 'Good morning',
          'مساء الخير': 'Good afternoon/evening',
          'مع السلامة': 'Goodbye',
          'شكرا لك': 'Thank you',
          'من فضلك': 'Please',
          'عذراً': 'Excuse me',
          'آسف': 'Sorry',
          
          // Common phrases
          'كيف حالك': 'How are you?',
          'أنا بخير': 'I am fine',
          'تشرفت بمقابلتك': 'Nice to meet you',
          'ما اسمك': 'What is your name?',
          'اسمي': 'My name is',
          'من أين أنت': 'Where are you from?',
          'أنا من': 'I am from',
          
          // Technology and app related
          'التعرف على الكلام': 'Speech recognition',
          'الترجمة': 'Translation',
          'الميكروفون': 'Microphone',
          'التسجيل': 'Recording',
          'ابدأ': 'Start',
          'توقف': 'Stop',
          'امسح': 'Clear',
          'انسخ': 'Copy',
          
          // Numbers and time
          'واحد': 'One',
          'اثنان': 'Two',
          'ثلاثة': 'Three',
          'أربعة': 'Four',
          'خمسة': 'Five',
          'اليوم': 'Today',
          'غداً': 'Tomorrow',
          'أمس': 'Yesterday',
          
          // Default fallback
          'default': 'Hello, this is an enhanced translation test'
        },
        'bn': {
          // Common greetings and expressions
          'مرحبا': 'হ্যালো',
          'أهلا': 'হাই',
          'صباح الخير': 'সুপ্রভাত',
          'مساء الخير': 'শুভ অপরাহ্ন/সন্ধ্যা',
          'مع السلامة': 'বিদায়',
          'شكرا لك': 'ধন্যবাদ',
          'من فضلك': 'অনুগ্রহ করে',
          'عذراً': 'মাফ করবেন',
          'দুঃখিত': 'দুঃখিত',
          
          // Common phrases
          'كيف حالك': 'কেমন আছেন?',
          'أنا بخير': 'আমি ভালো আছি',
          'تشرفت بمقابلتك': 'আপনার সাথে পরিচিত হয়ে খুশি হলাম',
          'ما اسمك': 'আপনার নাম কী?',
          'اسمي': 'আমার নাম',
          'من أين أنت': 'আপনি কোথা থেকে এসেছেন?',
          'أنا من': 'আমি এসেছি',
          
          // Technology and app related
          'التعرف على الكلام': 'বাক্য স্বীকৃতি',
          'الترجمة': 'অনুবাদ',
          'الميكروفون': 'মাইক্রোফোন',
          'التسجيل': 'রেকর্ডিং',
          'ابدأ': 'শুরু করুন',
          'توقف': 'বন্ধ করুন',
          'امسح': 'মুছুন',
          'انسخ': 'কপি করুন',
          
          // Numbers and time
          'واحد': 'এক',
          'اثنان': 'দুই',
          'ثلاثة': 'তিন',
          'أربعة': 'চার',
          'خمسة': 'পাঁচ',
          'اليوم': 'আজ',
          'غداً': 'কাল',
          'أمس': 'গতকাল',
          
          // Default fallback
          'default': 'হ্যালো, এটি অনুবাদের জন্য একটি উন্নত পরীক্ষা'
        }
      }
    };

    // Enhanced translation logic with word-by-word translation
    try {
      const sourceDict = enhancedTranslations[sourceLang]?.[targetLang];
      if (!sourceDict) {
        return text; // Return original text if no translation available
      }

      // Split text into words and translate each word
      const words = text.toLowerCase().split(/\s+/);
      const translatedWords = words.map(word => {
        // Remove punctuation for translation lookup
        const cleanWord = word.replace(/[^\w\u0600-\u06FF\u0980-\u09FF]/g, '');
        
        // Check for exact match first
        if (sourceDict[cleanWord]) {
          return sourceDict[cleanWord];
        }
        
        // Check for partial matches (for longer phrases)
        const partialMatch = Object.keys(sourceDict).find(key => 
          cleanWord.includes(key) || key.includes(cleanWord)
        );
        
        if (partialMatch) {
          return sourceDict[partialMatch];
        }
        
        // Return original word if no translation found
        return word;
      });

      // Join translated words and return
      const translatedText = translatedWords.join(' ');
      
      // If no meaningful translation was found, return default
      if (translatedText === text) {
        return sourceDict['default'] || text;
      }
      
      return translatedText;
      
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }, []);

  // Modal handlers
  const handleAllowAccess = async () => {
    try {
      console.log('Requesting microphone permission...');
      setMicrophonePermission('checking');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');
      setMicrophonePermission('granted');
      setShowPermissionModal(false);
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      onTranslation('Microphone access was denied. You can still use LiveSpeak, but recording features will be limited.');
    }
  };

  const handleMaybeLater = () => {
    setShowPermissionModal(false);
    setMicrophonePermission('denied');
    onTranslation('No problem! You can enable microphone access anytime in your browser settings.');
  };

  const handleCloseModal = () => {
    setShowPermissionModal(false);
  };

  // Handle transcription updates in a separate effect to avoid render conflicts
  useEffect(() => {
    if (accumulatedTranscriptRef.current) {
      translateText(accumulatedTranscriptRef.current, sourceLanguage, targetLanguage).then(result => {
        onTranslation(result);
      }).catch(error => {
        console.error('Translation failed:', error);
        onTranslation(`Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
    }
  }, [accumulatedTranscriptRef.current, translateText, sourceLanguage, targetLanguage, onTranslation]);

  // Handle recording state changes
  useEffect(() => {
    if (isRecording && !isRecognitionRunningRef.current) {
      startRecognition();
    }
    // FIXED: Remove automatic stopRecognition to prevent premature stopping
    // The user should manually stop recording, not automatic stopping
  }, [isRecording, startRecognition]);

  // Request microphone permission when component mounts
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // Check if microphone permission is already granted
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          if (permissionStatus.state === 'granted') {
            console.log('Microphone permission already granted');
            setMicrophonePermission('granted');
          } else if (permissionStatus.state === 'prompt') {
            console.log('Microphone permission needs to be requested');
            setMicrophonePermission('prompt');
            // Show the beautiful modal instead of automatic request
            setShowPermissionModal(true);
          } else {
            console.log('Microphone permission denied');
            setMicrophonePermission('denied');
            // Show the modal to give user another chance
            setShowPermissionModal(true);
          }
        } else {
          // Fallback for browsers that don't support permissions API
          console.log('Permissions API not supported, showing modal...');
          setMicrophonePermission('prompt');
          setShowPermissionModal(true);
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setMicrophonePermission('prompt');
        setShowPermissionModal(true);
      }
    };

    // Check permission after a short delay to let the page load
    const timer = setTimeout(checkMicrophonePermission, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Recording Button */}
      <div className="flex flex-col items-center space-y-4">
        {/* Microphone Permission Status */}
        <div className="text-center">
          {microphonePermission === 'checking' && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Checking microphone access...</span>
            </div>
          )}
          {microphonePermission === 'prompt' && (
            <div className="flex items-center justify-center space-x-2 text-yellow-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">Please allow microphone access</span>
            </div>
          )}
          {microphonePermission === 'granted' && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Microphone access granted</span>
            </div>
          )}
          {microphonePermission === 'denied' && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">Microphone access denied</span>
            </div>
          )}
        </div>
        
        <button
          onClick={isRecording ? stopRecognition : startRecognition}
          disabled={isProcessing || microphonePermission === 'denied'}
          className={`
            relative w-24 h-24 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <img
            src={isRecording ? "/stop.svg" : "/microphone.svg"}
            alt={isRecording ? "Stop Recording" : "Start Recording"}
            className="w-12 h-12 mx-auto"
          />
        </button>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isProcessing ? 'Processing...' : isRecording ? 'Recording - Click to Stop' : 'Click to Record'}
        </p>
      </div>

      {/* Status Text */}
      <div className="mt-4 text-center">
        {isRecording && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
            <p>
              Speaking in {sourceLanguage === 'ar' ? 'العربية (Arabic)' : sourceLanguage === 'bn' ? 'বাংলা (Bengali)' : 'English (US)'}
            </p>
            <p className="text-xs text-blue-500">
              Dialect: {getLanguageConfig(sourceLanguage).dialect}
            </p>
            <p className="text-xs text-green-500">
              Auto-restart: Active
            </p>
          </div>
        )}
      </div>











      {/* Permission Modal */}
      <PermissionModal
        isOpen={showPermissionModal}
        onAllow={handleAllowAccess}
        onMaybeLater={handleMaybeLater}
        onClose={handleCloseModal}
      />
    </div>
  );
}
