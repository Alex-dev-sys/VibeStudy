'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { GuestModeManager } from '@/lib/auth/guest-mode';
import { signInWithGoogle, signInWithEmail } from '@/lib/supabase/auth';
import { logInfo } from '@/lib/logger';

export interface AuthFlowProps {
  trigger: 'landing' | 'first-day-complete' | 'manual';
  onComplete?: () => void;
  onSkip?: () => void;
}

export function AuthFlow({ trigger, onComplete, onSkip }: AuthFlowProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'guest' | 'auth'>('guest');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAsGuest = () => {
    const guestId = GuestModeManager.startAsGuest();
    logInfo('User chose guest mode', { component: 'AuthFlow' });
    router.push('/learn');
    onComplete?.();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setError('Не удалось войти через Google. Попробуйте ещё раз.');
        setIsLoading(false);
      } else {
        // OAuth redirect will happen automatically
        logInfo('Google sign-in initiated', { component: 'AuthFlow' });
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте ещё раз.');
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithEmail(email);
      
      if (result.error) {
        setError('Не удалось отправить письмо. Попробуйте ещё раз.');
        setIsLoading(false);
      } else {
        setEmailSent(true);
        setIsLoading(false);
        logInfo('Magic link sent', { component: 'AuthFlow' });
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте ещё раз.');
      setIsLoading(false);
    }
  };

  // Landing page flow - prioritize guest mode
  if (trigger === 'landing') {
    return (
      <div className="space-y-6">
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleStartAsGuest}
          className="w-full"
          disabled={isLoading}
        >
          Начать без регистрации
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0c061c] text-white/50">или</span>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="md"
          onClick={() => setMode('auth')}
          className="w-full"
          disabled={isLoading}
        >
          Войти с аккаунтом
        </Button>

        {mode === 'auth' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-white/10"
          >
            {!emailSent ? (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Войти через Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#0c061c] text-white/40">или email</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Отправка...' : 'Получить ссылку для входа'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="text-3xl">📧</div>
                <p className="text-sm text-white/90">
                  Письмо отправлено на <strong>{email}</strong>
                </p>
                <p className="text-xs text-white/60">
                  Проверьте почту и перейдите по ссылке для входа
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 text-center p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                {error}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // First day complete flow - show benefits modal
  if (trigger === 'first-day-complete') {
    return (
      <Modal isOpen onClose={() => onSkip?.()} size="md">
        <div className="text-center space-y-6 p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Отличная работа!</h2>
            <p className="text-white/70">
              Ты завершил первый день. Создай аккаунт, чтобы сохранить прогресс 
              и получить доступ к достижениям.
            </p>
          </div>
          
          <div className="space-y-3 text-left bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☁️</span>
              <span className="text-sm">Синхронизация на всех устройствах</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span className="text-sm">Разблокировка достижений</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="text-sm">Детальная аналитика прогресса</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <span className="text-sm">Напоминания в Telegram</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Создать аккаунт через Google
            </Button>

            {!emailSent ? (
              <form onSubmit={handleEmailSignIn} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="или введи email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Отправка...' : 'Получить ссылку'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-white/90">
                  Письмо отправлено на <strong>{email}</strong>
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-400 text-center p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              {error}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSkip?.()}
            disabled={isLoading}
          >
            Продолжить без аккаунта
          </Button>
        </div>
      </Modal>
    );
  }

  // Manual trigger - simple auth options
  return (
    <div className="space-y-4">
      <Button
        variant="primary"
        size="lg"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Войти через Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[#0c061c] text-white/40">или</span>
        </div>
      </div>

      {!emailSent ? (
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Отправка...' : 'Получить ссылку для входа'}
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="text-3xl">📧</div>
          <p className="text-sm text-white/90">
            Письмо отправлено на <strong>{email}</strong>
          </p>
          <p className="text-xs text-white/60">
            Проверьте почту и перейдите по ссылке для входа
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          {error}
        </div>
      )}
    </div>
  );
}
