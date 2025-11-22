# Integration Guide - AI Assistant Paywall Components

This guide shows how to integrate the paywall components with the AI Assistant feature.

## Quick Start

### 1. Import Components

```typescript
import {
  ChatInterface,
  PaywallModal,
  UpgradePrompt,
  LimitReachedNotification
} from '@/components/ai-assistant';
```

### 2. Set Up State

```typescript
const [showPaywall, setShowPaywall] = useState(false);
const [showUpgrade, setShowUpgrade] = useState(false);
const [showLimit, setShowLimit] = useState(false);
const [isChatOpen, setIsChatOpen] = useState(false);
```

### 3. Get User Data

```typescript
// From auth context or API
const userTier: UserTier = 'free'; // 'free' | 'premium' | 'pro_plus'
const tierExpiresAt = '2024-01-15T00:00:00Z';
const requestsUsed = 3;
const requestsLimit = 5;

// Check if tier is expired
const now = new Date();
const expiresDate = new Date(tierExpiresAt);
const tierExpired = expiresDate < now && userTier !== 'free';
```

### 4. Handle Chat Open

```typescript
const handleOpenChat = () => {
  // Check tier and show appropriate modal
  if (userTier === 'free') {
    setShowPaywall(true);
    return;
  }
  
  if (tierExpired) {
    setShowUpgrade(true);
    return;
  }
  
  // User has valid subscription, open chat
  setIsChatOpen(true);
};
```

### 5. Handle Message Send

```typescript
const handleSendMessage = async (message: string) => {
  // Check if limit reached
  if (userTier === 'free' && requestsUsed >= requestsLimit) {
    setShowLimit(true);
    return;
  }
  
  // Send message to API
  try {
    const response = await fetch('/api/ai-assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    // Check for tier limit error
    if (response.status === 403) {
      if (data.error === 'TIER_LIMIT_EXCEEDED') {
        setShowLimit(true);
      } else if (data.error === 'TIER_EXPIRED') {
        setShowUpgrade(true);
      }
      return;
    }
    
    // Handle successful response
    // ...
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

### 6. Render Components

```tsx
return (
  <>
    {/* Trigger button */}
    <button onClick={handleOpenChat}>
      Open AI Assistant
    </button>
    
    {/* Chat interface */}
    <ChatInterface
      isOpen={isChatOpen}
      onClose={() => setIsChatOpen(false)}
      userTier={userTier}
      locale="ru"
    />
    
    {/* Paywall for free users */}
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      locale="ru"
    />
    
    {/* Upgrade prompt for expired subscriptions */}
    <UpgradePrompt
      isOpen={showUpgrade}
      onClose={() => setShowUpgrade(false)}
      expirationDate={tierExpiresAt}
      locale="ru"
    />
    
    {/* Limit notification */}
    <LimitReachedNotification
      isOpen={showLimit}
      onClose={() => setShowLimit(false)}
      requestsUsed={requestsUsed}
      requestsLimit={requestsLimit}
      locale="ru"
    />
  </>
);
```

## Complete Example

Here's a complete example component:

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ChatInterface,
  PaywallModal,
  UpgradePrompt,
  LimitReachedNotification
} from '@/components/ai-assistant';
import type { UserTier } from '@/types';
import { getCurrentUser } from '@/lib/supabase/auth';
import { requireSupabaseClient } from '@/lib/supabase/client';

export function AIAssistantContainer() {
  // State
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // User data
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [tierExpiresAt, setTierExpiresAt] = useState<string | null>(null);
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestsLimit, setRequestsLimit] = useState(5);
  
  // Fetch user tier data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await getCurrentUser();
        if (!user) return;
        
        const supabase = requireSupabaseClient();
        const { data, error } = await supabase
          .from('users')
          .select('tier, tier_expires_at, ai_requests_today')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserTier(data.tier || 'free');
          setTierExpiresAt(data.tier_expires_at);
          setRequestsUsed(data.ai_requests_today || 0);
          
          // Set limit based on tier
          if (data.tier === 'free') {
            setRequestsLimit(5);
          } else {
            setRequestsLimit(Infinity);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Check if tier is expired
  const tierExpired = tierExpiresAt
    ? new Date(tierExpiresAt) < new Date() && userTier !== 'free'
    : false;
  
  // Handle opening chat
  const handleOpenChat = () => {
    if (userTier === 'free') {
      setShowPaywall(true);
      return;
    }
    
    if (tierExpired) {
      setShowUpgrade(true);
      return;
    }
    
    setIsChatOpen(true);
  };
  
  // Handle sending message
  const handleSendMessage = async (message: string) => {
    // Check limit
    if (userTier === 'free' && requestsUsed >= requestsLimit) {
      setShowLimit(true);
      return;
    }
    
    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      // Handle tier errors
      if (response.status === 403) {
        if (data.error === 'TIER_LIMIT_EXCEEDED') {
          setShowLimit(true);
          setRequestsUsed(data.requestsToday);
        } else if (data.error === 'TIER_EXPIRED') {
          setShowUpgrade(true);
        }
        return;
      }
      
      // Update request count
      if (data.usage) {
        setRequestsUsed(data.usage.requestsToday);
      }
      
      // Handle successful response
      // ...
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <>
      {/* Floating button to open chat */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open AI Assistant"
      >
        💬
      </button>
      
      {/* Chat interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userTier={userTier}
        locale="ru"
      />
      
      {/* Paywall modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        locale="ru"
      />
      
      {/* Upgrade prompt */}
      <UpgradePrompt
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        expirationDate={tierExpiresAt || undefined}
        locale="ru"
      />
      
      {/* Limit notification */}
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

## API Integration

### Handling API Responses

The API route should return appropriate error codes:

```typescript
// In /api/ai-assistant/chat/route.ts
export async function POST(request: NextRequest) {
  const tierCheck = await checkTierLimit(request);
  
  if (!tierCheck.allowed && tierCheck.error) {
    return NextResponse.json(
      {
        error: tierCheck.error.code, // 'TIER_LIMIT_EXCEEDED' | 'TIER_EXPIRED'
        message: tierCheck.error.message,
        tier: tierCheck.tier,
        requestsToday: tierCheck.requestsToday,
        limit: tierCheck.limit,
        upgradeUrl: '/pricing'
      },
      { status: 403 }
    );
  }
  
  // Process request...
  
  return NextResponse.json({
    message: 'Response from AI',
    usage: {
      requestsToday: tierCheck.requestsToday,
      limit: tierCheck.limit
    }
  });
}
```

### Client-Side Error Handling

```typescript
const response = await fetch('/api/ai-assistant/chat', {
  method: 'POST',
  body: JSON.stringify({ message })
});

const data = await response.json();

if (response.status === 403) {
  switch (data.error) {
    case 'TIER_LIMIT_EXCEEDED':
      setShowLimit(true);
      setRequestsUsed(data.requestsToday);
      break;
    case 'TIER_EXPIRED':
      setShowUpgrade(true);
      break;
    case 'UNAUTHORIZED':
      // Redirect to login
      router.push('/login');
      break;
  }
  return;
}

// Handle success
```

## Locale Support

Get locale from user preferences:

```typescript
import { useLocaleStore } from '@/store/locale-store';

function MyComponent() {
  const { locale } = useLocaleStore();
  
  return (
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      locale={locale} // 'ru' | 'en'
    />
  );
}
```

## Best Practices

### 1. Check Tier Before Opening Chat

Always check tier status before opening the chat interface:

```typescript
// ✅ Good
const handleOpenChat = () => {
  if (userTier === 'free') {
    setShowPaywall(true);
    return;
  }
  setIsChatOpen(true);
};

// ❌ Bad - Opens chat then shows paywall
const handleOpenChat = () => {
  setIsChatOpen(true);
  if (userTier === 'free') {
    setShowPaywall(true);
  }
};
```

### 2. Update Request Count After Each Request

Keep the UI in sync with actual usage:

```typescript
const response = await fetch('/api/ai-assistant/chat', {
  method: 'POST',
  body: JSON.stringify({ message })
});

const data = await response.json();

// Update local state
if (data.usage) {
  setRequestsUsed(data.usage.requestsToday);
}
```

### 3. Handle All Error Cases

Don't assume requests will always succeed:

```typescript
try {
  const response = await fetch('/api/ai-assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    // Handle HTTP errors
    if (response.status === 403) {
      // Handle tier errors
    } else if (response.status === 429) {
      // Handle rate limiting
    } else {
      // Handle other errors
    }
    return;
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

### 4. Provide Visual Feedback

Show remaining requests to free users:

```tsx
{userTier === 'free' && (
  <div className="text-sm text-gray-400">
    {requestsLimit - requestsUsed} requests remaining today
  </div>
)}
```

### 5. Close Modals After Navigation

When user clicks upgrade button, close the modal:

```typescript
<PaywallModal
  isOpen={showPaywall}
  onClose={() => setShowPaywall(false)} // Modal handles this
  locale="ru"
/>
```

The components automatically close when the pricing link is clicked.

## Troubleshooting

### Modal Not Showing

Check that:
1. `isOpen` prop is `true`
2. Component is rendered in the DOM
3. z-index is high enough (components use z-[1001])

### Tier Check Not Working

Verify:
1. User data is fetched correctly
2. Tier expiration date is valid ISO string
3. Tier comparison logic is correct

### Translations Not Showing

Ensure:
1. Locale prop is passed correctly
2. Translations are added to both locale files
3. Locale store is initialized

## Next Steps

After integrating these components:

1. Test all user flows (free, premium, expired)
2. Verify API error handling
3. Test on mobile devices
4. Check accessibility with screen reader
5. Monitor usage analytics
6. Gather user feedback

## Support

For questions or issues:
- Check PAYWALL_USAGE.md for component API
- See VISUAL_REFERENCE.md for design specs
- Visit /demo/ai-assistant-paywall for live examples
