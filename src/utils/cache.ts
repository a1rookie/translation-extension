import browser from 'webextension-polyfill';
import type { TranslationResult, CacheItem } from '../types';

export class CacheManager {
  private readonly CACHE_PREFIX = 'translation_cache_';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天

  private getCacheKey(text: string, targetLang: string): string {
    return `${this.CACHE_PREFIX}${targetLang}_${this.hashCode(text)}`;
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async get(text: string, targetLang: string): Promise<TranslationResult | null> {
    const key = this.getCacheKey(text, targetLang);
    const stored = await browser.storage.local.get(key);
    
    if (!stored[key]) return null;

    const cacheItem: CacheItem = stored[key];
    
    // 检查是否过期
    if (Date.now() > cacheItem.expiry) {
      await browser.storage.local.remove(key);
      return null;
    }

    return cacheItem.result;
  }

  async set(text: string, targetLang: string, result: TranslationResult): Promise<void> {
    const key = this.getCacheKey(text, targetLang);
    const cacheItem: CacheItem = {
      key,
      result,
      expiry: Date.now() + this.CACHE_EXPIRY,
    };

    await browser.storage.local.set({ [key]: cacheItem });
  }

  async clear(): Promise<void> {
    const all = await browser.storage.local.get();
    const cacheKeys = Object.keys(all).filter(key => key.startsWith(this.CACHE_PREFIX));
    await browser.storage.local.remove(cacheKeys);
  }
}
