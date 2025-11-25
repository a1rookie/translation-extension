import browser from 'webextension-polyfill';
import type { TranslationConfig, TranslationResult } from '../types';

const DEFAULT_CONFIG: TranslationConfig = {
  defaultTargetLang: 'zh',
  autoDetect: true,
  enableCache: true,
  maxHistoryItems: 100,
};

export class StorageManager {
  async getConfig(): Promise<TranslationConfig> {
    const result = await browser.storage.sync.get('config');
    return { ...DEFAULT_CONFIG, ...result.config };
  }

  async setConfig(config: Partial<TranslationConfig>): Promise<void> {
    const current = await this.getConfig();
    await browser.storage.sync.set({ config: { ...current, ...config } });
  }

  async addHistory(result: TranslationResult): Promise<void> {
    try {
      const history = await this.getHistory();
      if (!Array.isArray(history)) {
        console.warn('History is not an array, resetting...');
        await browser.storage.local.set({ history: [result] });
        return;
      }
      
      history.unshift(result);
      
      const config = await this.getConfig();
      const maxItems = config.maxHistoryItems || 100;
      const trimmed = history.slice(0, maxItems);
      
      await browser.storage.local.set({ history: trimmed });
    } catch (error) {
      console.error('Failed to add history:', error);
    }
  }

  async getHistory(): Promise<TranslationResult[]> {
    try {
      const result = await browser.storage.local.get('history');
      const history = result.history;
      
      if (!history) return [];
      if (!Array.isArray(history)) {
        console.warn('History is not an array, returning empty array');
        return [];
      }
      
      return history;
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    await browser.storage.local.remove('history');
  }
}
