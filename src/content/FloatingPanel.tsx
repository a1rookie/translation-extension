import React, { useState, useEffect, useRef } from 'react';
import type { TranslationResult } from '../types';

interface FloatingPanelProps {
  result: TranslationResult;
  position: { x: number; y: number };
  onClose: () => void;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = React.memo(
  ({ result, position, onClose }) => {
    const [visible, setVisible] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // 点击外部关闭面板
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          handleClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleClose = () => {
      setVisible(false);
      setTimeout(onClose, 300); // 等待动画完成
    };

    if (!visible) return null;

    return (
      <div
        ref={panelRef}
        className={`translation-floating-panel ${visible ? 'visible' : ''}`}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 2147483647,
        }}
      >
        <div className="panel-header">
          <span className="source-lang">{result.sourceLang}</span>
          <span className="arrow">→</span>
          <span className="target-lang">{result.targetLang}</span>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="panel-body">
          <div className="original-text">{result.originalText}</div>
          <div className="translated-text">{result.translatedText}</div>
        </div>

        {result.detailedMeanings && result.detailedMeanings.length > 0 && (
          <div className="panel-details">
            <div className="details-title">详细释义</div>
            {result.detailedMeanings.map((meaning, index: number) => (
              <div key={index} className="meaning-item">
                <span className="part-of-speech">{meaning.pos}</span>
                <span className="meaning">{meaning.meanings.join('; ')}</span>
              </div>
            ))}
          </div>
        )}

        <div className="panel-footer">
          <button
            className="action-btn"
            onClick={() => {
              navigator.clipboard.writeText(result.translatedText);
              // 可以添加复制成功提示
            }}
          >
            复制
          </button>
          <button
            className="action-btn"
            onClick={() => {
              chrome.runtime.sendMessage({
                type: 'SAVE_TO_HISTORY',
                data: result,
              });
            }}
          >
            保存
          </button>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return prev.result.translatedText === next.result.translatedText;
  }
);
