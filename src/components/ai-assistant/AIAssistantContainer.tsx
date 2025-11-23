'use client';

/**
 * AI Assistant Container
 * Manages AI assistant state and integrates with user tier system
 */

import { useState, useEffect } from 'react';
import {
  FloatingChatButton,
  ChatInterface,
  PaywallModal,
  UpgradePrompt,
  LimitReachedNotification,
} from '@/components/ai-assistant';
import type { UserTier } from '@/types';
import { useLocaleStore } from '@/store/locale-store';

interface AIAssistantContainerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AIAssistantContainer({ isOpen: externalIsOpen, onOpenChange }: AIAssistantContainerProps = {}) {
  // State
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isChatOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsChatOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // User data - for now, default to premium tier for testing
  // TODO: Integrate with actual user tier from Supabase
  const [userTier] = useState<UserTier>('premium');
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestsLimit] = useState(30);

  // Get locale
  const { locale } = useLocaleStore();

  // Handle opening chat
  const handleOpenChat = () => {
    // For free users, show paywall
    if (userTier === 'free') {
      setShowPaywall(true);
      return;
    }

    // Open chat for premium users
    setIsChatOpen(true);
  };

  return (
    <>
      {/* Floating button to open chat */}
      <FloatingChatButton onClick={handleOpenChat} locale={locale} />

      {/* Chat interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userTier={userTier}
        locale={locale}
      />

      {/* Paywall modal for free users */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        locale={locale}
      />

      {/* Upgrade prompt for expired subscriptions */}
      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        locale={locale}
      />

      {/* Limit notification */}
      <LimitReachedNotification
        isOpen={showLimit}
        onClose={() => setShowLimit(false)}
        requestsUsed={requestsUsed}
        requestsLimit={requestsLimit}
        locale={locale}
      />
    </>
  );
}
