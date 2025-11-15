import { CommunityHub } from '@/components/community/CommunityHub';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сообщество VibeStudy',
  description: 'Присоединяйтесь к сообществу VibeStudy - общайтесь, учитесь вместе и находите напарников'
};

export default function CommunityPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <CommunityHub />
    </main>
  );
}
