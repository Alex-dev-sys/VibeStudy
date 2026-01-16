/**
 * TON Blockchain Client
 * Handles TON payment creation, verification, and transaction monitoring
 */

import { Address } from '@ton/core';
import TonWeb from 'tonweb';
import { createHmac, randomBytes } from 'crypto';
import { retryBlockchain } from '@/lib/utils/retry';

// Pricing configuration in TON
export const TON_PRICING = {
  PREMIUM: {
    amount: 5, // TON
    usdEquivalent: 12, // USD
    duration: 30, // days
    tier: 'premium' as const,
  },
  PRO_PLUS: {
    amount: 12, // TON
    usdEquivalent: 29, // USD
    duration: 30, // days
    tier: 'pro_plus' as const,
  },
} as const;

export type TierType = typeof TON_PRICING.PREMIUM.tier | typeof TON_PRICING.PRO_PLUS.tier;

// Environment variables
const TON_WALLET_ADDRESS = process.env.TON_WALLET_ADDRESS;
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY;
const TON_API_KEY = process.env.TON_API_KEY;

// TON network configuration
const MAINNET_API_URL = 'https://toncenter.com/api/v2/jsonRPC';
const TESTNET_API_URL = 'https://testnet.toncenter.com/api/v2/jsonRPC';

// Use testnet for development, mainnet for production
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction ? MAINNET_API_URL : TESTNET_API_URL;

/**
 * Initialize TonWeb client
 */
function getTonWebClient() {
  if (!TONCENTER_API_KEY) {
    throw new Error('TONCENTER_API_KEY is not configured');
  }

  return new TonWeb(new TonWeb.HttpProvider(API_URL, {
    apiKey: TONCENTER_API_KEY,
  }));
}

/**
 * Validate TON wallet address
 */
export function validateTonAddress(address: string): boolean {
  try {
    Address.parse(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the configured wallet address
 */
export function getWalletAddress(): string {
  if (!TON_WALLET_ADDRESS) {
    throw new Error('TON_WALLET_ADDRESS is not configured');
  }

  if (!validateTonAddress(TON_WALLET_ADDRESS)) {
    throw new Error('TON_WALLET_ADDRESS is invalid');
  }

  return TON_WALLET_ADDRESS;
}

/**
 * Generate a cryptographically secure payment comment for tracking
 * Includes HMAC signature to prevent comment reuse attacks
 */
export function generatePaymentComment(userId: string, paymentId?: string): string {
  const timestamp = Date.now();
  const nonce = randomBytes(8).toString('hex'); // 16 char random string

  // Use payment secret from env or generate one
  const secret = process.env.TON_PAYMENT_SECRET || 'default-secret-change-in-production';

  // Create data string to sign
  const dataToSign = `${userId}:${timestamp}:${nonce}:${paymentId || ''}`;

  // Generate HMAC signature
  const signature = createHmac('sha256', secret)
    .update(dataToSign)
    .digest('hex')
    .slice(0, 16); // Use first 16 chars for brevity

  return `vs_${userId}_${timestamp}_${nonce}_${signature}`;
}

/**
 * Verify payment comment signature to prevent reuse
 */
export function verifyPaymentCommentSignature(comment: string, userId: string): boolean {
  try {
    // Parse comment format: vs_userId_timestamp_nonce_signature
    const parts = comment.split('_');
    if (parts.length !== 5 || parts[0] !== 'vs') {
      return false;
    }

    const [, commentUserId, timestamp, nonce, providedSignature] = parts;

    // Verify user ID matches
    if (commentUserId !== userId) {
      return false;
    }

    // Recreate signature
    const secret = process.env.TON_PAYMENT_SECRET || 'default-secret-change-in-production';
    const dataToSign = `${commentUserId}:${timestamp}:${nonce}:`;
    const expectedSignature = createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex')
      .slice(0, 16);

    return providedSignature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Create payment data for a tier
 */
export interface PaymentData {
  walletAddress: string;
  amount: number;
  amountNano: string;
  comment: string;
  tier: TierType;
  usdEquivalent: number;
}

export function createPaymentData(tier: TierType, userId: string): PaymentData {
  const pricing = tier === 'premium' ? TON_PRICING.PREMIUM : TON_PRICING.PRO_PLUS;
  const comment = generatePaymentComment(userId);
  
  // Convert TON to nanoTON (1 TON = 10^9 nanoTON)
  const amountNano = (pricing.amount * 1_000_000_000).toString();

  return {
    walletAddress: getWalletAddress(),
    amount: pricing.amount,
    amountNano,
    comment,
    tier,
    usdEquivalent: pricing.usdEquivalent,
  };
}

/**
 * Transaction data from TON blockchain
 */
export interface TonTransaction {
  hash: string;
  from: string;
  to: string;
  value: string; // in nanoTON
  comment?: string;
  timestamp: number;
}

/**
 * Raw transaction response from TON API
 */
interface TonApiTransaction {
  transaction_id?: { hash?: string };
  in_msg?: {
    source?: string;
    destination?: string;
    value?: string;
    message?: string;
  };
  utime?: number;
}

/**
 * Get transactions for the wallet address with automatic retries
 */
export async function getWalletTransactions(
  limit: number = 100
): Promise<TonTransaction[]> {
  return retryBlockchain(async () => {
    const tonweb = getTonWebClient();
    const walletAddress = getWalletAddress();

    const response = await tonweb.provider.getTransactions(walletAddress, limit);

    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((tx: TonApiTransaction) => ({
      hash: tx.transaction_id?.hash || '',
      from: tx.in_msg?.source || '',
      to: tx.in_msg?.destination || walletAddress,
      value: tx.in_msg?.value || '0',
      comment: tx.in_msg?.message || '',
      timestamp: tx.utime || 0,
    }));
  }, {
    maxRetries: 5,
    initialDelay: 2000
  });
}

/**
 * Find a transaction by payment comment with retries
 */
export async function findTransactionByComment(
  comment: string,
  minAmount: number // in TON
): Promise<TonTransaction | null> {
  try {
    const transactions = await getWalletTransactions(100);
    const minAmountNano = (minAmount * 1_000_000_000).toString();

    // Find transaction with matching comment and sufficient amount
    const transaction = transactions.find((tx) => {
      const hasMatchingComment = tx.comment?.includes(comment);
      const hasSufficientAmount = BigInt(tx.value) >= BigInt(minAmountNano);
      return hasMatchingComment && hasSufficientAmount;
    });

    return transaction || null;
  } catch (error) {
    // Return null on failure to allow graceful degradation
    return null;
  }
}

/**
 * Verify a payment by checking if a transaction exists with the given comment
 */
export interface PaymentVerificationResult {
  verified: boolean;
  transaction?: TonTransaction;
  error?: string;
}

export async function verifyPayment(
  comment: string,
  expectedAmount: number // in TON
): Promise<PaymentVerificationResult> {
  try {
    const transaction = await findTransactionByComment(comment, expectedAmount);

    if (!transaction) {
      return {
        verified: false,
        error: 'Transaction not found',
      };
    }

    return {
      verified: true,
      transaction,
    };
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get pricing information for a tier
 */
export function getPricingForTier(tier: TierType) {
  return tier === 'premium' ? TON_PRICING.PREMIUM : TON_PRICING.PRO_PLUS;
}

/**
 * Convert nanoTON to TON
 */
export function nanoTonToTon(nanoTon: string | number): number {
  return Number(nanoTon) / 1_000_000_000;
}

/**
 * Convert TON to nanoTON
 */
export function tonToNanoTon(ton: number): string {
  return (ton * 1_000_000_000).toString();
}

/**
 * Format TON amount for display
 */
export function formatTonAmount(amount: number): string {
  return `${amount.toFixed(2)} TON`;
}

/**
 * Check if TON client is properly configured
 */
export function isTonConfigured(): boolean {
  return !!(TON_WALLET_ADDRESS && TONCENTER_API_KEY);
}
