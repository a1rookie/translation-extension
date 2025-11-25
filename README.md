# 翻译扩展 - Translation Extension

🌐 强大的浏览器翻译扩展，支持划词翻译、全文翻译和多种翻译API。

## ✨ 功能特性

- **划词翻译**：选中文本即可显示翻译浮窗
- **快捷翻译**：点击扩展图标快速翻译
- **多API支持**：
  - 🔥 火山翻译（推荐，200万字符/月免费额度）
  - 🔷 微软翻译（200万字符/月免费额度）
- **智能缓存**：自动缓存翻译结果，节省API调用
- **多语言支持**：支持中、英、日、韩、法、德、西、俄等100+语言
- **自动语言检测**：智能识别源语言
- **现代化界面**：美观的渐变UI设计

## 📦 安装

### 开发环境安装

1. **克隆或下载项目**
```bash
cd translation-extension
```

2. **安装依赖**
```bash
npm install
```

3. **构建扩展**
```bash
npm run build
```

4. **加载到浏览器**

**Chrome/Edge:**
- 打开 `chrome://extensions/` 或 `edge://extensions/`
- 启用「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择项目中的 `dist` 目录

**Firefox:**
- 打开 `about:debugging#/runtime/this-firefox`
- 点击「临时加载附加组件」
- 选择 `dist` 目录中的 `manifest.json`

## 🔧 配置

### 获取 API 密钥

#### 火山翻译（推荐）

1. 访问 [火山引擎控制台](https://console.volcengine.com)
2. 注册并完成实名认证
3. 开通「机器翻译」服务
4. 在「访问密钥」中创建密钥
5. 复制 Access Key ID 和 Secret Access Key

#### 微软翻译

1. 访问 [Azure Portal](https://azure.microsoft.com)
2. 创建「Translator」资源
3. 选择免费层 F0（200万字符/月）
4. 在资源页面获取 API Key 和区域

### 配置扩展

1. 点击扩展图标
2. 点击右上角 ⚙️ 图标进入设置
3. 选择翻译服务提供商
4. 填入对应的 API 密钥
5. 点击「测试 API 连接」验证
6. 点击「保存设置」

## 📖 使用指南

### 划词翻译

1. 在任何网页选中文本
2. 自动弹出翻译浮窗
3. 点击「复制」保存结果
4. 点击「×」关闭浮窗

### 快捷翻译

1. 点击扩展图标打开弹窗
2. 输入要翻译的文本
3. 点击「翻译」按钮
4. 查看翻译结果并复制

### 快捷键（可自定义）

- `Alt+T`：打开翻译弹窗
- `Alt+S`：翻译选中文本

## 🛠️ 开发

### 项目结构

```
translation-extension/
├── src/
│   ├── api/              # API 调用层
│   │   ├── volcengine.ts # 火山翻译 API
│   │   ├── microsoft.ts  # 微软翻译 API
│   │   └── translator.ts # 翻译统一接口
│   ├── background/       # 后台服务
│   │   └── service-worker.ts
│   ├── content/          # 内容脚本
│   │   ├── content.tsx   # 主入口
│   │   ├── FloatingPanel.tsx # 浮动面板
│   │   └── *.css
│   ├── popup/            # 弹窗界面
│   │   ├── popup.html
│   │   ├── Popup.tsx
│   │   └── popup.css
│   ├── options/          # 设置页面
│   │   ├── options.html
│   │   ├── Options.tsx
│   │   └── options.css
│   ├── utils/            # 工具函数
│   │   ├── cache.ts      # 缓存管理
│   │   ├── storage.ts    # 存储管理
│   │   └── language.ts   # 语言检测
│   └── types/            # TypeScript 类型
│       └── index.ts
├── public/               # 静态资源
│   └── icons/            # 图标
├── manifest.json         # 扩展配置
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

### 开发命令

```bash
# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 调试技巧

**调试 Popup/Options:**
- 右键扩展图标 → 检查弹出内容

**调试 Content Script:**
- 打开目标网页的开发者工具
- 在 Console 中查看日志

**调试 Background:**
- 访问 `chrome://extensions/`
- 点击扩展的「Service Worker」链接

## 🔒 隐私说明

- 扩展仅在用户主动翻译时发送数据到翻译 API
- API 密钥存储在浏览器本地，不会上传到任何服务器
- 缓存数据仅保存在本地
- 不收集任何用户数据或浏览历史

## 📝 常见问题

### Q: 为什么翻译失败？

A: 请检查：
1. API 密钥是否正确配置
2. 网络连接是否正常
3. 是否超出免费额度
4. 在设置中点击「测试 API 连接」

### Q: 如何切换翻译服务？

A: 在设置页面选择不同的翻译服务提供商，配置相应的 API 密钥。

### Q: 缓存有什么用？

A: 缓存可以：
- 加快翻译速度
- 减少 API 调用次数
- 节省免费额度

### Q: 支持哪些浏览器？

A: 支持所有基于 Chromium 的浏览器（Chrome、Edge、Brave等）和 Firefox。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [火山翻译文档](https://www.volcengine.com/docs/4640/65067)
- [微软翻译文档](https://docs.microsoft.com/azure/cognitive-services/translator/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)

---

**享受翻译！** 🎉
