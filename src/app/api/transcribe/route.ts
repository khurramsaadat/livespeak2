import { NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
import { protos } from '@google-cloud/speech';

// Initialize Google Cloud Speech client
const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en-US';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Configure the request with proper types
    const requestConfig: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sampleRateHertz: 48000,
        languageCode: language,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        enableWordConfidence: true,
      },
    };

    console.log(`Processing audio transcription for language: ${language}`);

    // Perform the transcription
    const [response] = await speechClient.recognize(requestConfig);
    
    if (!response || !response.results || response.results.length === 0) {
      return NextResponse.json({ 
        transcription: '', 
        error: 'No transcription results found' 
      });
    }

    // Extract the transcription
    const transcription = response.results
      .map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ');

    console.log(`Transcription completed: "${transcription}"`);

    return NextResponse.json({ 
      transcription,
      confidence: response.results[0]?.alternatives?.[0]?.confidence || 0
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ 
        error: 'Google Cloud authentication failed. Please check your credentials.' 
      }, { status: 401 });
    }
    
    // Check if it's an API quota error
    if (error instanceof Error && error.message.includes('quota')) {
      return NextResponse.json({ 
        error: 'Google Cloud API quota exceeded. Please try again later.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to transcribe audio. Please try again.' 
    }, { status: 500 });
  }
}
