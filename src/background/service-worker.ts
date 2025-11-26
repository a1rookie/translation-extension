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

// 处理翻译请求
async function handleTranslate(message: { text?: string; targetLang?: string }) {
  console.log('handleTranslate 收到:', message);
  
  // 验证消息格式
  if (!message.text || typeof message.text !== 'string' || message.text.trim().length === 0) {
    console.error('Invalid message.text:', message.text);
    return {
      success: false,
      error: '翻译文本不能为空',
    };
  }

  if (!translator) {
    await initTranslator();
  }

  if (!translator) {
    return { success: false, error: '翻译器初始化失败，请检查 API 配置' };
  }

  // 使用消息中的 targetLang 或默认值
  const targetLang = message.targetLang || 'zh';
  console.log('翻译请求 - 文本:', message.text, '目标语言:', targetLang);
  
  const result = await translator.translate(message.text.trim(), targetLang);
  
  // 保存到历史记录
  await storage.addHistory(result);

  return { success: true, result };
}

// 监听来自 content script 的消息
browser.runtime.onMessage.addListener((message, _sender) => {
  console.log('Service Worker 收到消息:', message);
  
  if (message.type === 'TRANSLATE') {
    // 返回 Promise 以支持异步响应
    return handleTranslate(message).catch(error => {
      console.error('Translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '翻译失败',
      };
    });
  }

  if (message.type === 'RELOAD_CONFIG') {
    console.log('收到重新加载配置请求');
    return initTranslator().then(() => ({ success: true }));
  }

  if (message.type === 'GET_SELECTION') {
    // 这个消息由 content script 处理，这里只是占位
    return Promise.resolve({ text: '' });
  }

  // 未知消息类型，返回 undefined 让其他监听器处理
  return undefined;
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
        const config = await storage.getConfig();
        const result = await translator?.translate(response.text, config.defaultTargetLang || 'zh');
        
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
