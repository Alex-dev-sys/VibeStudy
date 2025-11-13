'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithEmail, signInWithGoogle, getCurrentUser } from '@/lib/supabase/auth';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        router.push('/learn');
      }
    };

    checkUser().catch((error) => {
      console.error('Не удалось проверить авторизацию пользователя', error);
    });
    checkUrlErrors();
  }, [router]);

  function checkUrlErrors() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');

    if (errorParam) {
      if (errorCode === 'otp_expired') {
        setError('Ссылка для входа истекла. Запросите новую ссылку.');
      } else if (errorDescription) {
        setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
      } else {
        setError('Ошибка входа. Попробуйте снова.');
      }
      // Очищаем URL от ошибок
      window.history.replaceState({}, '', '/login');
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);
    setError(null);
    
    const { error } = await signInWithEmail(email);
    
    if (error) {
      setError('Ошибка отправки письма. Попробуйте снова.');
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      setError('Google вход не настроен. Используйте Email.');
      setLoading(false);
      setShowEmailForm(true);
    }
  }

  function handleGuestMode() {
    // Устанавливаем флаг гостевого режима в localStorage
    localStorage.setItem('guestMode', 'true');
    // Перенаправляем на страницу обучения
    router.push('/learn');
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col-reverse items-center gap-10 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
        {/* Информационный блок */}
        <div className="w-full max-w-2xl space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-[rgba(255,255,255,0.2)] px-5 py-2 text-sm text-white/80 backdrop-blur-xl shadow-[0_18px_40px_rgba(12,6,28,0.35)]"
          >
            <span className="text-xl">🚀</span>
            <span>Войди и продолжи обучение вместе с ИИ-наставником</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl font-semibold leading-tight sm:text-5xl"
          >
            <AnimatedGradientText className="px-1">VibeStudy</AnimatedGradientText> встречает тебя!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="text-base text-white/80 sm:text-lg"
          >
            Возвращайся к прогрессу, получай подсказки от ИИ, фиксируй успехи и строй свою карьеру разработчика.
            Доступен полный режим с Google, email или гостевым входом.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.6 }}
            className="grid gap-4 text-sm text-white/75 sm:grid-cols-2"
          >
            <MagicCard innerClassName="rounded-[26px] p-5 text-left">
              <p className="mb-2 text-sm font-semibold text-gradient">🧠 AI-помощник</p>
              <p className="text-white/75">Круглосуточные подсказки, проверка кода и объяснение теории.</p>
            </MagicCard>
            <MagicCard innerClassName="rounded-[26px] p-5 text-left">
              <p className="mb-2 text-sm font-semibold text-gradient">📊 Адаптивный прогресс</p>
              <p className="text-white/75">Аналитика, рекомендации и Telegram-напоминания, чтобы не сбиться с курса.</p>
            </MagicCard>
          </motion.div>
        </div>

        {/* Карточка входа */}
        <MagicCard className="w-full max-w-xl" innerClassName="relative w-full rounded-[28px] px-6 py-8 sm:px-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            Войти или зарегистрироваться
          </h2>

          {/* Успех отправки email */}
          {emailSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-400/15 p-4 text-center text-white/90"
            >
              <div className="mb-2 text-2xl">✉️</div>
              <p className="text-sm font-semibold text-white">Письмо отправлено!</p>
              <p className="mt-1 text-xs text-white/80">
                Проверьте почту <span className="font-semibold text-gradient">{email}</span> и перейдите по ссылке для входа
              </p>
              <p className="mt-2 text-xs text-white/65">
                ⏱️ Ссылка действительна 1 час
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl border border-yellow-400/40 bg-yellow-400/15 p-3 text-center text-sm text-white/90"
            >
              {error}
            </motion.div>
          )}

          {/* Форма Email входа */}
          {(showEmailForm || emailSent) && !loading && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleEmailSignIn}
              className="mb-4 space-y-3"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={emailSent}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:border-accent/50 focus:outline-none disabled:opacity-50"
                />
              </div>
              {!emailSent && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-soft px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Отправить ссылку для входа
                </button>
              )}
            </motion.form>
          )}

          {/* Разделитель */}
          {showEmailForm && !emailSent && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black/40 px-4 text-white/50">или</span>
              </div>
            </div>
          )}

          {/* Кнопки входа */}
          {!emailSent && (
            <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-transparent bg-white/95 px-6 py-4 font-semibold text-[#1c1c1c] shadow-[0_20px_45px_rgba(12,6,28,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_26px_55px_rgba(12,6,28,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Продолжить с Google</span>
            </button>

            {!showEmailForm && (
              <button
                onClick={() => setShowEmailForm(true)}
                  className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-0 bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] px-6 py-4 font-semibold text-[#25031f] shadow-[0_22px_48px_rgba(255,0,148,0.42)] transition-all hover:brightness-110 hover:shadow-[0_28px_60px_rgba(255,0,148,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Продолжить с Email</span>
              </button>
            )}
          </div>
          )}

          {/* Загрузка */}
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-white/60">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                <span>Перенаправление...</span>
              </div>
            </div>
          )}

          {/* Кнопка гостевого режима */}
          <div className="mt-4">
            <button
              onClick={handleGuestMode}
              className="w-full rounded-xl border border-white/12 bg-[rgba(255,255,255,0.15)] px-6 py-3 font-semibold text-white transition-all hover:border-white/20 hover:bg-[rgba(255,255,255,0.25)] hover:-translate-y-0.5 shadow-[0_14px_32px_rgba(12,6,28,0.35)]"
            >
              🚀 Продолжить без регистрации
            </button>
          </div>

          {/* Информация */}
          <div className="mt-6 rounded-lg border border-white/12 bg-[rgba(255,255,255,0.15)] p-4">
            <p className="text-center text-xs text-white/65">
              Нажимая кнопку входа, вы соглашаетесь с условиями использования и политикой конфиденциальности
            </p>
          </div>
        </MagicCard>
      </div>
    </main>
  );
}

