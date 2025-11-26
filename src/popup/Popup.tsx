import React, { useState, useCallback } from 'react';
import type { TranslationResult, SupportedLanguage } from '../types';

// 现代化 Popup 组件
export const Popup: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('auto');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('zh');

  const doTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('请输入要翻译的文本');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TRANSLATE',
        text: inputText.trim(),
        sourceLang,
        targetLang,
      });
      if (!response?.success) {
        setError(response?.error || '翻译失败');
      } else {
        setResult(response.result);
      }
    } catch (err) {
      setError('翻译失败，请检查网络或 API 配置');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  const handleSwap = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
  };

  const handleCopy = () => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !loading) {
      doTranslate();
    }
  };

  return (
    <div className="popup">
      <header className="header">
        <div className="title">
          <span className="logo">🌐</span>
          <span>翻译助手</span>
        </div>
        <button
          className="icon-btn"
          aria-label="打开设置"
          title="打开设置"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          ⚙️
        </button>
      </header>

      <main className="main">
        <div className="lang-row">
          <select
            className="select"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as SupportedLanguage)}
          >
            <option value="auto">自动检测</option>
            <option value="zh">中文</option>
            <option value="en">英语</option>
            <option value="ja">日语</option>
            <option value="ko">韩语</option>
            <option value="fr">法语</option>
            <option value="de">德语</option>
            <option value="es">西班牙语</option>
            <option value="ru">俄语</option>
          </select>

          <button
            className="swap-btn"
            title="切换语言"
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
          >
            <span className={loading ? 'spin' : ''}>⇄</span>
          </button>

          <select
            className="select"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
          >
            <option value="zh">中文</option>
            <option value="en">英语</option>
            <option value="ja">日语</option>
            <option value="ko">韩语</option>
            <option value="fr">法语</option>
            <option value="de">德语</option>
            <option value="es">西班牙语</option>
            <option value="ru">俄语</option>
          </select>
        </div>

        <div className="card">
          <textarea
            className="textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入要翻译的文本…（Ctrl/⌘ + Enter 快速翻译）"
            rows={6}
          />
          <div className="actions">
            <button
              className="btn ghost"
              onClick={handleClear}
              disabled={!inputText && !result && !error}
            >
              清空
            </button>
            <button
              className="btn primary"
              onClick={doTranslate}
              disabled={loading || !inputText.trim()}
            >
              {loading ? '翻译中…' : '翻译'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="card result">
            <div className="result-header">
              <span className="badge">翻译结果</span>
              <div className="result-actions">
                <button className="chip" onClick={handleCopy}>
                  📋 复制
                </button>
              </div>
            </div>
            <div className="result-text">{result.translatedText}</div>

            {result.detailedMeanings && result.detailedMeanings.length > 0 && (
              <div className="details">
                <div className="details-title">详细释义</div>
                {result.detailedMeanings.map((m, i) => (
                  <div key={i} className="meaning-item">
                    <span className="pos">{m.pos}</span>
                    <span className="meaning">{m.meanings?.join('，') || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <span className="hint">小贴士：Ctrl/⌘ + Enter 可快速翻译</span>
      </footer>
    </div>
  );
};

// 入口点：渲染到 DOM
import { createRoot } from 'react-dom/client';
import './popup.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Popup />);
}
