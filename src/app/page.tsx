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
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [sourceLanguage, setSourceLanguage] = useState("en-US");

  const handleTranscriptionUpdate = (newSegment: string, isFinal: boolean) => {
    if (isFinal) {
      // newSegment contains the full accumulated transcription
      setTranscription(newSegment);
      setInterimTranscription(""); // Clear interim when final arrives
    } else {
      // newSegment is just the interim transcript
      setInterimTranscription(newSegment);
    }
  };

  const handleClearTranscription = () => {
    setTranscription("");
    setInterimTranscription("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      <h1 className="text-4xl font-bold mb-8">LiveSpeak</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Transcription</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[250px] overflow-y-auto">
            <p className="text-base">
              {interimTranscription ? (
                // Show live transcription as user speaks
                <span className="text-gray-500 dark:text-gray-400 italic">
                  {interimTranscription}
                </span>
              ) : transcription ? (
                // Show final transcription when not speaking
                <span className="text-gray-900 dark:text-gray-50">
                  {transcription}
                </span>
              ) : (
                "Start speaking..."
              )}
            </p>
          </CardContent>
          {transcription && (
            <div className="p-4 pt-0">
              <button
                onClick={handleClearTranscription}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
              >
                Clear transcription
              </button>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translation</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[250px] overflow-y-auto">
            <p className="text-base text-gray-600 dark:text-gray-400">
              {translation || "Translation will appear here..."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-md mb-8">
        <h3 className="text-lg font-medium mb-2 text-center">Source Language</h3>
        <Select onValueChange={setSourceLanguage} defaultValue={sourceLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a source language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English (US)</SelectItem>
            <SelectItem value="bn-BD">Bengali (Bangladesh)</SelectItem>
            <SelectItem value="ar-SA">Arabic (Saudi Arabia)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full max-w-md mb-8">
        <h3 className="text-lg font-medium mb-2 text-center">Translation</h3>
        <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a target language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="bn">Bengali</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
  );
}
