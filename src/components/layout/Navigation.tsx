'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Code, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress-store';
import { StreakIndicator } from './StreakIndicator';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/learn', label: 'Обучение', labelEn: 'Learn', icon: BookOpen },
  { href: '/playground', label: 'Песочница', labelEn: 'Playground', icon: Code },
  { href: '/analytics', label: 'Аналитика', labelEn: 'Analytics', icon: BarChart3 },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const streak = useProgressStore((state) => state.record.streak);

  // Don't show navigation on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isLanding = pathname === '/';

  return (
    <>
      {/* Top Navigation - All screens */}
      <nav
        className={cn(
          "flex fixed top-0 left-0 right-0 z-[100] border-b border-white/10 shadow-lg transition-all duration-300",
          isLanding
            ? "bg-[#050505]"
            : "backdrop-blur-2xl bg-[#0a0515]/80"
        )}
        aria-label="Main navigation"
        style={!isLanding ? {
          backgroundImage: 'linear-gradient(to bottom, rgba(10, 5, 21, 0.95), rgba(10, 5, 21, 0.8))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)'
        } : undefined}
      >
        {/* Gradient border at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff0094]/50 to-transparent" />

        <div className="max-w-[1600px] mx-auto w-full px-4 lg:px-8 py-3">
          {/* Main header row */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={isLanding ? "/" : "/learn"}
              className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff0094]/20 via-[#ff5bc8]/20 to-[#ffd200]/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                VibeStudy
              </span>
            </Link>

            {/* Desktop Nav Items - Center */}
            <div className="hidden md:flex items-center gap-2">
              {!isLanding && NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full transition-all duration-300 text-sm group',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
                      isActive
                        ? 'bg-gradient-to-r from-accent/20 to-secondary/20 text-white shadow-lg shadow-accent/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-secondary/30 rounded-full blur-md -z-10" />
                    )}
                    <Icon className={cn(
                      "w-5 h-5 relative z-10 transition-transform duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(255,0,148,0.5)]",
                      !isActive && "group-hover:scale-110"
                    )} aria-hidden="true" />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions - Right */}
            <div className="flex items-center gap-2 lg:gap-3">
              {!isLanding ? (
                <>
                  <Link href="/pricing" className="hidden lg:block group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffd200]/30 to-[#ff0094]/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Button variant="primary" size="sm" className="relative text-xs whitespace-nowrap group-hover:scale-105 transition-transform duration-300">
                      ⭐ Premium
                    </Button>
                  </Link>

                  <Link href="/challenges" className="hidden lg:block group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff0094]/20 to-[#ff5bc8]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Button variant="secondary" size="sm" className="relative text-xs whitespace-nowrap group-hover:scale-105 transition-transform duration-300">
                      🎯 Челленджи
                    </Button>
                  </Link>

                  {streak > 0 && <StreakIndicator streak={streak} />}
                  <UserMenu />
                </>
              ) : (
                <Link href="/login">
                  <button
                    aria-label="Войти в аккаунт"
                    className="rounded-full border-2 border-white/20 bg-white/5 px-6 py-2 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
                  >
                    Войти
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav Items - Below header on mobile only */}
          {!isLanding && (
            <div className="md:hidden flex items-center justify-center gap-6 mt-3 pt-3 border-t border-white/5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
                      isActive
                        ? 'text-white'
                        : 'text-white/50'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff0094] rounded-full" />
                    )}

                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive && "text-[#ff0094]"
                    )} aria-hidden="true" />
                    <span className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      isActive && "text-[#ff0094]"
                    )}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      {!isLanding && (
        <div className="h-[120px] md:h-[72px]" aria-hidden="true" />
      )}
    </>
  );
}

