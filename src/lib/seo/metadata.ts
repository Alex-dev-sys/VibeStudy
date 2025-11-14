import type { Metadata } from 'next';

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  structuredData?: object;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com';
const SITE_NAME = 'VibeStudy';
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * Generate page-specific metadata for Next.js
 */
export function generatePageMetadata(page: string, params?: any): Metadata {
  const metadata = getPageMetadata(page, params);
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: generateOpenGraphTags(metadata),
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [metadata.ogImage || DEFAULT_OG_IMAGE],
      creator: '@vibestudy'
    },
    alternates: {
      canonical: metadata.canonical || `${SITE_URL}${getPagePath(page, params)}`
    },
    other: {
      'structured-data': JSON.stringify(metadata.structuredData || generateStructuredData(page))
    }
  };
}

/**
 * Get metadata for specific page
 */
function getPageMetadata(page: string, params?: any): PageMetadata {
  switch (page) {
    case 'home':
      return {
        title: `${SITE_NAME} | 90-дневный курс программирования с нуля до Junior`,
        description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней. 7 языков, AI-генерация контента, интерактивный редактор кода.',
        keywords: ['программирование', 'обучение', 'курсы', 'junior', 'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'ai', 'онлайн обучение'],
        ogImage: `${SITE_URL}/og-home.png`
      };
    
    case 'learn':
      const day = params?.day || 1;
      return {
        title: `День ${day} | Обучение | ${SITE_NAME}`,
        description: `Изучайте программирование - День ${day} из 90. Интерактивные задания, теория и практика с AI-поддержкой.`,
        keywords: ['программирование день ' + day, 'обучение программированию', 'интерактивные задания', 'практика кода'],
        ogImage: `${SITE_URL}/og-learn.png`
      };
    
    case 'playground':
      return {
        title: `Playground | Песочница для кода | ${SITE_NAME}`,
        description: 'Экспериментируйте с кодом в интерактивной песочнице. Поддержка 7 языков программирования, сохранение сниппетов, шаринг кода.',
        keywords: ['playground', 'песочница', 'редактор кода', 'онлайн ide', 'code editor'],
        ogImage: `${SITE_URL}/og-playground.png`
      };
    
    case 'profile':
      return {
        title: `Профиль | ${SITE_NAME}`,
        description: 'Ваш профиль обучения: статистика, достижения, прогресс и настройки.',
        keywords: ['профиль', 'статистика обучения', 'достижения', 'прогресс'],
        ogImage: `${SITE_URL}/og-profile.png`
      };
    
    case 'analytics':
      return {
        title: `Аналитика | ${SITE_NAME}`,
        description: 'Детальная аналитика вашего обучения: скорость прогресса, мастерство по темам, слабые места и рекомендации.',
        keywords: ['аналитика обучения', 'статистика', 'прогресс', 'рекомендации'],
        ogImage: `${SITE_URL}/og-analytics.png`
      };
    
    default:
      return {
        title: SITE_NAME,
        description: 'Образовательная платформа для изучения программирования',
        keywords: ['программирование', 'обучение']
      };
  }
}

/**
 * Get page path for canonical URL
 */
function getPagePath(page: string, params?: any): string {
  switch (page) {
    case 'home':
      return '/';
    case 'learn':
      return params?.day ? `/learn?day=${params.day}` : '/learn';
    case 'playground':
      return '/playground';
    case 'profile':
      return '/profile';
    case 'analytics':
      return '/analytics';
    default:
      return '/';
  }
}

/**
 * Generate Open Graph tags
 */
export function generateOpenGraphTags(metadata: PageMetadata): Metadata['openGraph'] {
  return {
    type: 'website',
    siteName: SITE_NAME,
    title: metadata.title,
    description: metadata.description,
    url: metadata.canonical || SITE_URL,
    images: [
      {
        url: metadata.ogImage || DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: metadata.title
      }
    ],
    locale: 'ru_RU',
    alternateLocale: ['en_US']
  };
}

/**
 * Generate structured data (JSON-LD) for SEO
 */
export function generateStructuredData(type: 'Course' | 'WebPage' | 'Organization' | string): object {
  const baseUrl = SITE_URL;
  
  switch (type) {
    case 'Course':
    case 'home':
      return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: '90-дневный курс программирования',
        description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней',
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: baseUrl
        },
        educationalLevel: 'Beginner to Junior',
        coursePrerequisites: 'Нет предварительных требований',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT90D',
          instructor: {
            '@type': 'Organization',
            name: SITE_NAME
          }
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'RUB',
          availability: 'https://schema.org/InStock'
        },
        inLanguage: ['ru', 'en'],
        teaches: [
          'Python',
          'JavaScript',
          'TypeScript',
          'Java',
          'C++',
          'C#',
          'Go'
        ]
      };
    
    case 'WebPage':
    case 'learn':
    case 'playground':
    case 'profile':
    case 'analytics':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: SITE_NAME,
        url: baseUrl,
        description: 'Образовательная платформа для изучения программирования',
        inLanguage: 'ru',
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: baseUrl
        }
      };
    
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней',
        sameAs: [
          'https://github.com/vibestudy',
          'https://twitter.com/vibestudy'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: 'support@vibestudy.com'
        }
      };
    
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: baseUrl
      };
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`
    }))
  };
}
