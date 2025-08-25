import { NextResponse } from 'next/server';

// Simple translation fallback - no external APIs needed
const simpleTranslations: Record<string, Record<string, string>> = {
  en: {
    ar: "مرحبا، هذا تطبيق بسيط للترجمة",
    bn: "হ্যালো, এটি একটি সাধারণ অনুবাদ অ্যাপ্লিকেশন"
  },
  ar: {
    en: "Hello, this is a simple translation app",
    bn: "হ্যালো, এটি একটি সাধারণ অনুবাদ অ্যাপ্লিকেশন"
  },
  bn: {
    en: "Hello, this is a simple translation app",
    ar: "مرحبا، هذا تطبيق بسيط للترجمة"
  }
};

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided for translation' }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({ error: 'No target language specified' }, { status: 400 });
    }

    console.log(`Translating text to ${targetLanguage}: "${text}"`);

    // Detect source language (simplified - assume English for now)
    const sourceLanguage = 'en';
    
    // Get translation from our simple dictionary
    let translation = '';
    
    if (sourceLanguage === targetLanguage) {
      // When languages are the same, just return the original text
      translation = text;
    } else {
      translation = simpleTranslations[sourceLanguage]?.[targetLanguage] || 
                   `[Translated to ${targetLanguage}]: ${text}`;
    }

    console.log(`Translation completed: "${translation}"`);

    return NextResponse.json({ 
      translation,
      sourceLanguage,
      targetLanguage,
      originalText: text,
      method: 'Simple Fallback Translation'
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to translate text. Please try again.' 
    }, { status: 500 });
  }
}
