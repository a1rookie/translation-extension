import React, { useState, useCallback } from 'react';
import type { TranslationResult, SupportedLanguage } from '../types';

export const Popup: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('auto');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('zh');

  const handleTranslate = useCallback(async () => {
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
        data: {
          text: inputText,
          sourceLang,
          targetLang,
        },
      });

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError('翻译失败，请检查网络连接或 API 配置');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.translatedText);
      // 可以添加复制成功提示
    }
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>翻译助手</h1>
        <button
          className="settings-btn"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          ⚙️
        </button>
      </header>

      <div className="language-selector">
        <select
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

        <button className="swap-btn" onClick={handleSwapLanguages}>
          ⇄
        </button>

        <select
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

      <div className="input-area">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入要翻译的文本..."
          rows={6}
        />
        <button
          className="translate-btn"
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
        >
          {loading ? '翻译中...' : '翻译'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-area">
          <div className="result-header">
            <span className="result-title">翻译结果</span>
            <button className="copy-btn" onClick={handleCopy}>
              📋 复制
            </button>
          </div>
          <div className="result-text">{result.translatedText}</div>

          {result.detailedMeanings && result.detailedMeanings.length > 0 && (
            <div className="detailed-meanings">
              <div className="meanings-title">详细释义</div>
              {result.detailedMeanings.map((meaning, index: number) => (
                <div key={index} className="meaning-item">
                  <span className="part-of-speech">{meaning.pos}</span>
                  <span className="meanings">
                    {meaning.meanings?.join(', ') || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
