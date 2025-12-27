
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
declare const process: { env: { [key: string]: string | undefined } };

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
