'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Code, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress-store';
import { StreakIndicator } from './StreakIndicator';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/learn', label: 'Обучение', icon: BookOpen },
  { href: '/playground', label: 'Песочница', icon: Code },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const streak = useProgressStore((state) => state.record.streak);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isLanding = pathname === '/';

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          isLanding
            ? "bg-[#050505]/80 backdrop-blur-xl"
            : "bg-[#0a0515]/60 backdrop-blur-2xl"
        )}
        aria-label="Main navigation"
      >
        {/* Gradient border at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff0094]/30 to-transparent" />

        <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={isLanding ? "/" : "/learn"}
              className="group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094] rounded-lg relative"
            >
              <motion.span
                className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                VibeStudy
              </motion.span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
              {!isLanding && NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094]',
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/80'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Active background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 bg-gradient-to-r from-[#ff0094]/20 to-[#ffd200]/10 rounded-full border border-[#ff0094]/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className={cn(
                      "w-4 h-4 relative z-10 transition-colors",
                      isActive && "text-[#ff0094]"
                    )} />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {!isLanding ? (
                <>
                  <Link href="/pricing" className="hidden lg:block">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs bg-gradient-to-r from-[#ffd200] to-[#ff9500] hover:opacity-90 border-0 shadow-lg shadow-[#ffd200]/20"
                    >
                      ⭐ Premium
                    </Button>
                  </Link>

                  {streak > 0 && <StreakIndicator streak={streak} />}
                  <UserMenu />
                </>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] px-6 py-2.5 font-semibold text-white shadow-lg shadow-[#ff0094]/30"
                  >
                    Войти
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav Items */}
          {!isLanding && (
            <div className="md:hidden flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0094]',
                      isActive ? 'text-[#ff0094]' : 'text-white/40'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveNav"
                        className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-[#ff0094] to-[#ffd200] rounded-full"
                      />
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </motion.nav>

      {/* Spacer */}
      {!isLanding && (
        <div className="h-[100px] md:h-[80px]" aria-hidden="true" />
      )}
    </>
  );
}
