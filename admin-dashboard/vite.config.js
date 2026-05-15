import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Dev + `vite preview` — without this, preview/static hosts return 404 for `/api/*`. */
const apiProxy = {
  '/api': {
    target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: apiProxy,
  },
  preview: {
    port: 4174,
    proxy: apiProxy,
  },
})
