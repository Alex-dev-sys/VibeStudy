import { GroupDetail } from '@/components/community/groups/GroupDetail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Группа - Сообщество VibeStudy',
  description: 'Детальная информация о группе'
};

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <GroupDetail groupId={params.groupId} />
    </main>
  );
}
