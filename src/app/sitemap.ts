import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${SITE_URL}/playground`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${SITE_URL}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7
    }
  ];
  
  // Dynamic pages for each day (1-90)
  const dayPages: MetadataRoute.Sitemap = Array.from({ length: 90 }, (_, i) => ({
    url: `${SITE_URL}/learn?day=${i + 1}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));
  
  return [...staticPages, ...dayPages];
}
