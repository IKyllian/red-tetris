import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { loadEnv } from 'vite';

const pwd = process.cwd()
// https://vitejs.dev/config/
// export default defineConfig({
//   base: './',
//   plugins: [react()],
//   resolve: {
//     alias: {
//       'front': path.resolve(__dirname, './src')
//     },
//     dedupe: ['react'],
//   },
//   test: {
//     include: [`${pwd}/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`],
//     globals: true,
//     environment: 'jsdom', // Use jsdom for DOM testing,
//     setupFiles: './__tests__/vitest.setup.ts',
//   },
// })

export default defineConfig(({ mode }) => {
  // Charger le .env à la racine du projet
  const rootDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, rootDir);

  return {
    base: './',
    plugins: [react()],
    define: {
      'process.env': env
    },
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
  };
});