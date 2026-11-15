import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // e2e tests point this at their own backend (see playwright.config.js)
      '/api': process.env.API_TARGET ?? 'http://127.0.0.1:8000',
    },
  },
})
