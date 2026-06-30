import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the dev server proxies /api to the Express backend so
// the SPA and API share an origin (avoids CORS friction and cookie issues).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
