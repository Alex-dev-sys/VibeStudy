import dynamic from 'next/dynamic';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';

const LearningDashboard = dynamic(() => import('@/components/dashboard/LearningDashboard'), { ssr: false });

export default function LearnPage() {
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-[#04010b] via-[#08062a] to-[#050213]">
      <GradientBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:gap-8 md:px-8 md:py-10 lg:px-14">
        <LearningDashboard />
      </div>
    </main>
  );
}

