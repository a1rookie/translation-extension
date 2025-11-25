import { createRoot } from 'react-dom/client';
import { FloatingPanel } from './FloatingPanel';
import type { TranslationResult } from '../types';

let currentPanel: HTMLDivElement | null = null;
let currentRoot: ReturnType<typeof createRoot> | null = null;

// 监听文本选择
document.addEventListener('mouseup', async (event) => {
  // 等待选择完成
  setTimeout(async () => {
    const selectedText = window.getSelection()?.toString().trim();

    if (!selectedText || selectedText.length === 0) {
      removePanel();
      return;
    }

    // 检查是否启用了划词翻译
    const config = await chrome.storage.sync.get(['enableSelection']);
    if (!config.enableSelection) {
      return;
    }

    // 检查文本长度限制
    if (selectedText.length > 500) {
      console.warn('选中文本过长，请选择少于 500 字符的文本');
      return;
    }

    // 调用翻译
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'TRANSLATE',
        data: {
          text: selectedText,
          sourceLang: 'auto',
          targetLang: 'zh', // 可以从配置读取
        },
      });

      if (result.error) {
        console.error('翻译失败:', result.error);
        return;
      }

      showPanel(result, {
        x: event.pageX + 10,
        y: event.pageY + 10,
      });
    } catch (error) {
      console.error('翻译请求失败:', error);
    }
  }, 100);
});

// 显示翻译面板
function showPanel(result: TranslationResult, position: { x: number; y: number }) {
  // 移除现有面板
  removePanel();

  // 创建容器
  currentPanel = document.createElement('div');
  currentPanel.id = 'translation-extension-root';
  document.body.appendChild(currentPanel);

  // 创建 Shadow DOM 以隔离样式
  const shadowRoot = currentPanel.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  // 注入样式
  const style = document.createElement('style');
  style.textContent = `
    .translation-floating-panel {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      min-width: 250px;
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.3s, transform 0.3s;
    }

    .translation-floating-panel.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .panel-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e8e8e8;
      font-size: 13px;
      color: #666;
    }

    .arrow {
      margin: 0 8px;
    }

    .close-btn {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .close-btn:hover {
      color: #333;
    }

    .panel-body {
      padding: 16px;
    }

    .original-text {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .translated-text {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 500;
      line-height: 1.6;
    }

    .panel-details {
      padding: 12px 16px;
      background: #f9f9f9;
      border-top: 1px solid #e8e8e8;
    }

    .details-title {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }

    .meaning-item {
      margin-bottom: 6px;
      font-size: 13px;
    }

    .part-of-speech {
      color: #1890ff;
      margin-right: 8px;
      font-style: italic;
    }

    .meaning {
      color: #333;
    }

    .panel-footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e8e8e8;
    }

    .action-btn {
      flex: 1;
      padding: 8px 16px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: #e8e8e8;
    }
  `;
  shadowRoot.appendChild(style);

  // 渲染 React 组件
  currentRoot = createRoot(container);
  currentRoot.render(
    <FloatingPanel
      result={result}
      position={position}
      onClose={removePanel}
    />
  );
}

// 移除面板
function removePanel() {
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }
}

// 监听快捷键
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removePanel();
  }
});

console.log('翻译扩展内容脚本已加载');
