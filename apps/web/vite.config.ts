import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@adminhub/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  // Dev: proxy /api → local Express. Production: VITE_API_URL is set in Vercel env vars.
  server: {
    port: 7420,
    proxy: command === 'serve' ? {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    } : undefined,
  },
}));
