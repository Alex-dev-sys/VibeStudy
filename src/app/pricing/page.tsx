'use client';
// Force rebuild: Premium page redesign


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/pricing/PaymentModal';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ArrowLeft, Zap, Sparkles, Crown, Check, Star } from 'lucide-react';
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

  const pricingTiers = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      priceUsd: 0,
      duration: 'Навсегда',
      description: 'Идеально для начала пути',
      features: [
        '5 AI-запросов в день',
        'Базовая AI модель (Gemini 2.5)',
        'Доступ ко всем урокам',
        'Интерактивный редактор кода',
        'Отслеживание прогресса',
      ],
      current: userTier.tier === 'free',
      color: 'from-blue-400 to-cyan-400',
      icon: Star
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5,
      priceUsd: 12,
      duration: '30 дней',
      description: 'Для активного обучения',
      features: [
        'Безлимитные AI-запросы',
        'Продвинутая AI модель (GPT-4o)',
        'Приоритетная генерация контента',
        'Расширенная аналитика',
        'Персональные рекомендации',
        'Все функции Starter',
      ],
      highlighted: true,
      current: userTier.tier === 'premium',
      color: 'from-[#ff0094] to-[#ff5bc8]',
      icon: Zap
    },
    {
      id: 'pro_plus',
      name: 'Pro+',
      price: 12,
      priceUsd: 29,
      duration: '30 дней',
      description: 'Максимальная мощность',
      features: [
        'Всё из Premium',
        'Лучшая AI модель (Claude 3.5 Sonnet)',
        'Мгновенная генерация (Turbo)',
        'Детальная аналитика обучения',
        'Индивидуальный план развития',
        'Приоритетная поддержка 24/7',
      ],
      current: userTier.tier === 'pro_plus',
      color: 'from-amber-400 to-orange-500',
      icon: Crown
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
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <GradientBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <Link href="/learn" className="self-start md:self-center">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к обучению
            </Button>
          </Link>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
              Доступен ранний доступ
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Инвестируйте в своё <br className="hidden sm:block" />
              <span className="relative inline-block">
                <span className="absolute -inset-1 block -skew-y-2 bg-gradient-to-r from-purple-600 to-pink-600 opacity-40 blur-lg" aria-hidden="true" />
                <AnimatedGradientText className="relative">будущее</AnimatedGradientText>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl leading-relaxed"
            >
              Получите доступ к передовым AI-моделям, персональным рекомендациям и ускоренному обучению.
            </motion.p>
          </div>
        </header>

        {/* Current Tier Info */}
        {userTier.tier !== 'free' && userTier.tierExpiresAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto w-full max-w-2xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-[#ffd200]/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Ваш текущий план</p>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-[#ffd200]">
                    {userTier.tier === 'premium' ? 'Premium' : 'Pro+'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">Истекает</p>
                  <p className="font-medium text-white">
                    {new Date(userTier.tierExpiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards Grid - Redesigned */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 items-start">
          {pricingTiers.map((tier, index) => {
            const isCurrent = tier.current;
            const isFree = tier.id === 'free';

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-8 transition-all duration-300 backdrop-blur-xl",
                  tier.highlighted
                    ? "bg-white/10 border-white/20 shadow-2xl shadow-accent/10 lg:-mt-8 lg:mb-8 z-10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1",
                  isCurrent && "ring-2 ring-accent ring-offset-2 ring-offset-[#0c061c]"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-accent/50">
                    РЕКОМЕНДУЕМ
                  </div>
                )}

                <div className="mb-6">
                  <div className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    tier.color
                  )}>
                    <tier.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{tier.description}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  {tier.price === 0 ? (
                    <span className="text-4xl font-bold text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">{tier.price} TON</span>
                      <span className="text-sm text-white/60">≈ ${tier.priceUsd}</span>
                    </>
                  )}
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10",
                        tier.highlighted ? "text-accent" : "text-white/60"
                      )}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-white/80 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={tier.highlighted ? 'primary' : 'secondary'}
                  size="lg"
                  className={cn(
                    "w-full rounded-xl transition-all duration-300",
                    tier.highlighted
                      ? "shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02]"
                      : "bg-white/10 hover:bg-white/20 hover:text-white"
                  )}
                  onClick={() => handleSelectTier(tier.id)}
                  disabled={isLoading || isCurrent || isFree}
                >
                  {isCurrent ? 'Текущий план' : isFree ? 'Ваш план' : 'Выбрать план'}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-bold text-white"
          >
            Часто задаваемые вопросы
          </motion.h2>

          <div className="space-y-4">
            {[
              {
                q: "Что такое TON и зачем он нужен?",
                a: "TON (The Open Network) — это современный блокчейн для быстрых и безопасных платежей. Это позволяет нам принимать оплату из любой точки мира с минимальными комиссиями."
              },
              {
                q: "Как происходит процесс оплаты?",
                a: "Вы выбираете тариф, получаете адрес кошелька и уникальный комментарий. Переводите указанную сумму в любом TON-кошельке (например, Tonkeeper) — доступ открывается автоматически."
              },
              {
                q: "Что если платеж не прошел?",
                a: "Система проверяет транзакции каждые несколько секунд. Если вы отправили средства, но доступ не открылся в течение 5 минут — напишите в поддержку, мы мгновенно всё решим."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-white/60 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-8 text-center pb-12">
          <p className="text-white/50 text-sm">
            Есть вопросы? Пишите нам в <a href="https://t.me/vibestudy_support" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline hover:text-accent/80 transition-colors">Telegram поддержку</a>
          </p>
        </div>

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
