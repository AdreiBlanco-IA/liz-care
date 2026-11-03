import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // The shared demo runs in a sandboxed frame that blocks module scripts, so it ships as a classic IIFE bundle.
  build: mode === 'demo' ? { rollupOptions: { output: { format: 'iife' } }, modulePreload: false } : undefined,
}))
