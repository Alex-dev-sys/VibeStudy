import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.ru'),
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
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg'
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
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AutoMigrationGate } from '@/components/migration/AutoMigrationGate';
import { Navigation } from '@/components/layout/Navigation';
import { FloatingButtonsContainer } from '@/components/layout/FloatingButtonsContainer';
import { AIAssistantProvider } from '@/components/ai-assistant/AIAssistantContext';
import { AIAssistantContainer } from '@/components/ai-assistant';
import { Toaster } from 'sonner';
import { AriaAnnouncer } from '@/lib/accessibility/aria-announcer';
import { SkipLinks } from '@/lib/accessibility/skip-links';
import { CosmicBackground } from '@/components/layout/CosmicBackground';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        {/* Resource hints for faster external API connections */}
        <link rel="preconnect" href="https://api.gptlama.ru" />
        <link rel="dns-prefetch" href="https://api.gptlama.ru" />
        <link rel="preconnect" href="https://emkc.org" />
        <link rel="dns-prefetch" href="https://emkc.org" />
      </head>
      <body className={`${inter.className} bg-gradient-soft bg-no-repeat bg-cover`}>
        <ErrorBoundary>
          <RealtimeProvider>
            <OnboardingProvider>
              {/* Accessibility Components */}
              <AriaAnnouncer />
              <SkipLinks />

              {/* Global Background */}
              <CosmicBackground />

              <AutoMigrationGate />
              <Navigation />
              <AIAssistantProvider>
                <FloatingButtonsContainer />
                <AIAssistantContainer />
              </AIAssistantProvider>

              <main id="main-content" tabIndex={-1} className="focus:outline-none">
                {children}
              </main>

              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'rgba(26, 11, 46, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                  },
                  className: 'rounded-2xl shadow-2xl',
                }}
                aria-live="polite"
                aria-atomic="true"
              />
            </OnboardingProvider>
          </RealtimeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

