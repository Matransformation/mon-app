// next.config.js

// 1) Bundle analyzer (optionnel)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// 2) Plugin PWA
const withPWA = require('next-pwa')({
  dest: 'public',           // où sera généré sw.js
  register: true,           // auto‐enreg. du SW
  skipWaiting: true,        // activation immédiate des nouvelles versions
  disable: process.env.NODE_ENV === 'development',

  // ─── EXCLUDE JSON from precache ───────────────────
  buildExcludes: [
    /\.json$/,
  ],

  // ─── RUNTIME CACHING ───────────────────────────────
  runtimeCaching: [
    {
      // 1) Toutes les navigations HTML → NetworkFirst
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages',
        networkTimeoutSeconds: 10,
      },
    },
    {
      // 2) JS/CSS Next.js
      urlPattern: ({ url }) =>
        url.pathname.startsWith('/_next/static/') &&
        /\.(js|css)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      // 3) Images locales
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'local-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      // 4) CDN externes (Cloudinary)
      urlPattern: /^https:\/\/res\.cloudinary\.com\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cdn-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 1 jour
        },
      },
    },
    // (pas de règle JSON, pas de fallback html statique)
  ],
});

module.exports = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    images: {
      domains: ['res.cloudinary.com'],
    },
    // … toute autre config Next.js
  })
);
