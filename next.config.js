// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  
  module.exports = withBundleAnalyzer({
    // ton config existante ici…
    reactStrictMode: true,
    // si tu as déjà un module.exports, fusionne-les
  });
  