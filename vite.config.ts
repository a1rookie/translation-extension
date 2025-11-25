import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 自定义插件：构建后移动 HTML 文件到根目录
function moveHtmlPlugin() {
  return {
    name: 'move-html',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist');
      const htmlFiles = ['popup.html', 'options.html'];
      
      htmlFiles.forEach(file => {
        const srcPath = resolve(distPath, 'src', file.replace('.html', ''), file);
        const destPath = resolve(distPath, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      // 删除 src 目录
      const srcDir = resolve(distPath, 'src');
      if (fs.existsSync(srcDir)) {
        fs.rmSync(srcDir, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    moveHtmlPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        },
        {
          src: 'public/icons',
          dest: '.'
        },
        {
          src: 'src/content/content.css',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        content: resolve(__dirname, 'src/content/content.tsx'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name.replace(/^_/, '');
          return `chunks/${name}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.startsWith('_')) {
            return `assets/${name.substring(1)}`;
          }
          // 将 HTML 文件输出到根目录
          if (name.endsWith('.html')) {
            return '[name].[ext]';
          }
          return '[name].[ext]';
        },
      },
    },
  },
});
