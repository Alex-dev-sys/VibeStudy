'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PricingCard, type PricingTier } from '@/components/pricing/PricingCard';
import { PaymentModal } from '@/components/pricing/PaymentModal';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ArrowLeft, Zap, Sparkles, Crown } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/auth';
import { requireSupabaseClient } from '@/lib/supabase/client';

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

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceUsd: 0,
      duration: 'Навсегда',
      features: [
        '5 AI-запросов в день',
        'Базовая AI модель (Gemini 2.5)',
        'Доступ ко всем урокам',
        'Интерактивный редактор кода',
        'Отслеживание прогресса',
        'Система достижений',
      ],
      current: userTier.tier === 'free',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5,
      priceUsd: 12,
      duration: '30 дней',
      features: [
        'Безлимитные AI-запросы',
        'Продвинутая AI модель (GPT-4o)',
        'Приоритетная генерация контента',
        'Все функции Free',
        'Расширенная аналитика',
        'Персональные рекомендации',
      ],
      highlighted: true,
      current: userTier.tier === 'premium',
    },
    {
      id: 'pro_plus',
      name: 'Pro+',
      price: 12,
      priceUsd: 29,
      duration: '30 дней',
      features: [
        'Безлимитные AI-запросы',
        'Лучшая AI модель (Claude 3.5 Sonnet)',
        'Мгновенная генерация контента',
        'Все функции Premium',
        'Детальная аналитика обучения',
        'Индивидуальный план развития',
        'Приоритетная поддержка',
      ],
      current: userTier.tier === 'pro_plus',
    },
  ];

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
        // Payment successful!
        setShowPaymentModal(false);
        setPaymentData(null);
        
        // Update user tier in state
        setUserTier({
          tier: data.tier,
          tierExpiresAt: data.expiresAt,
        });

        // Show success message
        alert('🎉 Оплата успешно подтверждена! Ваш тариф обновлен.');
        
        // Redirect to learn page
        router.push('/learn');
      } else {
        setError(
          data.error ||
            'Транзакция еще не найдена. Пожалуйста, подождите несколько минут и попробуйте снова.'
        );
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось проверить платеж'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <Link href="/learn">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к обучению
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white/95 sm:text-5xl">
              <AnimatedGradientText>Выберите свой план</AnimatedGradientText>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Разблокируйте полный потенциал обучения с премиум-доступом
            </p>
          </div>
        </header>

        {/* Current Tier Info */}
        {userTier.tier !== 'free' && userTier.tierExpiresAt && (
          <div className="mx-auto w-full max-w-2xl rounded-2xl bg-gradient-to-r from-accent/10 to-[#ffd200]/10 p-4 text-center">
            <p className="text-sm text-white/80">
              Ваш текущий план:{' '}
              <span className="font-semibold text-white/95">
                {userTier.tier === 'premium' ? 'Premium' : 'Pro+'}
              </span>
              {' • '}
              Действителен до:{' '}
              {new Date(userTier.tierExpiresAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-auto w-full max-w-2xl rounded-2xl bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              onSelect={handleSelectTier}
              isLoading={isLoading}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <section className="mt-12">
          <h2 className="mb-8 text-center text-2xl font-semibold text-white/95">
            Что вы получаете с Premium
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass-panel-enhanced rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white/95">
                Безлимитный AI
              </h3>
              <p className="text-sm text-white/70">
                Неограниченные запросы к AI для объяснений, подсказок и генерации задач
              </p>
            </div>

            <div className="glass-panel-enhanced rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd200]/20">
                <Sparkles className="h-6 w-6 text-[#ffd200]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white/95">
                Лучшие AI модели
              </h3>
              <p className="text-sm text-white/70">
                Доступ к GPT-4o и Claude 3.5 Sonnet для максимального качества обучения
              </p>
            </div>

            <div className="glass-panel-enhanced rounded-2xl p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Crown className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white/95">
                Персонализация
              </h3>
              <p className="text-sm text-white/70">
                Индивидуальные рекомендации и адаптивный план обучения
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-8 text-center text-2xl font-semibold text-white/95">
            Часто задаваемые вопросы
          </h2>

          <div className="mx-auto max-w-3xl space-y-4">
            <details className="glass-panel-enhanced rounded-2xl p-6">
              <summary className="cursor-pointer text-lg font-semibold text-white/95">
                Что такое TON?
              </summary>
              <p className="mt-4 text-sm text-white/70">
                TON (The Open Network) — это быстрый и безопасный блокчейн с низкими комиссиями.
                Для оплаты вам понадобится TON Wallet (Tonkeeper, Tonhub и др.).
              </p>
            </details>

            <details className="glass-panel-enhanced rounded-2xl p-6">
              <summary className="cursor-pointer text-lg font-semibold text-white/95">
                Как происходит оплата?
              </summary>
              <p className="mt-4 text-sm text-white/70">
                После выбора плана вы получите адрес кошелька и уникальный комментарий.
                Отправьте указанную сумму TON с этим комментарием, и ваш тариф будет автоматически обновлен.
              </p>
            </details>

            <details className="glass-panel-enhanced rounded-2xl p-6">
              <summary className="cursor-pointer text-lg font-semibold text-white/95">
                Можно ли отменить подписку?
              </summary>
              <p className="mt-4 text-sm text-white/70">
                Подписка действует 30 дней с момента оплаты и не продлевается автоматически.
                После окончания срока вы вернетесь к бесплатному плану.
              </p>
            </details>

            <details className="glass-panel-enhanced rounded-2xl p-6">
              <summary className="cursor-pointer text-lg font-semibold text-white/95">
                Что если платеж не подтвердится?
              </summary>
              <p className="mt-4 text-sm text-white/70">
                Проверка транзакции может занять несколько минут. Если платеж не подтвердился,
                убедитесь, что вы указали правильный комментарий и отправили нужную сумму.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* Payment Modal */}
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
