import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://110.92.72.98:5002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
