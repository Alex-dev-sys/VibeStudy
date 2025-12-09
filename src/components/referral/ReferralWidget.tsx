'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getReferralStats, generateReferralLink } from '@/lib/supabase/referrals';
import { getCurrentUser } from '@/lib/supabase/auth';
import { useTranslations } from '@/store/locale-store';
import { Gift, Copy, Check } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
}

export function ReferralWidget() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Generate referral link
        const link = generateReferralLink(currentUser.id);
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

    loadReferralData();
  }, [t.errors?.generic]);

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
      <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
        <div className="flex items-center justify-center py-8 text-white/60 text-sm">
          {t.common?.loading || 'Загрузка...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Реферальная программа</h3>
            <p className="text-xs text-white/60">Приглашай друзей</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-white/70 mb-4">
            Войдите в аккаунт, чтобы приглашать друзей и получать награды.
          </p>
          <Link href="/login">
            <Button variant="primary" size="sm" className="w-full">
              Войти
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
        <div className="text-center text-sm text-red-400 py-4">
          {error}
        </div>
      </div>
    );
  }

  const progress = stats ? Math.min((stats.completedReferrals % 5) / 5 * 100, 100) : 0;
  const nextReward = stats ? 5 - (stats.completedReferrals % 5) : 5;
  const totalRewards = stats ? Math.floor(stats.completedReferrals / 5) : 0;

  return (
    <div className="rounded-xl bg-[#1e1e1e] p-5 shadow-lg ring-1 ring-white/5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Рефералы</h3>
            <p className="text-xs text-white/60">Бонусы за друзей</p>
          </div>
        </div>
        {totalRewards > 0 && (
          <div className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-medium text-purple-300 border border-purple-500/20">
            {totalRewards} {t.referral?.rewardsEarned || 'наград'}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">
              До следующей награды
            </span>
            <span className="font-medium text-purple-400">
              {stats?.completedReferrals || 0} / {Math.ceil((stats?.completedReferrals || 0) / 5) * 5}
            </span>
          </div>

          <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>

          <p className="text-[10px] text-white/40 text-center">
            {nextReward === 5 ? (
              'Пригласите 5 друзей для получения 1 месяца Premium'
            ) : (
              `Осталось пригласить ${nextReward} ${nextReward === 1 ? 'друга' : 'друзей'}`
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/5 p-2 text-center">
            <div className="text-lg font-bold text-purple-400">
              {stats?.completedReferrals || 0}
            </div>
            <div className="text-[10px] text-white/40">Завершено</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {stats?.pendingReferrals || 0}
            </div>
            <div className="text-[10px] text-white/40">Ожидают</div>
          </div>
          <div className="rounded-lg bg-white/5 p-2 text-center">
            <div className="text-lg font-bold text-white">
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-[10px] text-white/40">Всего</div>
          </div>
        </div>

        {/* Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/70">
            Ваша ссылка
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <Button
              variant={copied ? 'primary' : 'secondary'}
              size="sm"
              onClick={copyToClipboard}
              className="h-auto min-w-[40px] px-3 py-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
