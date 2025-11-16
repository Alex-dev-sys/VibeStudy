'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroShowcase } from '@/components/landing/HeroShowcase';
import { getCurrentUser } from '@/lib/supabase/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Если пользователь авторизован, перенаправляем на /learn
          router.push('/learn');
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <HeroShowcase />
    </main>
  );
}
