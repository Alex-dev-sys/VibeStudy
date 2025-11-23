'use client';

/**
 * AI Assistant Container
 * Manages AI assistant state and integrates with user tier system
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ChatInterface,
  PaywallModal,
  UpgradePrompt,
  LimitReachedNotification,
} from '@/components/ai-assistant';
import { useAIAssistant } from './AIAssistantContext';
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
  const { isOpen: contextIsOpen, setIsOpen: setContextIsOpen } = useAIAssistant();

  // Use external control if provided, otherwise use context
  const isChatOpen = externalIsOpen !== undefined ? externalIsOpen : contextIsOpen;
  const setIsChatOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setContextIsOpen(open);
    }
  };

  // User data - for now, default to premium tier for testing
  // TODO: Integrate with actual user tier from Supabase
  const [userTier] = useState<UserTier>('premium');
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestsLimit] = useState(30);

  // Get locale
  const { locale } = useLocaleStore();
  const { setOpenHandler } = useAIAssistant();

  // Handle opening chat
  const handleOpenChat = useCallback(() => {
    // For free users, show paywall
    if (userTier === 'free') {
      setShowPaywall(true);
      return;
    }

    // Open chat for premium users
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setContextIsOpen(true);
    }
  }, [userTier, onOpenChange, setContextIsOpen]);

  // Register open handler in context
  useEffect(() => {
    setOpenHandler(handleOpenChat);
  }, [setOpenHandler, handleOpenChat]);

  return (
    <>
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
