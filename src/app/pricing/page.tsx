'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PricingCard, type PricingTier } from '@/components/pricing/PricingCard';
import { PaymentModal } from '@/components/pricing/PaymentModal';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { ArrowLeft, Zap, Sparkles, Crown, ChevronDown } from 'lucide-react';
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
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 text-center max-w-3xl mx-auto">
          <Link href="/learn" className="self-start md:self-center">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к обучению
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-accent ring-1 ring-inset ring-accent/20 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
              Доступен ранний доступ
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Инвестируйте в своё <br className="hidden sm:block" />
              <span className="relative inline-block">
                <span className="absolute -inset-1 block -skew-y-2 bg-gradient-to-r from-purple-600 to-pink-600 opacity-40 blur-lg" aria-hidden="true" />
                <AnimatedGradientText className="relative">будущее</AnimatedGradientText>
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl leading-relaxed">
              Получите доступ к передовым AI-моделям, персональным рекомендациям и ускоренному обучению. Станьте разработчиком быстрее с Premium.
            </p>
          </div>
        </header>

        {/* Current Tier Info - Enhanced */}
        {userTier.tier !== 'free' && userTier.tierExpiresAt && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl"
          >
            <div className="rounded-2xl bg-gradient-to-r from-accent/10 to-[#ffd200]/10 px-6 py-4 text-center shadow-inner">
              <p className="text-base text-white/90">
                Ваш текущий план:{' '}
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-[#ffd200]">
                  {userTier.tier === 'premium' ? 'Premium' : 'Pro+'}
                </span>
                {' • '}
                <span className="text-white/60 text-sm">
                  Активен до {new Date(userTier.tierExpiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-auto w-full max-w-md rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {pricingTiers.map((tier, index) => (
            <div key={tier.id} className={tier.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}>
              <PricingCard
                tier={tier}
                onSelect={handleSelectTier}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>

        {/* Features Comparison - Enhanced */}
        <section className="mt-16 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Почему стоит выбрать <span className="text-accent">Premium</span>?
            </h2>
            <p className="mt-4 text-white/60">
              Инструменты профессионального уровня для вашего роста
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Zap,
                color: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20",
                title: "Безлимитный AI",
                desc: "Забудьте об ограничениях. Генерируйте код, получайте объяснения и решайте задачи 24/7."
              },
              {
                icon: Sparkles,
                color: "text-[#ffd200]",
                bg: "bg-[#ffd200]/10",
                border: "border-[#ffd200]/20",
                title: "Топовые модели",
                desc: "Доступ к GPT-4o и Claude 3.5 Sonnet — самым мощным нейросетям для программирования на сегодня."
              },
              {
                icon: Crown,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
                title: "Персональный ментор",
                desc: "AI анализирует ваш код и стиль, предлагая улучшения и материалы, которые нужны именно вам."
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20 hover:bg-white/8 hover:shadow-2xl hover:shadow-accent/10"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.border} border shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-white/60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ - Enhanced */}
        <section className="mt-16 max-w-4xl mx-auto w-full">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">
            Часто задаваемые вопросы
          </h2>

          <div className="grid gap-4">
            {[
              {
                q: "Что такое TON и зачем он нужен?",
                a: "TON (The Open Network) — это современный блокчейн, который мы используем для быстрых и безопасных платежей. Это позволяет нам принимать оплату из любой точки мира с минимальными комиссиями."
              },
              {
                q: "Как происходит процесс оплаты?",
                a: "Всё просто: вы выбираете тариф, получаете адрес кошелька и уникальный комментарий. Переводите указанную сумму в любом TON-кошельке (например, Tonkeeper) — и доступ открывается автоматически."
              },
              {
                q: "Что произойдет по окончании подписки?",
                a: "Подписка не продлевается автоматически. По истечении 30 дней ваш аккаунт просто вернется на тариф Free. Никаких скрытых списаний с вашей карты или кошелька."
              },
              {
                q: "Если платеж не прошел?",
                a: "Не волнуйтесь. Система проверяет транзакции каждые несколько секунд. Если вы отправили средства, но доступ не открылся в течение 5 минут — напишите в поддержку, мы мгновенно всё решим."
              }
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/8 open:bg-white/10">
                <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-white/90 focus:outline-none">
                  {faq.q}
                  <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/50 transition-transform group-open:rotate-180">
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-white/60 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-12 text-center pb-12">
          <p className="text-white/50 text-sm">
            Есть вопросы? Пишите нам в <a href="https://t.me/vibestudy_support" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Telegram поддержку</a>
          </p>
        </div>

      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent blur-[100px]" />
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
