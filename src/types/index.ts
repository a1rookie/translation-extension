export interface DetailedMeaning {
  pos: string; // part of speech (词性)
  meanings: string[];
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: 'volcengine' | 'microsoft';
  timestamp: number;
  detailedMeanings?: DetailedMeaning[];
}

export interface TranslationConfig {
  volcengineApiKey?: string;
  volcengineSecretKey?: string;
  microsoftApiKey?: string;
  microsoftRegion?: string;
  defaultTargetLang: string;
  autoDetect: boolean;
  enableCache: boolean;
  maxHistoryItems: number;
}

export interface CacheItem {
  key: string;
  result: TranslationResult;
  expiry: number;
}

export type SupportedLanguage = 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'auto';
