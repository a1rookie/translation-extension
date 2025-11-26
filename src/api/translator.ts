import { VolcengineTranslator } from './volcengine';
import { MicrosoftTranslator } from './microsoft';
import { CacheManager } from '../utils/cache';
import { StorageManager } from '../utils/storage';
import type { TranslationResult, TranslationConfig } from '../types';

export class Translator {
  private volcengine?: VolcengineTranslator;
  private microsoft?: MicrosoftTranslator;
  private cache: CacheManager;
  private storage: StorageManager;
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.cache = new CacheManager();
    this.storage = new StorageManager();

    console.log('初始化 Translator，配置:', config);

    if (config.volcengineApiKey && config.volcengineSecretKey) {
      this.volcengine = new VolcengineTranslator(
        config.volcengineApiKey,
        config.volcengineSecretKey
      );
      console.log('火山翻译已初始化');
    }

    if (config.microsoftApiKey) {
      this.microsoft = new MicrosoftTranslator(
        config.microsoftApiKey,
        config.microsoftRegion
      );
      console.log('微软翻译已初始化');
    }
  }

  async translate(
    text: string,
    targetLang: string = this.config.defaultTargetLang
  ): Promise<TranslationResult> {
    // 验证输入
    if (!text || typeof text !== 'string') {
      console.error('Invalid text for translation:', text);
      throw new Error('翻译文本不能为空');
    }

    if (!targetLang || typeof targetLang !== 'string') {
      console.error('Invalid targetLang:', targetLang);
      throw new Error('目标语言不能为空');
    }

    // 检查缓存
    if (this.config.enableCache) {
      const cached = await this.cache.get(text, targetLang);
      if (cached) {
        console.log('Cache hit');
        return cached;
      }
    }

    const characterCount = text.length;

    // 优先使用火山翻译
    if (this.volcengine) {
      try {
        const result = await this.volcengine.translate(text, 'auto', targetLang);
        await this.cache.set(text, targetLang, result);
        // 记录使用量
        await this.storage.updateUsageStats('volcengine', characterCount);
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
        // 记录使用量
        await this.storage.updateUsageStats('microsoft', characterCount);
        return result;
      } catch (error) {
        console.error('Microsoft also failed:', error);
        throw new Error('所有翻译服务均不可用');
      }
    }

    throw new Error('未配置任何翻译服务');
  }
}
