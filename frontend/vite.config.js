import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
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

  // ── Bundle Optimization ──────────────────────────────────────────────────
  build: {
    target: 'es2015',
    cssCodeSplit: true,   // Split CSS per chunk for faster per-page loading
    minify: 'esbuild',   // Faster + smaller than default terser
    rollupOptions: {
      output: {
        manualChunks: {
          reactCore: ['react', 'react-dom'],
          reactRouter: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});