import { HeroShowcase } from '@/components/landing/HeroShowcase';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <HeroShowcase />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-[radial-gradient(circle_at_bottom,_rgba(255,255,255,0.08),_transparent_70%)]" />
    </main>
  );
}
