import { createRoot } from 'react-dom/client';
import { FloatingPanel } from './FloatingPanel';
import { FloatingButton } from './FloatingButton';
import type { TranslationResult } from '../types';

let currentPanel: HTMLDivElement | null = null;
let currentRoot: ReturnType<typeof createRoot> | null = null;
let currentSelectedText = '';
let currentPosition = { x: 0, y: 0 };
let isTranslating = false; // 添加翻译状态标志

// 监听文本选择
document.addEventListener('mouseup', async () => {
  // 如果正在翻译，不处理新的选择
  if (isTranslating) {
    console.log('正在翻译中，忽略新的选择');
    return;
  }

  // 等待选择完成
  setTimeout(async () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString()?.trim() || '';

    if (!selectedText || selectedText.length === 0) {
      removePanel();
      return;
    }

    // 如果选中的文本和当前文本相同，并且面板已存在，不重复创建
    if (selectedText === currentSelectedText && currentPanel) {
      console.log('文本未变化，跳过');
      return;
    }

    // 检查是否启用了划词翻译（默认启用）
    const config = await chrome.storage.sync.get(['enableSelection']);
    console.log('划词翻译配置:', config);

    // 如果 enableSelection 明确设置为 false 才禁用
    if (config.enableSelection === false) {
      console.log('划词翻译已禁用');
      return;
    }

    // 检查文本长度限制
    if (selectedText.length > 500) {
      console.warn('选中文本过长，请选择少于 500 字符的文本');
      return;
    }

    // 获取选中文本的位置（使用选区的边界矩形）
    if (!selection || selection.rangeCount === 0) {
      console.warn('无法获取选区信息');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 计算悬浮球位置：优先显示在选中文本下方，如果空间不够则显示在上方
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 使用视口坐标（因为 position: fixed）
    let posX = rect.left;
    let posY: number;

    // 如果下方空间充足（大于 100px），显示在下方
    if (spaceBelow > 100) {
      posY = rect.bottom + 8;
      console.log('悬浮球显示在选中文本下方');
    } 
    // 否则如果上方空间充足，显示在上方
    else if (spaceAbove > 100) {
      posY = rect.top - 70; // 预留悬浮球高度（约60px）+ 间距
      console.log('悬浮球显示在选中文本上方');
    } 
    // 如果上下空间都不够，显示在右侧
    else {
      posY = rect.top;
      posX = rect.right + 10;
      console.log('悬浮球显示在选中文本右侧');
    }

    // 确保不超出左边界
    if (posX < 10) {
      posX = 10;
    }

    // 确保不超出右边界（预估悬浮球宽度约200px）
    if (posX + 200 > viewportWidth) {
      posX = viewportWidth - 210;
    }

    // 保存当前位置
    currentPosition = {
      x: posX,
      y: posY,
    };

    console.log('准备显示悬浮球');
    console.log('- 选中文本:', selectedText);
    console.log('- 选区矩形 (视口坐标):', { 
      left: rect.left.toFixed(1), 
      top: rect.top.toFixed(1), 
      right: rect.right.toFixed(1), 
      bottom: rect.bottom.toFixed(1),
      width: rect.width.toFixed(1),
      height: rect.height.toFixed(1)
    });
    console.log('- 视口尺寸:', { width: viewportWidth, height: viewportHeight });
    console.log('- 可用空间:', { above: spaceAbove.toFixed(1), below: spaceBelow.toFixed(1) });
    console.log('- 悬浮球位置:', { x: posX.toFixed(1), y: posY.toFixed(1) });
    showFloatingButton(selectedText, currentPosition);
  }, 100);
});

// 显示悬浮球
function showFloatingButton(text: string, position: { x: number; y: number }) {
  console.log('showFloatingButton 被调用，文本:', text);

  // 先保存文本，再移除面板（避免 removePanel 清空文本）
  currentSelectedText = text;
  console.log('强制保存 currentSelectedText:', currentSelectedText);

  // 移除现有面板（但不清空 currentSelectedText）
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }

  // 创建容器
  currentPanel = document.createElement('div');
  currentPanel.id = 'translation-extension-root';
  currentPanel.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(currentPanel);

  // 创建 Shadow DOM
  const shadowRoot = currentPanel.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  // 注入悬浮球样式
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
    }

    .translation-floating-button {
      position: fixed;
      z-index: 2147483647;
      opacity: 0;
      transform: translateY(-10px) scale(0.8);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
    }

    .translation-floating-button.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .button-container {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 8px 12px;
      border-radius: 24px;
      box-shadow: 
        0 8px 24px rgba(102, 126, 234, 0.35),
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      backdrop-filter: blur(10px);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 
          0 8px 24px rgba(102, 126, 234, 0.35),
          0 2px 8px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }
      50% {
        box-shadow: 
          0 8px 32px rgba(102, 126, 234, 0.5),
          0 4px 16px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      }
    }

    .translate-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 18px;
      padding: 6px 14px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }

    .translate-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .translate-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .translate-btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .translate-btn .icon {
      width: 16px;
      height: 16px;
      stroke-width: 2.5;
    }

    .translate-btn .btn-text {
      line-height: 1;
    }

    .loading-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      line-height: 1;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1) rotate(90deg);
    }

    .close-btn:active {
      transform: scale(0.9) rotate(90deg);
    }

    .word-count {
      margin-top: 8px;
      padding: 4px 8px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 4px;
      font-size: 11px;
      color: #6366f1;
      text-align: center;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .usage-stats {
      margin-top: 8px;
      padding: 6px 10px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border-radius: 6px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .provider-name {
      font-size: 10px;
      color: #8b5cf6;
      font-weight: 600;
      text-align: center;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .usage-amount {
      font-size: 11px;
      color: #6366f1;
      text-align: center;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
  `;
  shadowRoot.appendChild(style);

  console.log('悬浮球样式已注入');

  // 渲染悬浮球组件
  currentRoot = createRoot(container);
  currentRoot.render(
    <FloatingButton
      position={position}
      text={text}
      onTranslate={() => handleTranslate()}
      onClose={removePanel}
    />
  );
}

// 处理翻译请求
async function handleTranslate(): Promise<void> {
  // 保存要翻译的文本（防止在翻译过程中被清空）
  const textToTranslate = currentSelectedText;

  console.log('=== handleTranslate 开始 ===');
  console.log('要翻译的文本:', textToTranslate);
  console.log('文本长度:', textToTranslate?.length);
  console.log('当前翻译状态:', isTranslating);

  // 检查文本是否为空
  if (!textToTranslate || textToTranslate.trim().length === 0) {
    console.error('❌ 翻译失败: 文本为空');
    console.error('currentSelectedText 值:', currentSelectedText);
    isTranslating = false;
    throw new Error('翻译文本为空');
  }

  // 设置翻译状态
  isTranslating = true;
  console.log('✅ 设置 isTranslating = true');

  try {
    console.log('📤 发送翻译请求到 background...');
    const response = await chrome.runtime.sendMessage({
      type: 'TRANSLATE',
      text: textToTranslate,
      sourceLang: 'auto',
      targetLang: 'zh',
    });

    console.log('📥 收到翻译响应:', response);

    if (!response) {
      console.error('❌ 翻译失败: 无响应');
      isTranslating = false;
      throw new Error('翻译服务无响应');
    }

    if (response.error) {
      console.error('❌ 翻译失败:', response.error);
      isTranslating = false;
      throw new Error(response.error);
    }

    if (response.success && response.result) {
      console.log('✅ 翻译成功，准备显示翻译面板');
      showTranslationPanel(response.result, currentPosition);
      // 翻译面板显示后，重置翻译状态
      isTranslating = false;
      console.log('✅ 重置 isTranslating = false');
      console.log('=== handleTranslate 完成 ===');
    } else {
      console.error('❌ 翻译失败: 响应格式错误', response);
      isTranslating = false;
      throw new Error('翻译响应格式错误');
    }
  } catch (error) {
    console.error('❌ 翻译请求异常:', error);
    isTranslating = false;
    console.log('=== handleTranslate 异常结束 ===');
    throw error; // 重新抛出错误，让调用者知道失败了
  }
}

// 显示翻译面板
function showTranslationPanel(result: TranslationResult, position: { x: number; y: number }) {
  console.log('showTranslationPanel 被调用');

  // 清除悬浮球（但保留文本和状态）
  clearPanel();

  // 创建容器
  currentPanel = document.createElement('div');
  currentPanel.id = 'translation-extension-root';
  currentPanel.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(currentPanel);

  // 创建 Shadow DOM
  const shadowRoot = currentPanel.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  // 注入翻译面板样式
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
    }

    .translation-floating-panel {
      position: fixed;
      min-width: 320px;
      max-width: 480px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
      border-radius: 16px;
      box-shadow: 
        0 12px 40px rgba(102, 126, 234, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(102, 126, 234, 0.1);
      padding: 0;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      backdrop-filter: blur(10px);
      overflow: hidden;
    }

    .translation-floating-panel.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      border-radius: 16px 16px 0 0;
    }

    .lang-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .source-lang,
    .target-lang {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 8px;
      border-radius: 6px;
      backdrop-filter: blur(10px);
    }

    .arrow {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin: 0;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      font-size: 20px;
      color: white;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
      padding: 0;
      line-height: 1;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .close-btn:active {
      transform: scale(0.95);
    }

    .panel-body {
      padding: 20px;
    }

    .original-text {
      font-size: 13px;
      line-height: 1.6;
      color: #666;
      margin-bottom: 12px;
      padding: 12px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }

    .translated-text {
      font-size: 16px;
      line-height: 1.7;
      color: #1a1a1a;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .panel-details {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(102, 126, 234, 0.1);
    }

    .details-title {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meaning-item {
      margin-bottom: 10px;
      padding: 8px 12px;
      background: rgba(102, 126, 234, 0.03);
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.6;
    }

    .part-of-speech {
      display: inline-block;
      padding: 2px 8px;
      background: #667eea;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 8px;
      font-style: normal;
    }

    .meaning {
      color: #333;
    }

    .panel-footer {
      padding: 16px 20px;
      background: rgba(102, 126, 234, 0.03);
      border-top: 1px solid rgba(102, 126, 234, 0.1);
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .action-btn {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .action-btn:hover {
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 480px) {
      .translation-floating-panel {
        max-width: 90vw;
      }
    }
  `;
  shadowRoot.appendChild(style);

  console.log('翻译面板样式已注入');

  // 渲染翻译面板
  currentRoot = createRoot(container);
  currentRoot.render(
    <FloatingPanel
      result={result}
      position={position}
      onClose={removePanel}
    />
  );
}

// 移除面板（用于用户主动关闭）
function removePanel() {
  console.log('removePanel 被调用（用户关闭）');
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }

  // 清空状态
  currentSelectedText = '';
  isTranslating = false;
  console.log('已清空状态');
}

// 清除面板但保留文本（用于切换面板）
function clearPanel() {
  console.log('clearPanel 被调用（切换面板）');
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentPanel) {
    currentPanel.remove();
    currentPanel = null;
  }
  // 不清空 currentSelectedText 和 isTranslating
}

// 监听快捷键
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removePanel();
  }
});

console.log('翻译扩展内容脚本已加载');
