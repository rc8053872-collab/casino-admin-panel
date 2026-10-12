import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://casino-baac-env.eba-9kvg9eap.ap-southeast-2.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})

