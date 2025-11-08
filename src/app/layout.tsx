import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'VibeStudy | 90-дневный курс программирования',
  description: 'Образовательная платформа для обучения программированию с нуля до уровня junior за 90 дней.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5
  },
  themeColor: '#ff3b5c'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-gradient-soft bg-no-repeat bg-cover`}>{children}</body>
    </html>
  );
}

