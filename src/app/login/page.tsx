'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { signInWithEmail, signInWithGoogle, getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { LoginForm } from '@/components/auth/LoginForm';
import { DecorativeLines } from '@/components/auth/DecorativeLines';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const checkUrlErrors = useCallback(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');

    if (errorParam) {
      if (errorCode === 'otp_expired') {
        setError('Ссылка для входа истекла');
      } else if (errorDescription) {
        setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
      } else {
        setError('Ошибка входа');
      }
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      console.log('[Login Page] Current user:', !!user);
      if (user) {
        console.log('[Login Page] User authenticated, redirecting to /learn');
        router.push('/learn');
      }
    };

    checkUser().catch((error) => {
      console.error('Auth check failed:', error);
    });
    checkUrlErrors();

    // Store referral code in sessionStorage if present
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      sessionStorage.setItem('referral_code', refParam);
      console.log('[Referral] Stored referral code:', refParam);
    }

    // Also listen to auth state changes
    const unsubscribe = onAuthStateChange(async (event, session) => {
      console.log('[Login Page] Auth state changed:', event, !!session);
      if (session?.user) {
        // Create or update profile after successful auth (for both email and OAuth)
        const provider = session.user.app_metadata?.provider || 'email';
        await createOrUpdateProfile(session.user.id, session.user.email || '', provider);

        console.log('[Login Page] User signed in, redirecting to /learn');
        router.push('/learn');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, checkUrlErrors]);

  async function handleEmailSignIn(email: string) {
    setLoading(true);
    setError(null);

    const { error } = await signInWithEmail(email);

    if (error) {
      setError('Не удалось отправить письмо. Попробуйте еще раз.');
      setLoading(false);

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
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
      setError('Не удалось войти через Google. Попробуйте еще раз.');
      setLoading(false);

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
    // If successful, OAuth will redirect to callback page
  }

  // Create or update user profile after OAuth
  async function createOrUpdateProfile(userId: string, email: string, provider: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        // Create new profile
        await supabase.from('profiles').insert({
          id: userId,
          email,
          provider,
          created_at: new Date().toISOString(),
        });
        console.log('[Login] Created new profile for user:', userId);
      } else {
        // Update existing profile
        await supabase
          .from('profiles')
          .update({
            email,
            provider,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        console.log('[Login] Updated profile for user:', userId);
      }
    } catch (error) {
      console.error('[Login] Error creating/updating profile:', error);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Decorative white lines */}
      <DecorativeLines />

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-4 top-4 z-20 md:left-8 md:top-8"
      >
        <Link
          href="/"
          aria-label="Вернуться на главную страницу"
          className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">Назад</span>
        </Link>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20">
        <LoginForm
          onSubmit={handleEmailSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          isLoading={loading}
          error={error}
          emailSent={emailSent}
        />
      </div>
    </main>
  );
}

