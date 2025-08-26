import { useMemo } from 'react';

export interface RTLConfig {
  direction: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  fontFamily: string;
  textSize: string;
  lineHeight: string;
  letterSpacing: string;
}

export function useRTL(sourceLanguage: string): RTLConfig {
  return useMemo(() => {
    switch (sourceLanguage) {
      case 'ar':
        return {
          direction: 'ltr', // Always LTR - no layout flipping
          textAlign: 'left', // Always left-aligned
          fontFamily: 'font-arabic',
          textSize: 'text-base', // Same size as English - no size changes
          lineHeight: 'leading-relaxed',
          letterSpacing: 'tracking-wide'
        };
      case 'bn':
        return {
          direction: 'ltr',
          textAlign: 'left',
          fontFamily: 'font-bengali',
          textSize: 'text-base', // Same size as English - no size changes
          lineHeight: 'leading-relaxed',
          letterSpacing: 'tracking-normal'
        };
      default:
        return {
          direction: 'ltr',
          textAlign: 'left',
          fontFamily: 'font-english',
          textSize: 'text-base',
          lineHeight: 'leading-normal',
          letterSpacing: 'tracking-normal'
        };
    }
  }, [sourceLanguage]);
}

export function getRTLClasses(sourceLanguage: string): string {
  const direction = 'ltr'; // Always LTR - no layout flipping
  const fontFamily = sourceLanguage === 'ar' ? 'font-arabic' : sourceLanguage === 'bn' ? 'font-bengali' : 'font-english';
  const textSize = 'text-base'; // Always same size - no size changes
  const lineHeight = 'leading-relaxed'; // Consistent line height for now, can be dynamic if needed
  const letterSpacing = sourceLanguage === 'ar' ? 'tracking-wide' : 'tracking-normal';

  return `${direction} ${fontFamily} ${textSize} ${lineHeight} ${letterSpacing}`;
}

export function getTextDirection(sourceLanguage: string): 'ltr' | 'rtl' {
  return 'ltr'; // Always LTR - no layout flipping
}

export function getTextAlignment(sourceLanguage: string): 'left' | 'right' {
  return 'left'; // Always left-aligned
}
