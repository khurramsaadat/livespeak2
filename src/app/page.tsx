"use client";

import { useState } from "react";
import { MicrophoneRecorder } from "@/components/microphone-recorder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [copyFeedback, setCopyFeedback] = useState<{transcription: boolean, translation: boolean}>({transcription: false, translation: false});

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LiveSpeak
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time Speech Recognition</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transcription Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-sm">Live Transcription</span>
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
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        {interimTranscription}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Listening...</p>
                    </div>
                  ) : transcription ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
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
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Start speaking to see transcription</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Click the record button below</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span className="text-sm">Translation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="h-full flex items-center justify-center">
                  {translation ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
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
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Translation will appear here</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">After you start speaking</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span>Source Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.304A2.968 2.968 0 0112 15a2.968 2.968 0 01-.952 1.304m-1.048 9.304L9 21l-1.048-5.696M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304M12 15a2.968 2.968 0 01-.952-1.304M12 15a2.968 2.968 0 00-.952 1.304" />
                  </svg>
                </div>
                <span>Target Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
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
          />
        </div>
      </div>
    </div>
  );
}
