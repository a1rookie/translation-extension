// Content script wrapper - 传统脚本格式
// 动态导入 ES 模块版本的 content script
(async () => {
  try {
    await import(chrome.runtime.getURL('content-module.js'));
  } catch (error) {
    console.error('Failed to load content script module:', error);
  }
})();
