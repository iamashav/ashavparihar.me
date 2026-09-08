/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    /* three is ~725 kB minified and cannot be trimmed further — WebGLRenderer reaches most of the
       library whatever is imported. It is deliberately split into its own chunk and loaded after the
       hero paints, so the default 500 kB warning fires on every build for a known reason and would
       hide a real regression in the entry chunk behind it. Raised to just above the known size, so
       it still speaks up if something unexpected lands. */
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
