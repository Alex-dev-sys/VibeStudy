import { generatePageMetadata, generateStructuredData } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  ...generatePageMetadata('playground'),
  other: {
    'structured-data': JSON.stringify(generateStructuredData('WebPage'))
  }
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
