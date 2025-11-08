import dynamic from 'next/dynamic';

const LearningDashboard = dynamic(() => import('@/components/dashboard/LearningDashboard'), { ssr: false });

export default function LearnPage() {
  return (
    <main className="relative flex min-h-screen flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:gap-8 md:px-8 md:py-10 lg:px-14">
      <div className="absolute inset-0 -z-10 bg-gradient-accent opacity-60" aria-hidden />
      <LearningDashboard />
    </main>
  );
}

