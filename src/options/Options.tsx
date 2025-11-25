import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';

interface OptionsConfig {
  // 基础设置
  enableSelection: boolean;
  targetLang: string;
  sourceLang: string;
  
  // API 设置
  apiProvider: 'volcengine' | 'microsoft';
  volcengineAccessKey: string;
  volcengineSecretKey: string;
  microsoftApiKey: string;
  microsoftRegion: string;
  
  // 缓存设置
  cacheEnabled: boolean;
  cacheDuration: number; // 小时
  
  // 高级设置
  maxTextLength: number;
  requestTimeout: number; // 秒
  autoDetectLanguage: boolean;
}

const defaultConfig: OptionsConfig = {
  enableSelection: true,
  targetLang: 'zh',
  sourceLang: 'auto',
  apiProvider: 'volcengine',
  volcengineAccessKey: '',
  volcengineSecretKey: '',
  microsoftApiKey: '',
  microsoftRegion: 'eastasia',
  cacheEnabled: true,
  cacheDuration: 24,
  maxTextLength: 500,
  requestTimeout: 10,
  autoDetectLanguage: true,
};

const Options: React.FC = () => {
  const [config, setConfig] = useState<OptionsConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [cacheStats, setCacheStats] = useState({ size: 0, count: 0 });

  useEffect(() => {
    // 加载配置
    chrome.storage.sync.get(Object.keys(defaultConfig), (data) => {
      setConfig({ ...defaultConfig, ...data });
    });

    // 加载缓存统计
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    const result = await chrome.storage.local.get('translationCache');
    const cache = result.translationCache || {};
    const entries = Object.values(cache);
    const size = JSON.stringify(cache).length;
    setCacheStats({ size, count: entries.length });
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);

    // 验证 API 配置
    if (config.apiProvider === 'volcengine') {
      if (!config.volcengineAccessKey || !config.volcengineSecretKey) {
        setError('请填写火山翻译的 Access Key 和 Secret Key');
        return;
      }
    } else if (config.apiProvider === 'microsoft') {
      if (!config.microsoftApiKey) {
        setError('请填写微软翻译的 API Key');
        return;
      }
    }

    try {
      await chrome.storage.sync.set(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleReset = () => {
    if (confirm('确定要恢复默认设置吗？')) {
      setConfig(defaultConfig);
    }
  };

  const handleClearCache = async () => {
    if (confirm('确定要清空翻译缓存吗？')) {
      await chrome.storage.local.remove('translationCache');
      setCacheStats({ size: 0, count: 0 });
      alert('缓存已清空');
    }
  };

  const handleTestApi = async () => {
    setError('');
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TRANSLATE',
        data: {
          text: 'Hello, world!',
          sourceLang: 'en',
          targetLang: 'zh',
        },
      });

      if (response.error) {
        setError(`API 测试失败: ${response.error}`);
      } else {
        alert(`API 测试成功！\n原文: Hello, world!\n译文: ${response.translatedText}`);
      }
    } catch (err) {
      setError(`API 测试失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const updateConfig = (key: keyof OptionsConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>
          <span className="icon">🌐</span>
          翻译扩展 - 设置
        </h1>
        <p className="subtitle">配置翻译服务和偏好设置</p>
      </header>

      <main className="options-main">
        {/* 基础设置 */}
        <section className="settings-section">
          <h2 className="section-title">基础设置</h2>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={config.enableSelection}
                onChange={(e) => updateConfig('enableSelection', e.target.checked)}
              />
              <span>启用划词翻译</span>
            </label>
            <p className="setting-description">选中文字后自动显示翻译浮窗</p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={config.autoDetectLanguage}
                onChange={(e) => updateConfig('autoDetectLanguage', e.target.checked)}
              />
              <span>自动检测源语言</span>
            </label>
            <p className="setting-description">自动识别要翻译的文本语言</p>
          </div>

          <div className="setting-item">
            <label className="setting-label-inline">
              <span>默认目标语言：</span>
              <select
                value={config.targetLang}
                onChange={(e) => updateConfig('targetLang', e.target.value)}
              >
                <option value="zh">中文</option>
                <option value="en">英文</option>
                <option value="ja">日语</option>
                <option value="ko">韩语</option>
                <option value="fr">法语</option>
                <option value="de">德语</option>
                <option value="es">西班牙语</option>
                <option value="ru">俄语</option>
              </select>
            </label>
          </div>
        </section>

        {/* API 设置 */}
        <section className="settings-section">
          <h2 className="section-title">API 配置</h2>
          
          <div className="setting-item">
            <label className="setting-label-inline">
              <span>翻译服务提供商：</span>
              <select
                value={config.apiProvider}
                onChange={(e) => updateConfig('apiProvider', e.target.value as 'volcengine' | 'microsoft')}
              >
                <option value="volcengine">🔥 火山翻译（推荐）</option>
                <option value="microsoft">🔷 微软翻译</option>
              </select>
            </label>
          </div>

          {config.apiProvider === 'volcengine' ? (
            <div className="api-config">
              <h3 className="api-title">火山翻译配置</h3>
              <div className="input-group">
                <label>Access Key ID:</label>
                <input
                  type="text"
                  placeholder="输入火山翻译 Access Key ID"
                  value={config.volcengineAccessKey}
                  onChange={(e) => updateConfig('volcengineAccessKey', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Secret Access Key:</label>
                <input
                  type="password"
                  placeholder="输入火山翻译 Secret Access Key"
                  value={config.volcengineSecretKey}
                  onChange={(e) => updateConfig('volcengineSecretKey', e.target.value)}
                />
              </div>
              <p className="api-help">
                📖 <a href="https://console.volcengine.com" target="_blank" rel="noopener noreferrer">
                  获取火山翻译 API 密钥
                </a>
              </p>
            </div>
          ) : (
            <div className="api-config">
              <h3 className="api-title">微软翻译配置</h3>
              <div className="input-group">
                <label>API Key:</label>
                <input
                  type="password"
                  placeholder="输入微软翻译 API Key"
                  value={config.microsoftApiKey}
                  onChange={(e) => updateConfig('microsoftApiKey', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>区域:</label>
                <select
                  value={config.microsoftRegion}
                  onChange={(e) => updateConfig('microsoftRegion', e.target.value)}
                >
                  <option value="eastasia">East Asia (香港)</option>
                  <option value="southeastasia">Southeast Asia (新加坡)</option>
                  <option value="eastus">East US</option>
                  <option value="westeurope">West Europe</option>
                </select>
              </div>
              <p className="api-help">
                📖 <a href="https://azure.microsoft.com" target="_blank" rel="noopener noreferrer">
                  获取微软翻译 API 密钥
                </a>
              </p>
            </div>
          )}

          <button className="test-btn" onClick={handleTestApi}>
            🧪 测试 API 连接
          </button>
        </section>

        {/* 缓存设置 */}
        <section className="settings-section">
          <h2 className="section-title">缓存设置</h2>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={config.cacheEnabled}
                onChange={(e) => updateConfig('cacheEnabled', e.target.checked)}
              />
              <span>启用翻译缓存</span>
            </label>
            <p className="setting-description">缓存翻译结果，减少 API 调用次数</p>
          </div>

          <div className="setting-item">
            <label className="setting-label-inline">
              <span>缓存有效期：</span>
              <input
                type="number"
                min="1"
                max="720"
                value={config.cacheDuration}
                onChange={(e) => updateConfig('cacheDuration', parseInt(e.target.value))}
                style={{ width: '80px' }}
              />
              <span>小时</span>
            </label>
          </div>

          <div className="cache-stats">
            <p>📊 缓存统计</p>
            <ul>
              <li>缓存条目: {cacheStats.count} 个</li>
              <li>占用空间: {(cacheStats.size / 1024).toFixed(2)} KB</li>
            </ul>
            <button className="clear-cache-btn" onClick={handleClearCache}>
              🗑️ 清空缓存
            </button>
          </div>
        </section>

        {/* 高级设置 */}
        <section className="settings-section">
          <h2 className="section-title">高级设置</h2>
          
          <div className="setting-item">
            <label className="setting-label-inline">
              <span>最大文本长度：</span>
              <input
                type="number"
                min="100"
                max="5000"
                value={config.maxTextLength}
                onChange={(e) => updateConfig('maxTextLength', parseInt(e.target.value))}
                style={{ width: '100px' }}
              />
              <span>字符</span>
            </label>
            <p className="setting-description">超过此长度的文本将不会被翻译</p>
          </div>

          <div className="setting-item">
            <label className="setting-label-inline">
              <span>请求超时时间：</span>
              <input
                type="number"
                min="5"
                max="60"
                value={config.requestTimeout}
                onChange={(e) => updateConfig('requestTimeout', parseInt(e.target.value))}
                style={{ width: '80px' }}
              />
              <span>秒</span>
            </label>
            <p className="setting-description">API 请求的最长等待时间</p>
          </div>
        </section>

        {/* 操作按钮 */}
        <div className="actions">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
          
          {saved && (
            <div className="success-message">
              ✅ 设置已保存！
            </div>
          )}

          <div className="action-buttons">
            <button className="reset-btn" onClick={handleReset}>
              🔄 恢复默认
            </button>
            <button className="save-btn" onClick={handleSave}>
              💾 保存设置
            </button>
          </div>
        </div>
      </main>

      <footer className="options-footer">
        <p>翻译扩展 v1.0.0 | 
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a> | 
          <a href="#" onClick={(e) => { e.preventDefault(); alert('联系方式: your@email.com'); }}>反馈问题</a>
        </p>
      </footer>
    </div>
  );
};

// 渲染应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Options />);
}
