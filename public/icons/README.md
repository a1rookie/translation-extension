# 图标说明

此目录用于存放扩展图标。

## 需要的图标尺寸

请准备以下尺寸的图标（PNG 格式）：

- `icon-16.png` - 16x16 像素
- `icon-32.png` - 32x32 像素
- `icon-48.png` - 48x48 像素
- `icon-128.png` - 128x128 像素

## 设计建议

- 使用简洁的翻译相关图标（如地球、文字、翻译符号等）
- 背景透明
- 清晰可辨，在小尺寸下也能看清
- 使用品牌色：#667eea（紫蓝色渐变）

## 临时方案

在开发阶段，可以使用 Emoji 或在线图标生成器：
- https://www.favicon-generator.org/
- https://favicon.io/

## 快速生成图标

你可以使用以下工具快速生成不同尺寸的图标：

```bash
# 使用 ImageMagick（需要安装）
convert icon.png -resize 16x16 icon-16.png
convert icon.png -resize 32x32 icon-32.png
convert icon.png -resize 48x48 icon-48.png
convert icon.png -resize 128x128 icon-128.png
```

或使用在线工具：https://realfavicongenerator.net/
