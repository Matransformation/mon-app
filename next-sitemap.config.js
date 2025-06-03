// next-sitemap.config.js

module.exports = {
  siteUrl: 'https://matransformation.fr',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/dashboard',
    '/menu',
    '/mon-compte',
    '/mes-favoris',
    '/unauthorized',
    '/verify-email',
    '/success',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: [
          '/admin/*',
          '/dashboard',
          '/menu',
          '/mon-compte',
          '/mes-favoris',
          '/unauthorized',
          '/verify-email',
          '/success',
        ],
      },
    ],
    additionalSitemaps: [
      'https://matransformation.fr/server-sitemap.xml',
    ],
  },
};
