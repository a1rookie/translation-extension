import type { TranslationResult } from '../types';

export class MicrosoftTranslator {
  private apiKey: string;
  private region: string;
  private baseUrl = 'https://api.cognitive.microsofttranslator.com';

  constructor(apiKey: string, region: string = 'eastasia') {
    this.apiKey = apiKey;
    this.region = region;
  }

  async translate(
    text: string,
    sourceLang: string = 'auto',
    targetLang: string = 'zh-Hans'
  ): Promise<TranslationResult> {
    try {
      const params = new URLSearchParams({
        'api-version': '3.0',
        'to': targetLang,
      });

      if (sourceLang !== 'auto') {
        params.append('from', sourceLang);
      }

      const response = await fetch(`${this.baseUrl}/translate?${params}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      });

      if (!response.ok) {
        throw new Error(`Microsoft API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data[0];

      return {
        originalText: text,
        translatedText: result.translations[0].text,
        sourceLang: result.detectedLanguage?.language || sourceLang,
        targetLang: targetLang,
        provider: 'microsoft',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Microsoft translation failed:', error);
      throw error;
    }
  }
}
