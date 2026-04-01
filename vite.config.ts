import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'tools/deeplink': resolve(__dirname, 'src/tools/deeplink/index.html'),
        'tools/base64': resolve(__dirname, 'src/tools/base64/index.html')
      }
    }
  },
  publicDir: 'public'
})
