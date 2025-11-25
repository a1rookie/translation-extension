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
    const history = await this.getHistory();
    history.unshift(result);
    
    const config = await this.getConfig();
    const trimmed = history.slice(0, config.maxHistoryItems);
    
    await browser.storage.local.set({ history: trimmed });
  }

  async getHistory(): Promise<TranslationResult[]> {
    const result = await browser.storage.local.get('history');
    return result.history || [];
  }

  async clearHistory(): Promise<void> {
    await browser.storage.local.remove('history');
  }
}
