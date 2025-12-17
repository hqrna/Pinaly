import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ------------------------------------------------------------------
// Vite Configuration：ビルド設定および開発サーバー（プロキシ）の設定
// ------------------------------------------------------------------

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 開発サーバー設定
  server: {
    host: true, // Docker環境などの外部アクセスを許可
    watch: {
      usePolling: true,
      interval: 300,
    },

    // バックエンドAPIへのプロキシ設定
    proxy: {
      '/api': {
        // Docker Compose上のサービス名 "backend" を指定
        target: 'http://backend:8000', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})