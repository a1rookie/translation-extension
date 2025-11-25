import * as esbuild from 'esbuild';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 打包 content script 为 IIFE 格式
await esbuild.build({
  entryPoints: [resolve(__dirname, '../src/content/content.tsx')],
  bundle: true,
  outfile: resolve(__dirname, '../dist/content.js'),
  format: 'iife',
  target: ['chrome96'],
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
  minify: true,
  sourcemap: false,
});

console.log('✅ Content script built successfully');
