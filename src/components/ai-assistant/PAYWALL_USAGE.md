# AI Assistant Paywall Components

This document describes the paywall and upgrade prompt components for the AI Learning Assistant feature.

## Components

### 1. PaywallModal

Displayed to **free users** when they attempt to access the AI assistant.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `locale?: 'ru' | 'en'` - Language preference (default: 'ru')

**Features:**
- Shows benefits of Premium subscription
- Displays free tier limitations (5 requests/day)
- Links to pricing page
- Responsive design with animations

**Usage:**
```tsx
import { PaywallModal } from '@/components/ai-assistant';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);
  
  return (
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      locale="ru"
    />
  );
}
```

### 2. UpgradePrompt

Displayed to users with **expired subscriptions**.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `expirationDate?: string` - ISO date string of when subscription expired
- `locale?: 'ru' | 'en'` - Language preference (default: 'ru')

**Features:**
- Shows expiration date
- Lists Premium benefits
- Reassures user that progress is saved
- Links to pricing page for renewal

**Usage:**
```tsx
import { UpgradePrompt } from '@/components/ai-assistant';

function MyComponent() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const expirationDate = '2024-01-15T00:00:00Z';
  
  return (
    <UpgradePrompt
      isOpen={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      expirationDate={expirationDate}
      locale="ru"
    />
  );
}
```

### 3. LimitReachedNotification

Displayed when user reaches their **daily AI request limit**.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `requestsUsed: number` - Number of requests used today
- `requestsLimit: number` - Total daily limit
- `locale?: 'ru' | 'en'` - Language preference (default: 'ru')

**Features:**
- Shows usage progress bar
- Displays requests used vs limit
- Informs when limit resets (tomorrow)
- Promotes Premium upgrade
- Links to pricing page

**Usage:**
```tsx
import { LimitReachedNotification } from '@/components/ai-assistant';

function MyComponent() {
  const [showLimit, setShowLimit] = useState(false);
  
  return (
    <LimitReachedNotification
      isOpen={showLimit}
      onClose={() => setShowLimit(false)}
      requestsUsed={5}
      requestsLimit={5}
      locale="ru"
    />
  );
}
```

## Integration Example

Here's how to integrate these components with the AI Assistant:

```tsx
import { useState, useEffect } from 'react';
import { ChatInterface, PaywallModal, UpgradePrompt, LimitReachedNotification } from '@/components/ai-assistant';
import type { UserTier } from '@/types';

function AIAssistantContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  
  // Mock user data - replace with actual user data
  const userTier: UserTier = 'free';
  const tierExpired = false;
  const tierExpiresAt = '2024-01-15T00:00:00Z';
  const requestsUsed = 3;
  const requestsLimit = 5;
  
  const handleOpenChat = () => {
    // Check tier and show appropriate modal
    if (userTier === 'free') {
      setShowPaywall(true);
    } else if (tierExpired) {
      setShowUpgrade(true);
    } else {
      setIsChatOpen(true);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    // Check if limit reached before sending
    if (userTier === 'free' && requestsUsed >= requestsLimit) {
      setShowLimit(true);
      return;
    }
    
    // Send message to API...
  };
  
  return (
    <>
      <button onClick={handleOpenChat}>
        Open AI Assistant
      </button>
      
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userTier={userTier}
        locale="ru"
      />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        locale="ru"
      />
      
      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        expirationDate={tierExpiresAt}
        locale="ru"
      />
      
      <LimitReachedNotification
        isOpen={showLimit}
        onClose={() => setShowLimit(false)}
        requestsUsed={requestsUsed}
        requestsLimit={requestsLimit}
        locale="ru"
      />
    </>
  );
}
```

## Styling

All components use the VibeStudy design system:
- **Background**: `#1a1a1a` (dark)
- **Secondary background**: `#2a2a2a`
- **Accent gradient**: `#ff4bc1` → `#ffd34f`
- **Text**: White with gray variants
- **Animations**: Fade-in on mount
- **Border radius**: Rounded-2xl for modern look

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support (ESC to close)
- Focus management
- Screen reader friendly content
- Click outside to close functionality

## Requirements Validation

These components satisfy the following requirements from the design document:

- **Requirement 1.2**: Free users see paywall with subscription options ✓
- **Requirement 1.3**: Expired subscriptions show upgrade prompt ✓
- **Requirement 8.2**: Usage limits trigger notifications ✓

All components link to `/pricing` page for subscription management.
