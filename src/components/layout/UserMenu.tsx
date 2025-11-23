'use client';

import { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCurrentUser, signOut, onAuthStateChange } from '@/lib/supabase/auth';
import { GuestModeManager } from '@/lib/auth/guest-mode';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      // User is guest only if no authenticated user AND guest mode is active
      setIsGuest(!currentUser && GuestModeManager.isGuestMode());
      setLoading(false);
    };
    
    checkUser();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange(async (event, session) => {
      console.log('[UserMenu] Auth state changed:', event, !!session);
      if (session?.user) {
        setUser(session.user);
        setIsGuest(false);
      } else {
        setUser(null);
        setIsGuest(GuestModeManager.isGuestMode());
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show loading state briefly
  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
    );
  }

  if (isGuest) {
    return (
      <Link href="/login">
        <Button variant="primary" size="sm">
          Войти
        </Button>
      </Link>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="primary" size="sm">
          Войти
        </Button>
      </Link>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-full transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
          'bg-white/5 hover:bg-white/10'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="User avatar" 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ffd200] flex items-center justify-center">
            <User className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
        )}
        <span className="hidden sm:inline text-sm text-white font-medium">
          {user.email || 'User'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div
            className="absolute right-0 top-full mt-2 w-56 z-50 bg-[#1a0b2e] border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            role="menu"
          >
            <div className="p-3 border-b border-white/10">
              <div className="text-sm font-medium text-white/90 truncate">
                {user.email}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {isGuest ? 'Гостевой режим' : 'Аккаунт'}
              </div>
            </div>
            
            <div className="p-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 text-white/60" aria-hidden="true" />
                <span className="text-sm text-white/90">Профиль</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-white/60" aria-hidden="true" />
                <span className="text-sm text-white/90">Выйти</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
