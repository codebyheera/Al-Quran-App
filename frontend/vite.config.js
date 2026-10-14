import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// Source maps for Sentry: with SENTRY_AUTH_TOKEN set (Vercel build env), the
// build emits hidden source maps, uploads them to Sentry so errors show the
// real file/line, then deletes the .map files so they're never deployed.
// Without the token (local builds), no maps are generated or uploaded.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'al-quran-hub',
      project: 'al-quran-hub-frontend',
      authToken: sentryAuthToken,
      disable: !sentryAuthToken,
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
      telemetry: false,
    }),
  ],

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
    sourcemap: sentryAuthToken ? 'hidden' : false, // see sentryVitePlugin above
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