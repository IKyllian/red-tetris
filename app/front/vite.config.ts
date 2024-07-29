import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from 'node:path'

const pwd = process.cwd()
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'front': path.resolve(__dirname, './src')
    },
    dedupe: ['react'],
  },
  test: {
    include: [`${pwd}/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`],
    globals: true,
    environment: 'jsdom', // Use jsdom for DOM testing,
    setupFiles: './__tests__/vitest.setup.ts',
  },
})