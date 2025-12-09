'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';
import QRCode from 'qrcode';

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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentData | null;
  onVerify: () => void;
  isVerifying: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  paymentData,
  onVerify,
  isVerifying,
}: PaymentModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Generate QR code
  useEffect(() => {
    if (paymentData) {
      const tonUrl = `ton://transfer/${paymentData.walletAddress}?amount=${paymentData.amountNano}&text=${encodeURIComponent(paymentData.comment)}`;
      
      QRCode.toDataURL(tonUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then(setQrCodeUrl)
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [paymentData]);

  // Update countdown timer
  useEffect(() => {
    if (!paymentData) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(paymentData.expiresAt).getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        setTimeLeft('Истекло');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentData]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen || !paymentData) return null;

  const tierName = paymentData.tier === 'premium' ? 'Premium' : 'Pro+';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl glass-panel-enhanced rounded-3xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white/95">
              Оплата {tierName}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Отправьте {paymentData.amount} TON на указанный адрес
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt="QR код для оплаты"
                width={256}
                height={256}
                unoptimized
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            <p className="mt-4 text-center text-xs text-gray-600">
              Отсканируйте QR-код в TON Wallet
            </p>
          </div>

          {/* Payment Details */}
          <div className="flex flex-col gap-4">
            {/* Amount */}
            <div className="rounded-xl bg-white/5 p-4">
              <label className="text-xs text-white/60">Сумма</label>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white/95">
                  {paymentData.amount} TON
                </span>
                <span className="text-sm text-white/60">
                  ≈ ${paymentData.usdEquivalent}
                </span>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="rounded-xl bg-white/5 p-4">
              <label className="text-xs text-white/60">Адрес кошелька</label>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis text-xs text-white/90">
                  {paymentData.walletAddress}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(paymentData.walletAddress, 'address')
                  }
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                  aria-label="Копировать адрес"
                >
                  {copiedField === 'address' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Comment */}
            <div className="rounded-xl bg-white/5 p-4">
              <label className="text-xs text-white/60">
                Комментарий (обязательно!)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis text-xs text-white/90">
                  {paymentData.comment}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(paymentData.comment, 'comment')
                  }
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
                  aria-label="Копировать комментарий"
                >
                  {copiedField === 'comment' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-yellow-400/80">
                ⚠️ Обязательно укажите комментарий при переводе
              </p>
            </div>

            {/* Timer */}
            <div className="rounded-xl bg-white/5 p-4">
              <label className="text-xs text-white/60">Действителен</label>
              <div className="mt-1 text-lg font-semibold text-white/95">
                {timeLeft}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-xl bg-blue-500/10 p-4">
          <h3 className="text-sm font-semibold text-blue-400">
            Инструкция по оплате:
          </h3>
          <ol className="mt-2 space-y-1 text-xs text-white/70">
            <li>1. Откройте TON Wallet (Tonkeeper, Tonhub и др.)</li>
            <li>2. Отсканируйте QR-код или скопируйте адрес и комментарий</li>
            <li>3. Отправьте {paymentData.amount} TON с указанным комментарием</li>
            <li>4. Нажмите "Проверить оплату" после отправки</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            className="flex-1"
            onClick={onVerify}
            isLoading={isVerifying}
            disabled={isVerifying}
          >
            {isVerifying ? 'Проверка...' : 'Проверить оплату'}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isVerifying}
          >
            Закрыть
          </Button>
        </div>

        {/* Help Link */}
        <div className="mt-4 text-center">
          <a
            href="https://ton.org/wallets"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white/90"
          >
            Нужен TON Wallet?
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
