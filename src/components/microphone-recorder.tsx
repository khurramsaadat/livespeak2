"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Proper TypeScript interfaces for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
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
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognition;
  SpeechRecognition?: new () => SpeechRecognition;
}

interface MicrophoneRecorderProps {
  onTranscription: (transcript: string, isFinal: boolean) => void;
  onTranslation: (translation: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  targetLanguage: string;
  sourceLanguage: string;
  onClearTranscription: () => void;
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
  const isRecognitionRunningRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const pendingTranscriptionRef = useRef('');
  const pendingInterimRef = useRef('');

  // Function to clear all transcription data
  const clearTranscription = useCallback(() => {
    accumulatedTranscriptRef.current = '';
    pendingTranscriptionRef.current = '';
    pendingInterimRef.current = '';
    setTranscription('');
    onClearTranscription();
  }, [onClearTranscription]);

  const startRecognition = useCallback(() => {
    // Prevent multiple instances
    if (isRecognitionRunningRef.current) {
      console.log('Speech recognition already running, skipping...');
      return;
    }

    if (!(('webkitSpeechRecognition' in window))) {
      alert("Web Speech API is not supported by this browser. Please use Chrome.");
      setIsRecording(false);
      return;
    }

    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognitionConstructor = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      alert("Speech Recognition is not available in this browser.");
      setIsRecording(false);
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognitionConstructor();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = sourceLanguage;

        recognitionRef.current.onstart = function () {
          console.log(`Web Speech API started for ${sourceLanguage}`);
          isRecognitionRunningRef.current = true;
          setIsProcessing(false);
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
          console.error("Speech recognition error:", event.error);
          console.error("Error details:", event);
          
          // Handle different error types gracefully
          if (event.error === 'aborted') {
            console.log("Speech recognition aborted");
            // Don't retry on aborted - this usually means user stopped or component unmounted
            // Just clean up and let the user restart manually if needed
            setIsProcessing(false);
            // Don't call startRecognition() here - it causes infinite loops
          } else if (event.error === 'network') {
            console.log("Network error - speech recognition may be limited");
            // Don't stop recording, just log the error
          } else if (event.error === 'not-allowed') {
            alert("Microphone access denied. Please allow microphone access and try again.");
            setIsRecording(false);
            setIsProcessing(false);
          } else if (event.error === 'no-speech') {
            console.log("No speech detected");
            // Don't stop recording, just wait for speech
          } else {
            console.log("Speech recognition error:", event.error);
            // For other errors, stop processing but don't retry automatically
            setIsProcessing(false);
          }
        };

        recognitionRef.current.onend = function () {
          console.log(`Speech recognition ended`);
          isRecognitionRunningRef.current = false;
          setIsProcessing(false);
          // Don't clear transcription here - preserve what was said
        };

        console.log('Starting Web Speech API...');
        recognitionRef.current.start();
        console.log('Speech recognition start() called');
        setIsProcessing(true);
      }
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
      <Button
        onClick={() => setIsRecording(!isRecording)}
        disabled={isProcessing}
        className={`px-8 py-4 text-xl ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } text-white rounded-full disabled:opacity-50`}
      >
        {isProcessing
          ? "Starting..."
          : isRecording
            ? "Stop Recording"
            : "Start Recording"
        }
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Using: Device Built-in Web Speech API
        </p>
        <p className="text-xs text-green-600 dark:text-green-400">
          No external APIs required - works immediately!
        </p>
      </div>

      {isProcessing && !isRecording && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Initializing speech recognition...
        </p>
      )}
    </div>
  );
}
