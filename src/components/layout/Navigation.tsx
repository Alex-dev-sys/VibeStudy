'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Code, BarChart3, Target } from 'lucide-react';
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

  // Don't show navigation on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex fixed top-0 left-0 right-0 z-navigation bg-[#0c061c]/80 backdrop-blur-xl border-b border-white/10"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/learn" 
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] bg-clip-text text-transparent">
              VibeStudy
            </span>
          </Link>
          
          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
                    isActive
                      ? 'bg-gradient-to-r from-accent/20 to-secondary/20 text-white shadow-lg shadow-accent/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Premium and Challenges buttons */}
            <Link href="/pricing">
              <Button variant="primary" size="sm" className="text-xs">
                ⭐ Premium
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="secondary" size="sm" className="text-xs">
                🎯 Челленджи
              </Button>
            </Link>
            
            {/* Streak indicator */}
            {streak > 0 && <StreakIndicator streak={streak} />}
            
            <UserMenu />
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation - Bottom Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-navigation bg-[#0c061c]/95 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2 gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all',
                  'min-w-[64px] min-h-[56px]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
                  isActive
                    ? 'text-white bg-gradient-to-br from-accent/20 to-secondary/20 shadow-lg shadow-accent/10'
                    : 'text-white/50 active:bg-white/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Spacer for fixed navigation */}
      <div className="hidden md:block h-[72px]" aria-hidden="true" />
      <div className="md:hidden h-[80px]" aria-hidden="true" />
    </>
  );
}
