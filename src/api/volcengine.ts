import type { TranslationResult } from '../types';

export class VolcengineTranslator {
  private accessKey: string;
  private secretKey: string;
  private baseUrl = 'https://translate.volcengine.com/crx/translate/v1';

  constructor(accessKey: string, secretKey?: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey || '';
  }

  async translate(
    text: string,
    sourceLang: string = 'auto',
    targetLang: string = 'zh'
  ): Promise<TranslationResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.accessKey,
          'X-Secret-Key': this.secretKey,
        },
        body: JSON.stringify({
          source_language: sourceLang,
          target_language: targetLang,
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Volcengine API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        originalText: text,
        translatedText: data.translation || data.trans_result?.[0]?.dst || text,
        sourceLang: data.source_language || sourceLang,
        targetLang: targetLang,
        provider: 'volcengine',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Volcengine translation failed:', error);
      throw error;
    }
  }
}
