import React, { useState, useEffect, useRef } from 'react';

interface FloatingButtonProps {
  position: { x: number; y: number };
  text: string;
  onTranslate: () => void;
  onClose: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  position,
  text,
  onTranslate,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('FloatingButton 组件已挂载');
    const timer = setTimeout(() => {
      setVisible(true);
      console.log('悬浮球设置为可见');
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 点击外部关闭悬浮球
    const handleClickOutside = (event: MouseEvent) => {
      if (!buttonRef.current) return;

      try {
        // 在 Shadow DOM 中，需要检查 composedPath
        const path = event.composedPath();
        const clickedInside = path.some(item => {
          // 检查是否为 Node 类型
          if (!(item instanceof Node)) {
            return false;
          }

          // 检查是否点击在悬浮球内部
          return item === buttonRef.current || 
                 (buttonRef.current && buttonRef.current.contains(item));
        });

        if (!clickedInside) {
          console.log('FloatingButton: 检测到外部点击，关闭悬浮球');
          handleClose();
        }
      } catch (error) {
        console.error('FloatingButton: handleClickOutside 错误:', error);
      }
    };

    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, false);
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, []);

  useEffect(() => {
    // 调整位置，确保不超出视口
    if (buttonRef.current && visible) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      if (rect.right > viewportWidth) {
        newX = viewportWidth - rect.width - 10;
      }
      if (newX < 10) {
        newX = 10;
      }

      if (rect.bottom > viewportHeight) {
        newY = viewportHeight - rect.height - 10;
      }
      if (newY < 10) {
        newY = 10;
      }

      if (newX !== position.x || newY !== position.y) {
        button.style.left = `${newX}px`;
        button.style.top = `${newY}px`;
      }
    }
  }, [position, visible]);

  const handleClose = () => {
    console.log('关闭悬浮球');
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleTranslateClick = (event: React.MouseEvent) => {
    console.log('FloatingButton: 点击翻译按钮');
    // 阻止事件冒泡和默认行为
    event.stopPropagation();
    event.preventDefault();

    if (loading) {
      console.log('FloatingButton: 正在翻译中，忽略重复点击');
      return;
    }

    setLoading(true);
    console.log('FloatingButton: 设置 loading 为 true，准备调用 onTranslate');

    // 使用 Promise 处理异步操作
    Promise.resolve(onTranslate())
      .then(() => {
        console.log('FloatingButton: onTranslate 执行成功');
        // 翻译成功后，面板会自动显示，这里不需要重置 loading
      })
      .catch((error) => {
        console.error('FloatingButton: onTranslate 执行失败:', error);
        setLoading(false);
      });
  };

  return (
    <div
      ref={buttonRef}
      className={`translation-floating-button ${visible ? 'visible' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="button-container">
        <button
          className="translate-btn"
          onClick={handleTranslateClick}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={loading}
          title={`翻译: ${text.slice(0, 30)}${text.length > 30 ? '...' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              <span className="btn-text">翻译中...</span>
            </>
          ) : (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="btn-text">翻译</span>
            </>
          )}
        </button>
        <button
          className="close-btn"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClose();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="关闭"
        >
          ✕
        </button>
      </div>
      <div className="word-count">{text.length} 字符</div>
    </div>
  );
};
