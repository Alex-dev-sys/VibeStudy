'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getReferralStats, generateReferralLink } from '@/lib/supabase/referrals';
import { getCurrentUser } from '@/lib/supabase/auth';
import { useTranslations } from '@/store/locale-store';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
}

export function ReferralWidget() {
  const t = useTranslations();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) {
        setError(t.referral?.authRequired || 'Authentication required');
        setLoading(false);
        return;
      }

      // Generate referral link
      const link = generateReferralLink(user.id);
      setReferralLink(link);

      // Fetch referral stats
      const referralStats = await getReferralStats();
      setStats({
        totalReferrals: referralStats.totalReferrals,
        completedReferrals: referralStats.completedReferrals,
        pendingReferrals: referralStats.pendingReferrals
      });
    } catch (err) {
      console.error('Error loading referral data:', err);
      setError(t.errors?.generic || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle>
            {t.referral?.title || 'Реферальная программа'}
          </CardTitle>
        </CardHeader>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-white/60">
              {t.common?.loading || 'Загрузка...'}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle>
            {t.referral?.title || 'Реферальная программа'}
          </CardTitle>
        </CardHeader>
        <div className="mt-4">
          <div className="text-center text-white/60 py-4">
            {error}
          </div>
        </div>
      </Card>
    );
  }

  const progress = stats ? Math.min((stats.completedReferrals % 5) / 5 * 100, 100) : 0;
  const nextReward = stats ? 5 - (stats.completedReferrals % 5) : 5;
  const totalRewards = stats ? Math.floor(stats.completedReferrals / 5) : 0;

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>🎁</span>
            <span>{t.referral?.title || 'Реферальная программа'}</span>
          </CardTitle>
          {totalRewards > 0 && (
            <div className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">
              {totalRewards} {t.referral?.rewardsEarned || 'наград получено'}
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-white/70">
          {t.referral?.description || 
            'Приглашай друзей и получай 1 месяц Premium за каждые 5 завершенных регистраций'}
        </p>
      </CardHeader>

      <div className="mt-6 space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              {t.referral?.progress || 'Прогресс до следующей награды'}
            </span>
            <span className="font-semibold text-accent">
              {stats?.completedReferrals || 0} / {Math.ceil((stats?.completedReferrals || 0) / 5) * 5}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent to-accent-soft"
            />
          </div>

          <div className="text-center text-sm text-white/60">
            {nextReward === 5 ? (
              <span>
                {t.referral?.startInviting || 'Пригласите 5 друзей, чтобы получить 1 месяц Premium'}
              </span>
            ) : (
              <span>
                {t.referral?.friendsLeft?.replace('{count}', nextReward.toString()) || 
                  `Осталось пригласить ${nextReward} ${nextReward === 1 ? 'друга' : 'друзей'}`}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats?.completedReferrals || 0}
            </div>
            <div className="text-xs text-white/60">
              {t.referral?.completed || 'Завершено'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats?.pendingReferrals || 0}
            </div>
            <div className="text-xs text-white/60">
              {t.referral?.pending || 'Ожидают'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-xs text-white/60">
              {t.referral?.total || 'Всего'}
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white/90">
            {t.referral?.yourLink || 'Ваша реферальная ссылка'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 rounded-lg border border-white/20 bg-black/60 px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            />
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="md"
              onClick={copyToClipboard}
              className="min-w-[100px]"
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span className="ml-2">{t.referral?.copied || 'Скопировано'}</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span className="ml-2">{t.referral?.copy || 'Копировать'}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="text-sm font-medium text-white/90">
            {t.referral?.howItWorks || 'Как это работает:'}
          </div>
          <ol className="space-y-1 text-sm text-white/70">
            <li>
              1. {t.referral?.step1 || 'Поделитесь ссылкой с друзьями'}
            </li>
            <li>
              2. {t.referral?.step2 || 'Друг регистрируется по вашей ссылке'}
            </li>
            <li>
              3. {t.referral?.step3 || 'После первого входа друга реферал засчитывается'}
            </li>
            <li>
              4. {t.referral?.step4 || 'За каждые 5 рефералов вы получаете 1 месяц Premium'}
            </li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
