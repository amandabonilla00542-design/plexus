import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Production API on Render; override with VITE_API_URL in .env for local backend. */
const BACKEND_ORIGIN = (process.env.VITE_API_URL || 'https://plexus-trs8.onrender.com').replace(/\/$/, '')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND_ORIGIN,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
