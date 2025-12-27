
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相對路徑，確保部署在子目錄時資源路徑正確
  define: {
    // 讓 process.env.API_KEY 在構建時能被替換
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
