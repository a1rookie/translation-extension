import browser from 'webextension-polyfill';
import type { TranslationConfig, TranslationResult, UsageStats } from '../types';

const DEFAULT_CONFIG: TranslationConfig = {
  defaultTargetLang: 'zh',
  autoDetect: true,
  enableCache: true,
  maxHistoryItems: 100,
  usageStats: {
    volcengine: {
      totalCharacters: 0,
      lastReset: Date.now(),
    },
    microsoft: {
      totalCharacters: 0,
      lastReset: Date.now(),
    },
  },
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

  // 更新使用量统计
  async updateUsageStats(provider: 'volcengine' | 'microsoft', characters: number): Promise<void> {
    try {
      const config = await this.getConfig();
      const usageStats = config.usageStats || DEFAULT_CONFIG.usageStats!;

      usageStats[provider].totalCharacters += characters;

      await this.setConfig({ usageStats });
      console.log(`Updated ${provider} usage: +${characters} characters, total: ${usageStats[provider].totalCharacters}`);
    } catch (error) {
      console.error('Failed to update usage stats:', error);
    }
  }

  // 获取使用量统计
  async getUsageStats(): Promise<UsageStats> {
    const config = await this.getConfig();
    return config.usageStats || DEFAULT_CONFIG.usageStats!;
  }

  // 重置使用量统计
  async resetUsageStats(provider?: 'volcengine' | 'microsoft'): Promise<void> {
    const config = await this.getConfig();
    const usageStats = config.usageStats || DEFAULT_CONFIG.usageStats!;

    if (provider) {
      usageStats[provider] = {
        totalCharacters: 0,
        lastReset: Date.now(),
      };
    } else {
      usageStats.volcengine = {
        totalCharacters: 0,
        lastReset: Date.now(),
      };
      usageStats.microsoft = {
        totalCharacters: 0,
        lastReset: Date.now(),
      };
    }

    await this.setConfig({ usageStats });
  }
}
