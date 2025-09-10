import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  root: resolve(__dirname, 'webview'),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist/webview'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'webview/index.html')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'webview/src'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  server: {
    port: 3000
  }
});