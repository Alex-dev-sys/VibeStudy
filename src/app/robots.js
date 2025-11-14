export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com'}/sitemap.xml`,
  }
}
