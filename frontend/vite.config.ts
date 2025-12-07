import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Dockerの外からアクセスするために必須
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