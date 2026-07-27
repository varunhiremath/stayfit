import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Capacitor's WebView serves assets at the file:// root, so it needs base: '/'.
// GitHub Pages serves under /stayfit/ (the repo name), so the normal build keeps that. Toggle via
// CAPACITOR_BUILD=true npm run build (used by the android-release workflow).
export default defineConfig({
  base: process.env.CAPACITOR_BUILD === 'true' ? '/' : '/stayfit/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: "StayFit",
        short_name: 'StayFit',
        description: 'Plan, train, and recover. A free, offline-first workout planner and tracker.',
        theme_color: '#10B981',
        background_color: '#F4F6F9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/stayfit/',
        scope: '/stayfit/',
        icons: [
          { src: '/stayfit/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/stayfit/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/stayfit/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Purge old precached assets and take control immediately, so a new
        // deploy never leaves a client with a stale index.html pointing at
        // asset hashes that no longer exist (which breaks the whole layout).
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/wger\.de\/api/,
            handler: 'CacheFirst',
            options: { cacheName: 'wger-api', expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-static' },
          },
        ],
      },
    }),
  ],
});
