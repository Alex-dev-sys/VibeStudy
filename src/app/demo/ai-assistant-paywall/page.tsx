'use client';

/**
 * Demo page for AI Assistant Paywall Components
 * This page demonstrates all three paywall/upgrade components
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaywallModal, UpgradePrompt, LimitReachedNotification } from '@/components/ai-assistant';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AIAssistantPaywallDemo() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [locale, setLocale] = useState<'ru' | 'en'>('ru');

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">AI Assistant Paywall Demo</h1>
          <p className="text-gray-400">
            Test the paywall, upgrade prompt, and limit notification components
          </p>
        </div>

        {/* Language Toggle */}
        <div className="mb-8 p-4 bg-[#2a2a2a] rounded-xl">
          <h2 className="text-lg font-semibold mb-3">Language</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLocale('ru')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                locale === 'ru'
                  ? 'bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Русский
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                locale === 'en'
                  ? 'bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Component Demos */}
        <div className="space-y-6">
          {/* Paywall Modal */}
          <div className="p-6 bg-[#2a2a2a] rounded-xl">
            <h2 className="text-xl font-semibold mb-2">1. Paywall Modal</h2>
            <p className="text-gray-400 mb-4">
              Shown to free users when they try to access AI assistant
            </p>
            <Button
              onClick={() => setShowPaywall(true)}
              className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f]"
            >
              Show Paywall
            </Button>
          </div>

          {/* Upgrade Prompt */}
          <div className="p-6 bg-[#2a2a2a] rounded-xl">
            <h2 className="text-xl font-semibold mb-2">2. Upgrade Prompt</h2>
            <p className="text-gray-400 mb-4">
              Shown to users with expired subscriptions
            </p>
            <Button
              onClick={() => setShowUpgrade(true)}
              className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f]"
            >
              Show Upgrade Prompt
            </Button>
          </div>

          {/* Limit Reached Notification */}
          <div className="p-6 bg-[#2a2a2a] rounded-xl">
            <h2 className="text-xl font-semibold mb-2">3. Limit Reached Notification</h2>
            <p className="text-gray-400 mb-4">
              Shown when user reaches daily request limit
            </p>
            <Button
              onClick={() => setShowLimit(true)}
              className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f]"
            >
              Show Limit Notification
            </Button>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-8 p-6 bg-[#2a2a2a] rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-3">Implementation Notes</h2>
          <ul className="space-y-2 text-gray-400">
            <li>• All components are fully responsive and mobile-friendly</li>
            <li>• Support both Russian and English languages</li>
            <li>• Include proper accessibility features (ARIA labels, keyboard navigation)</li>
            <li>• Link to /pricing page for subscription management</li>
            <li>• Use VibeStudy design system (gradient accents, dark theme)</li>
            <li>• Smooth animations and transitions</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        locale={locale}
      />

      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        expirationDate="2024-01-15T00:00:00Z"
        locale={locale}
      />

      <LimitReachedNotification
        isOpen={showLimit}
        onClose={() => setShowLimit(false)}
        requestsUsed={5}
        requestsLimit={5}
        locale={locale}
      />
    </main>
  );
}
