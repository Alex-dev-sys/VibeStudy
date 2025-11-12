import { HeroShowcase } from '@/components/landing/HeroShowcase';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <HeroShowcase />
    </main>
  );
}
