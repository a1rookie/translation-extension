import browser from 'webextension-polyfill';
import { Translator } from '../api/translator';
import { StorageManager } from '../utils/storage';

let translator: Translator | null = null;
const storage = new StorageManager();

// 初始化翻译器
async function initTranslator() {
  const config = await storage.getConfig();
  translator = new Translator(config);
}

initTranslator();

// 监听来自 content script 的消息
browser.runtime.onMessage.addListener(async (message, _sender) => {
  if (message.type === 'TRANSLATE') {
    try {
      if (!translator) {
        await initTranslator();
      }

      const result = await translator!.translate(message.text);
      
      // 保存到历史记录
      await storage.addHistory(result);

      return { success: true, result };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '翻译失败',
      };
    }
  }

  if (message.type === 'GET_SELECTION') {
    // 这个消息由 content script 处理，这里只是占位
    return { text: '' };
  }
});

// 监听快捷键命令
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'translate-selection') {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tab.id) {
      // 请求 content script 获取选中文本
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'GET_SELECTION',
      });

      if (response?.text) {
        const result = await translator?.translate(response.text);
        
        if (result) {
          await storage.addHistory(result);
          
          // 发送翻译结果到 content script
          await browser.tabs.sendMessage(tab.id, {
            type: 'SHOW_TRANSLATION',
            result,
          });
        }
      }
    }
  }
});

// 监听配置更新
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.config) {
    initTranslator();
  }
});
