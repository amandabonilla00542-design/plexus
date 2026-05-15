import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Production API on Render; override with VITE_API_BASE_URL in .env for local backend. */
const BACKEND_ORIGIN = (process.env.VITE_API_BASE_URL || 'https://plexus-trs8.onrender.com').replace(
  /\/$/,
  ''
)

/** Dev + `vite preview` — without this, preview/static hosts return 404 for `/api/*`. */
const apiProxy = {
  '/api': {
    target: BACKEND_ORIGIN,
    changeOrigin: true,
    secure: true,
  },
}

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(BACKEND_ORIGIN),
  },
  server: {
    port: 5174,
    proxy: apiProxy,
  },
  preview: {
    port: 4174,
    proxy: apiProxy,
  },
})
