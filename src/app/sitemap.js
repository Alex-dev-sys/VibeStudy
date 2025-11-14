export default function sitemap() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com';
  const currentDate = new Date();
  
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/playground`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
  
  const dayPages = Array.from({ length: 90 }, (_, i) => ({
    url: `${SITE_URL}/learn?day=${i + 1}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
  
  return [...staticPages, ...dayPages];
}
