import React, { useState, useEffect, useRef } from 'react';
import type { TranslationResult } from '../types';

interface FloatingPanelProps {
  result: TranslationResult;
  position: { x: number; y: number };
  onClose: () => void;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = React.memo(
  ({ result, position, onClose }) => {
    const [visible, setVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      console.log('FloatingPanel 组件已挂载，结果:', result);

      // 延迟显示以触发动画
      const timer = setTimeout(() => {
        setVisible(true);
        console.log('面板设置为可见');
      }, 10);

      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      // 点击外部关闭面板
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          handleClose();
        }
      };

      // 使用捕获阶段，确保优先处理
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }, []);

    useEffect(() => {
      // 调整面板位置，确保不超出视口
      if (panelRef.current && visible) {
        const panel = panelRef.current;
        const rect = panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newX = position.x;
        let newY = position.y;

        // 水平方向调整
        if (rect.right > viewportWidth) {
          newX = viewportWidth - rect.width - 10;
        }
        if (newX < 10) {
          newX = 10;
        }

        // 垂直方向调整
        if (rect.bottom > viewportHeight) {
          newY = viewportHeight - rect.height - 10;
        }
        if (newY < 10) {
          newY = 10;
        }

        if (newX !== position.x || newY !== position.y) {
          panel.style.left = `${newX}px`;
          panel.style.top = `${newY}px`;
          console.log('面板位置已调整:', { newX, newY });
        }
      }
    }, [position, visible]);

    const handleClose = () => {
      console.log('关闭面板');
      setVisible(false);
      setTimeout(onClose, 300); // 等待动画完成
    };

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(result.translatedText);
        console.log('翻译结果已复制');
        // 可以添加复制成功提示
        const button = panelRef.current?.querySelector('.copy-btn');
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ 已复制';
          setTimeout(() => {
            button.textContent = originalText;
          }, 1500);
        }
      } catch (err) {
        console.error('复制失败:', err);
      }
    };

    return (
      <div
        ref={panelRef}
        className={`translation-floating-panel ${visible ? 'visible' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="panel-header">
          <div className="lang-info">
            <span className="source-lang">{result.sourceLang}</span>
            <span className="arrow">→</span>
            <span className="target-lang">{result.targetLang}</span>
          </div>
          <button className="close-btn" onClick={handleClose} title="关闭">
            ✕
          </button>
        </div>

        <div className="panel-body">
          <div className="original-text">{result.originalText}</div>
          <div className="translated-text">{result.translatedText}</div>

          {result.detailedMeanings && result.detailedMeanings.length > 0 && (
            <div className="panel-details">
              <div className="details-title">详细释义</div>
              {result.detailedMeanings.map((meaning, index: number) => (
                <div key={index} className="meaning-item">
                  <span className="part-of-speech">{meaning.pos}</span>
                  <span className="meaning">{meaning.meanings?.join('; ') || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-footer">
          <button
            className="action-btn copy-btn"
            onClick={handleCopy}
            title="复制翻译结果"
          >
            📋 复制
          </button>
        </div>
      </div>
    );
  },
  (prev, next) => {
    return prev.result.translatedText === next.result.translatedText;
  }
);
