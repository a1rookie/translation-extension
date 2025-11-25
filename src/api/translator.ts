import { VolcengineTranslator } from './volcengine';
import { MicrosoftTranslator } from './microsoft';
import { CacheManager } from '../utils/cache';
import type { TranslationResult, TranslationConfig } from '../types';

export class Translator {
  private volcengine?: VolcengineTranslator;
  private microsoft?: MicrosoftTranslator;
  private cache: CacheManager;
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.cache = new CacheManager();

    if (config.volcengineApiKey) {
      this.volcengine = new VolcengineTranslator(config.volcengineApiKey);
    }

    if (config.microsoftApiKey) {
      this.microsoft = new MicrosoftTranslator(
        config.microsoftApiKey,
        config.microsoftRegion
      );
    }
  }

  async translate(
    text: string,
    targetLang: string = this.config.defaultTargetLang
  ): Promise<TranslationResult> {
    // 检查缓存
    if (this.config.enableCache) {
      const cached = await this.cache.get(text, targetLang);
      if (cached) {
        console.log('Cache hit');
        return cached;
      }
    }

    // 优先使用火山翻译
    if (this.volcengine) {
      try {
        const result = await this.volcengine.translate(text, 'auto', targetLang);
        await this.cache.set(text, targetLang, result);
        return result;
      } catch (error) {
        console.warn('Volcengine failed, trying Microsoft:', error);
      }
    }

    // 降级到微软翻译
    if (this.microsoft) {
      try {
        const result = await this.microsoft.translate(text, 'auto', targetLang);
        await this.cache.set(text, targetLang, result);
        return result;
      } catch (error) {
        console.error('Microsoft also failed:', error);
        throw new Error('所有翻译服务均不可用');
      }
    }

    throw new Error('未配置任何翻译服务');
  }
}
