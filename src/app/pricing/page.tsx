'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/pricing/PaymentModal';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ArrowLeft, Zap, Sparkles, Crown, Check, Star, Shield, Rocket, Brain } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/auth';
import { requireSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';

interface PaymentData {
  id: string;
  walletAddress: string;
  amount: number;
  amountNano: string;
  comment: string;
  tier: string;
  usdEquivalent: number;
  expiresAt: string;
}

interface UserTierData {
  tier: 'free' | 'premium' | 'pro_plus';
  tierExpiresAt: string | null;
}

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [userTier, setUserTier] = useState<UserTierData>({
    tier: 'free',
    tierExpiresAt: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch user's current tier
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const supabase = requireSupabaseClient();
        const { data, error } = await supabase
          .from('users')
          .select('tier, tier_expires_at')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserTier({
            tier: (data.tier as 'free' | 'premium' | 'pro_plus') || 'free',
            tierExpiresAt: data.tier_expires_at,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user tier:', err);
      }
    }

    fetchUserTier();
  }, []);

  const handleSelectTier = async (tierId: string) => {
    if (tierId === 'free') return;

    setError(null);
    setIsLoading(true);

    try {
      // Check if user is authenticated
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login?redirect=/pricing');
        return;
      }

      // Create payment
      const response = await fetch('/api/ton/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentData(data.payment);
      setShowPaymentModal(true);
    } catch (err) {
      console.error('Failed to create payment:', err);
      setError(
        err instanceof Error ? err.message : 'Не удалось создать платеж'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentData) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/ton/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentData.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      if (data.verified) {
        setShowPaymentModal(false);
        setPaymentData(null);
        setUserTier({
          tier: data.tier,
          tierExpiresAt: data.expiresAt,
        });
        alert('🎉 Оплата успешно подтверждена! Ваш тариф обновлен.');
        router.push('/learn');
      } else {
        setError(data.error || 'Транзакция еще не найдена. Пожалуйста, подождите несколько минут и попробуйте снова.');
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      setError(err instanceof Error ? err.message : 'Не удалось проверить платеж');
    } finally {
      setIsVerifying(false);
    }
  };

  // Bento Grid Components
  const BentoCard = ({
    className,
    children,
    glowColor = "purple"
  }: {
    className?: string,
    children: React.ReactNode,
    glowColor?: "purple" | "pink" | "orange" | "blue" | "none"
  }) => {
    const glowStyles = {
      purple: "hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:border-purple-500/50",
      pink: "hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)] hover:border-pink-500/50",
      orange: "hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:border-orange-500/50",
      blue: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:border-blue-500/50",
      none: ""
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/80 p-6 backdrop-blur-xl transition-all duration-500",
          glowStyles[glowColor],
          className
        )}
      >
        <div className="relative z-10 h-full">{children}</div>
        {/* Inner subtle gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      </motion.div>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <GradientBackdrop className="opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="mb-4 text-white/50 hover:text-white pl-0 hover:bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Choose your</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0094] to-[#ff5bc8]">Power Level</span>
            </h1>
          </div>

          {userTier.tier !== 'free' && (
            <div className="rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-md">
              <span className="text-sm text-white/60 mr-2">Текущий план:</span>
              <span className="font-bold text-accent uppercase tracking-wider">{userTier.tier}</span>
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]">

          {/* FREE TIER - Small Card */}
          <BentoCard className="md:col-span-4 flex flex-col justify-between group" glowColor="blue">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                  <Star className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-white/40">STARTER</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Free</h3>
              <p className="text-sm text-white/50">Для старта</p>
            </div>
            <div className="mt-6">
              <div className="text-3xl font-bold mb-4">0 TON</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-white/70"><Check className="h-3 w-3 mr-2 text-blue-400" /> 5 AI-запросов/день</li>
                <li className="flex items-center text-sm text-white/70"><Check className="h-3 w-3 mr-2 text-blue-400" /> Базовая модель</li>
              </ul>
              <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10" disabled>
                Ваш текущий план
              </Button>
            </div>
          </BentoCard>

          {/* PREMIUM TIER - Large Featured Card */}
          <BentoCard className="md:col-span-4 md:row-span-2 flex flex-col relative overflow-visible" glowColor="pink">
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.5)]" />

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <Zap className="h-8 w-8" />
                </div>
                <div className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 text-[10px] font-bold tracking-wider text-pink-300 uppercase">
                  Recommended
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-2 text-white">Premium</h3>
              <p className="text-white/60 mb-6">Оптимальный выбор для активного обучения</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold text-white">5 TON</span>
                <span className="text-lg text-white/40">/ мес</span>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Безлимитные AI-запросы',
                  'GPT-4o Модель',
                  'Быстрая генерация',
                  'Персональный ментор',
                  'Аналитика прогресса'
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-pink-400" />
                    </div>
                    <span className="text-white/80">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => handleSelectTier('premium')}
              disabled={isLoading || userTier.tier === 'premium'}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] border-0"
            >
              {userTier.tier === 'premium' ? 'Текущий план' : 'Выбрать Premium'}
            </Button>
          </BentoCard>

          {/* PRO+ TIER - Medium Card */}
          <BentoCard className="md:col-span-4 flex flex-col justify-between" glowColor="orange">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Crown className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-orange-400/60">MAX POWER</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">Pro+</h3>
              <p className="text-sm text-white/50">Для профессионалов</p>
            </div>
            <div className="mt-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">12 TON</span>
                <span className="text-sm text-white/40">/ мес</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-white/70"><Check className="h-3 w-3 mr-2 text-orange-400" /> Claude 3.5 Sonnet</li>
                <li className="flex items-center text-sm text-white/70"><Check className="h-3 w-3 mr-2 text-orange-400" /> Turbo режим</li>
                <li className="flex items-center text-sm text-white/70"><Check className="h-3 w-3 mr-2 text-orange-400" /> Приоритет 24/7</li>
              </ul>
              <Button
                onClick={() => handleSelectTier('pro_plus')}
                disabled={isLoading || userTier.tier === 'pro_plus'}
                className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/50"
              >
                {userTier.tier === 'pro_plus' ? 'Текущий план' : 'Выбрать Pro+'}
              </Button>
            </div>
          </BentoCard>

          {/* Feature: AI Power */}
          <BentoCard className="md:col-span-4 md:row-span-1 flex items-center gap-4" glowColor="purple">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">Smart AI</h4>
              <p className="text-xs text-white/50">Адаптируется под ваш стиль обучения</p>
            </div>
          </BentoCard>

          {/* Feature: Speed */}
          <BentoCard className="md:col-span-4 md:row-span-1 flex items-center gap-4" glowColor="blue">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Rocket className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white">Turbo Mode</h4>
              <p className="text-xs text-white/50">Мгновенные ответы без задержек</p>
            </div>
          </BentoCard>

          {/* FAQ / Info Block */}
          <BentoCard className="md:col-span-8 flex flex-col justify-center" glowColor="none">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              Безопасная оплата через TON
            </h4>
            <p className="text-sm text-white/60">
              Мы используем децентрализованные платежи. Никаких подписок и скрытых списаний.
              Вы платите только за то время, которое используете.
            </p>
          </BentoCard>

        </div>

        {/* Support Link */}
        <div className="mt-12 text-center">
          <a href="https://t.me/vibestudy_support" target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Нужна помощь? Напишите в поддержку
          </a>
        </div>

      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setError(null);
        }}
        paymentData={paymentData}
        onVerify={handleVerifyPayment}
        isVerifying={isVerifying}
      />
    </main>
  );
}
