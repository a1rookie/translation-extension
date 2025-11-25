import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
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
          src: 'public/popup.html',
          dest: '.'
        },
        {
          src: 'public/options.html',
          dest: '.'
        },
        {
          src: 'src/popup/popup.css',
          dest: '.'
        },
        {
          src: 'src/options/options.css',
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
        popup: resolve(__dirname, 'src/popup/Popup.tsx'),
        options: resolve(__dirname, 'src/options/Options.tsx'),
        content: resolve(__dirname, 'src/content/content.tsx'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name].[ext]',
        // Content script 必须内联所有依赖（IIFE 格式）
        inlineDynamicImports: false,
        manualChunks: (id) => {
          // content.tsx 相关的所有代码不分离chunk
          if (id.includes('src/content')) {
            return undefined; // 不分离，内联到 content.js
          }
          // 其他的 React 库可以共享
          if (id.includes('node_modules/react')) {
            return 'client';
          }
        },
      },
    },
  },
});
