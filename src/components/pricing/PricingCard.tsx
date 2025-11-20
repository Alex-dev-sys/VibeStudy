'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface PricingTier {
  id: 'free' | 'premium' | 'pro_plus';
  name: string;
  price: number; // in TON
  priceUsd: number;
  duration: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tierId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingCard({ tier, onSelect, isLoading, disabled }: PricingCardProps) {
  const isFree = tier.id === 'free';
  const isCurrent = tier.current;

  return (
    <Card
      className={clsx(
        'relative flex flex-col transition-all duration-300',
        tier.highlighted && 'ring-2 ring-accent/50 scale-105',
        isCurrent && 'border-accent/30'
      )}
    >
      {tier.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent via-[#ff5bc8] to-[#ffd200] px-4 py-1 text-xs font-semibold text-[#25031f]">
          Популярный
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1 text-xs font-semibold text-white/90">
          Текущий план
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <div className="mt-4 flex items-baseline gap-2">
          {isFree ? (
            <span className="text-4xl font-bold text-white/95">Бесплатно</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-white/95">{tier.price} TON</span>
              <span className="text-sm text-white/60">≈ ${tier.priceUsd}</span>
            </>
          )}
        </div>
        <CardDescription className="mt-2">{tier.duration}</CardDescription>
      </CardHeader>

      <div className="flex-1 px-6 pb-6">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
              <span className="text-sm text-white/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <Button
          variant={tier.highlighted ? 'primary' : 'secondary'}
          className="w-full"
          onClick={() => onSelect(tier.id)}
          disabled={disabled || isCurrent || isFree}
          isLoading={isLoading}
        >
          {isCurrent ? 'Активный план' : isFree ? 'Текущий план' : 'Выбрать план'}
        </Button>
      </div>
    </Card>
  );
}
