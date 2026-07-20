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
        manualChunks(id) {
          // Split React core (smallest possible initial bundle)
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Split routing away from core
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'react-router';
          }
          // Split SEO/helmet
          if (id.includes('node_modules/react-helmet')) {
            return 'react-helmet';
          }
          // All other node_modules go into a vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});