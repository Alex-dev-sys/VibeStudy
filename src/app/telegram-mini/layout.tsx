import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'VibeStudy Mini App',
  description: 'Solve coding challenges in Telegram',
};

export default function TelegramMiniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
