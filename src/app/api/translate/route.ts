import { NextResponse } from 'next/server';

// Simple translation fallback - no external APIs needed
const simpleTranslations: { [key: string]: { [key: string]: string } } = {
  'en': {
    'en': 'Same language - no translation needed',
    'es': 'Mismo idioma - no se necesita traducción',
    'fr': 'Même langue - pas de traduction nécessaire',
    'de': 'Gleiche Sprache - keine Übersetzung erforderlich',
    'ar': 'نفس اللغة - لا حاجة للترجمة',
    'bn': 'একই ভাষা - অনুবাদের প্রয়োজন নেই'
  },
  'es': {
    'en': 'Hello, how are you?',
    'es': 'Same language - no translation needed',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Hallo, wie geht es dir?',
    'ar': 'مرحبا، كيف حالك؟',
    'bn': 'হ্যালো, আপনি কেমন আছেন?'
  },
  'fr': {
    'en': 'Hello, how are you?',
    'es': 'Hola, ¿cómo estás?',
    'fr': 'Same language - no translation needed',
    'de': 'Hallo, wie geht es dir?',
    'ar': 'مرحبا، كيف حالك؟',
    'bn': 'হ্যালো, আপনি কেমন আছেন?'
  },
  'de': {
    'en': 'Hello, how are you?',
    'es': 'Hola, ¿cómo estás?',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Same language - no translation needed',
    'ar': 'مرحبا، كيف حالك؟',
    'bn': 'হ্যালো, আপনি কেমন আছেন?'
  },
  'ar': {
    'en': 'Hello, how are you?',
    'es': 'Hola, ¿cómo estás?',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Hallo, wie geht es dir?',
    'ar': 'نفس اللغة - لا حاجة للترجمة',
    'bn': 'হ্যালো, আপনি কেমন আছেন?'
  },
  'bn': {
    'en': 'Hello, how are you?',
    'es': 'Hola, ¿cómo estás?',
    'fr': 'Bonjour, comment allez-vous?',
    'de': 'Hallo, wie geht es dir?',
    'ar': 'مرحبا، كيف حالك؟',
    'bn': 'একই ভাষা - অনুবাদের প্রয়োজন নেই'
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
