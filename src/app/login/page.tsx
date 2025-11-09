'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithEmail, signInWithGoogle, getCurrentUser } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    checkUser();
  }, []);

  async function checkUser() {
    const { user } = await getCurrentUser();
    if (user) {
      router.push('/learn');
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Контент */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Логотип */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4 inline-block text-6xl"
          >
            🎓
          </motion.div>
          <h1 className="mb-2 text-4xl font-bold text-white">VibeStudy</h1>
          <p className="text-lg text-white/60">Начни своё путешествие в программирование</p>
        </div>

        {/* Карточка входа */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl"
        >
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            Войти или зарегистрироваться
          </h2>

          {/* Успех отправки email */}
          {emailSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-center"
            >
              <div className="mb-2 text-2xl">✉️</div>
              <p className="text-sm font-semibold text-green-300">Письмо отправлено!</p>
              <p className="mt-1 text-xs text-green-300/80">
                Проверьте почту <span className="font-semibold">{email}</span> и перейдите по ссылке для входа
              </p>
            </motion.div>
          )}

          {/* Ошибка */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-center text-sm text-yellow-300"
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
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white px-6 py-4 font-semibold text-gray-900 transition-all hover:border-white/40 hover:bg-white/95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Продолжить с Google</span>
            </button>

            {/* Кнопка Email */}
            {!showEmailForm && (
              <button
                onClick={() => setShowEmailForm(true)}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-semibold text-white transition-all hover:border-white/40 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Информация */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-center text-xs text-white/60">
              Нажимая кнопку входа, вы соглашаетесь с условиями использования и политикой конфиденциальности
            </p>
          </div>
        </motion.div>

        {/* Преимущества */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-3"
        >
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-2xl">🤖</span>
            <span className="text-sm">AI-помощник для обучения</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-2xl">📊</span>
            <span className="text-sm">Отслеживание прогресса</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <span className="text-2xl">🎯</span>
            <span className="text-sm">Персональный план обучения</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

