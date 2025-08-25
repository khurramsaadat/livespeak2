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
  const isRecognitionRunningRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const pendingTranscriptionRef = useRef('');
  const pendingInterimRef = useRef('');

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
      recognitionRef.current.lang = sourceLanguage === 'ar' ? 'ar-SA' : 'en-US';
      
      console.log('Speech recognition start() called');
      
      // Set up event handlers
      recognitionRef.current.onstart = function () {
        console.log('Web Speech API started for', recognitionRef.current?.lang);
        setIsProcessing(false);
        isRecognitionRunningRef.current = true;
      };

        recognitionRef.current.onresult = function (event: SpeechRecognitionEvent) {
          console.log('Speech recognition result received:', event);
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
            // Update accumulated transcript using ref
            accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + finalTranscript;
            console.log('Accumulated transcript:', accumulatedTranscriptRef.current);
            
            // Update local state
            setTranscription(accumulatedTranscriptRef.current);
            
            // Store pending transcription for useEffect to handle
            pendingTranscriptionRef.current = accumulatedTranscriptRef.current;
            // Clear interim when final arrives
            pendingInterimRef.current = '';
          }
          
          if (interimTranscript) {
            console.log('Interim transcript:', interimTranscript);
            // Show live transcription as user speaks - combine accumulated + current interim
            const liveTranscript = accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current ? ' ' : '') + interimTranscript;
            // Store pending interim for useEffect to handle
            pendingInterimRef.current = liveTranscript;
          }
        };

        recognitionRef.current.onerror = function (event: SpeechRecognitionErrorEvent) {
          console.log('Speech recognition error:', event.error);
          console.log('Error details:', event);
          
          if (event.error === 'network') {
            console.log('Network error - speech recognition may be limited');
            // Show user-friendly message for network errors
            setTranscription('Network error: Please check your internet connection and try again. If the issue persists, try refreshing the page.');
          } else if (event.error === 'not-allowed') {
            console.log('Microphone access denied');
            setTranscription('Microphone access denied. Please allow microphone permissions and try again.');
          } else if (event.error === 'no-speech') {
            console.log('No speech detected');
            // Don't show error for no-speech, just log it
          } else if (event.error === 'aborted') {
            console.log('Speech recognition aborted');
            // Don't show error for aborted, just log it
          } else {
            console.log('Unknown speech recognition error:', event.error);
            setTranscription(`Speech recognition error: ${event.error}. Please try again.`);
          }
          
          setIsRecording(false);
          isRecognitionRunningRef.current = false;
        };

        recognitionRef.current.onend = function () {
          console.log(`Speech recognition ended`);
          isRecognitionRunningRef.current = false;
          setIsProcessing(false);
          // Don't clear transcription here - preserve what was said
        };

        recognitionRef.current.start();
      } catch (error) {
        console.error('Error creating or starting speech recognition:', error);
        alert('Error starting speech recognition: ' + error);
        setIsRecording(false);
        setIsProcessing(false);
      }
  }, [setIsRecording, sourceLanguage, onTranscription, isRecording]);

  const stopRecognition = useCallback((): void => {
    if (recognitionRef.current && recognitionRef.current.continuous) {
      recognitionRef.current.stop();
      console.log(`Speech recognition stopped`);
    }
    isRecognitionRunningRef.current = false;
    setIsProcessing(false);
  }, []);

  const translateText = useCallback(async (text: string) => {
    if (!text) return;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onTranslation(data.translation);
        console.log('Translation received:', data.translation);
      } else {
        onTranslation(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Translation API error:', error);
      onTranslation(`Error: Failed to connect to the translation service.`);
    }
  }, [targetLanguage, onTranslation]);

  useEffect(() => {
    if (isRecording) {
      startRecognition();
    } else {
      stopRecognition();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isRecording, startRecognition, stopRecognition]);

  useEffect(() => {
    if (transcription) {
      translateText(transcription);
    }
  }, [transcription, translateText]);

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
    <div className="flex flex-col items-center gap-4">
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecognition : startRecognition}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &ldquo;Using: Device Built-in Web Speech API&rdquo;
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No external APIs required - works immediately!
          </p>
          
          {isProduction && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                🌐 Production Environment Detected
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                If speech recognition doesn&apos;t work, try:
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                <li>Allow microphone permissions</li>
                <li>Use HTTPS (already enabled)</li>
                <li>Try a different browser (Chrome recommended)</li>
                <li>Refresh the page if needed</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {isProcessing && !isRecording && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Initializing speech recognition...
        </p>
      )}
    </div>
  );
}
