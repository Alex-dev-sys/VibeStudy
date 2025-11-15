import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
});

const ICON_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stop-color="#ff5f8f"/><stop offset="100%" stop-color="#6b5cff"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><path fill="#fff" d="M20.5 40.6c0-5.7 4-9.1 10.7-9.1h4.3v-1.2c0-2.5-1.3-3.9-3.7-3.9-2 0-3.3.9-3.7 2.5h-6.8c.4-5 4.9-8.7 10.7-8.7 6.5 0 10.5 3.9 10.5 9.9v14.9h-6.7l-.2-2.7c-1.4 2-3.8 3.1-6.7 3.1-5 0-8.4-3.3-8.4-7.8Zm15-1.9v-2.1h-3.8c-2.6 0-4 .9-4 2.8s1.4 2.8 3.5 2.8c2.6 0 4.3-1.5 4.3-3.5Z"/></svg>`
);

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com'),
  title: {
    default: 'VibeStudy | 90-дневный курс программирования',
    template: '%s | VibeStudy'
  },
  description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней. 7 языков, AI-генерация контента, интерактивный редактор кода.',
  keywords: ['программирование', 'обучение', 'курсы', 'junior', 'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'ai', 'онлайн обучение'],
  authors: [{ name: 'VibeStudy Team' }],
  creator: 'VibeStudy',
  publisher: 'VibeStudy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  icons: {
    icon: `data:image/svg+xml,${ICON_SVG}`,
    shortcut: `data:image/svg+xml,${ICON_SVG}`,
    apple: `data:image/svg+xml,${ICON_SVG}`
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName: 'VibeStudy',
    title: 'VibeStudy | 90-дневный курс программирования',
    description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibeStudy - Обучение программированию'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeStudy | 90-дневный курс программирования',
    description: 'Образовательная платформа для изучения программирования с нуля до уровня junior за 90 дней',
    images: ['/og-image.png'],
    creator: '@vibestudy'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ff3b5c'
};

import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-gradient-soft bg-no-repeat bg-cover`}>
        <RealtimeProvider>
          <OnboardingProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-accent focus:text-white">
              Перейти к основному содержимому
            </a>
            {children}
            <Toaster position="bottom-right" />
          </OnboardingProvider>
        </RealtimeProvider>
      </body>
    </html>
  );
}

