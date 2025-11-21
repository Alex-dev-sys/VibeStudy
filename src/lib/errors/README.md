# Error Handling System

Comprehensive error handling and graceful degradation system for VibeStudy platform.

## Overview

This system provides:

1. **User-Friendly Error Messages** - Clear, actionable error messages for users
2. **Error Tracking** - Analytics and debugging for error patterns
3. **Retry Logic** - Intelligent retry with exponential backoff
4. **Content Fallback** - AI → Cache → Static fallback chain
5. **Circuit Breaker** - Prevent cascading failures

## Quick Start

### Basic Error Handling

```typescript
import { handleError } from '@/lib/errors';

try {
  await someOperation();
} catch (error) {
  // Shows user-friendly toast and logs error
  handleError(error, 'my-component');
}
```

### With Retry Logic

```typescript
import { handleErrorWithRetry } from '@/lib/errors';

try {
  await someOperation();
} catch (error) {
  // Automatically retries up to 3 times
  const result = await handleErrorWithRetry(
    error,
    'my-component',
    () => someOperation(),
    3 // max retries
  );
}
```

### Content Fallback

```typescript
import { getContentWithFallback } from '@/lib/errors';

const { content, source, isFallback } = await getContentWithFallback(
  () => generateAIContent(), // Primary: AI generation
  'python',                   // Language
  1,                          // Day number
  'task-generation'           // Context
);

// source can be: 'ai', 'cache', or 'static'
if (isFallback) {
  console.log(`Using fallback content from ${source}`);
}
```

## Components

### 1. User-Friendly Errors (`user-friendly-errors.ts`)

Converts technical errors into user-friendly messages with recovery steps.

#### Error Types

- `NETWORK_ERROR` - Connection issues
- `AI_GENERATION_FAILED` - AI service unavailable
- `AI_TIMEOUT` - AI took too long
- `AUTH_FAILED` - Authentication failed
- `AUTH_SESSION_EXPIRED` - Session expired
- `STORAGE_FULL` - Browser storage full
- `STORAGE_ERROR` - Storage operation failed
- `VALIDATION_ERROR` - Invalid input
- `RATE_LIMIT` - Too many requests
- `SERVER_ERROR` - Server-side error
- `NOT_FOUND` - Resource not found
- `PERMISSION_DENIED` - Access denied
- `CODE_EXECUTION_FAILED` - Code execution error
- `SYNC_FAILED` - Cloud sync failed
- `CACHE_ERROR` - Cache operation failed
- `UNKNOWN_ERROR` - Unidentified error

#### Usage

```typescript
import { handleError, getUserFriendlyError } from '@/lib/errors';

// Automatic handling with toast
handleError(error, 'component-name', {
  showToast: true,
  logError: true,
  onRetry: () => retryOperation()
});

// Manual handling
const friendlyError = getUserFriendlyError(error);
console.log(friendlyError.title);
console.log(friendlyError.message);
console.log(friendlyError.recoverySteps);
```

#### Custom Messages

```typescript
handleError(error, 'component-name', {
  customTitle: 'Не удалось загрузить',
  customMessage: 'Попробуй обновить страницу'
});
```

### 2. Error Tracking (`error-tracker.ts`)

Tracks errors for analytics and debugging.

#### Usage

```typescript
import { errorTracker, useErrorTracking } from '@/lib/errors';

// Track an error
errorTracker.track(
  error,
  'NETWORK_ERROR',
  'api-call',
  { endpoint: '/api/generate-tasks' }
);

// Get statistics
const stats = errorTracker.getStats();
console.log(`Total errors: ${stats.totalErrors}`);
console.log(`Error rate: ${stats.errorRate} per minute`);
console.log(`Most common: ${errorTracker.getMostCommonErrorType()}`);

// Export for debugging
const errorLog = errorTracker.export();
console.log(errorLog);

// Clear log
errorTracker.clear();
```

#### React Hook

```typescript
function MyComponent() {
  const { trackError, getStats, clearErrors } = useErrorTracking();
  
  const handleClick = async () => {
    try {
      await someOperation();
    } catch (error) {
      trackError(error, 'NETWORK_ERROR', 'button-click');
    }
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### 3. Retry Handler (`retry-handler.ts`)

Intelligent retry logic with exponential backoff.

#### Basic Retry

```typescript
import { retryOperation } from '@/lib/errors';

const result = await retryOperation(
  () => fetchData(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  }
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Failed after', result.attempts, 'attempts');
}
```

#### Retry Strategies

```typescript
import { retryWithStrategy } from '@/lib/errors';

// Aggressive: 5 attempts, short delays
const result = await retryWithStrategy(
  () => fetchData(),
  'aggressive'
);

// Conservative: 3 attempts, medium delays (default)
const result = await retryWithStrategy(
  () => fetchData(),
  'conservative'
);

// Patient: 3 attempts, long delays
const result = await retryWithStrategy(
  () => fetchData(),
  'patient'
);
```

#### Conditional Retry

```typescript
import { retryOperation } from '@/lib/errors';

const result = await retryOperation(
  () => fetchData(),
  {
    shouldRetry: (error, attempt) => {
      // Only retry network errors
      return error.message.includes('network') && attempt < 5;
    }
  }
);
```

#### Retry with Timeout

```typescript
import { retryWithTimeout } from '@/lib/errors';

const result = await retryWithTimeout(
  () => fetchData(),
  5000, // 5 second timeout
  { maxAttempts: 3 }
);
```

#### Batch Retry

```typescript
import { retryBatch } from '@/lib/errors';

const operations = [
  () => fetchUser(),
  () => fetchPosts(),
  () => fetchComments()
];

const results = await retryBatch(operations, {
  maxAttempts: 3
});

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Operation ${index} succeeded`);
  } else {
    console.log(`Operation ${index} failed`);
  }
});
```

#### Circuit Breaker

Prevents cascading failures by stopping requests after too many failures.

```typescript
import { createCircuitBreaker } from '@/lib/errors';

const breaker = createCircuitBreaker(
  () => fetchData(),
  {
    failureThreshold: 5,    // Open after 5 failures
    resetTimeout: 60000,    // Try again after 1 minute
    retryOptions: {
      maxAttempts: 3
    }
  }
);

// Execute with circuit breaker
const result = await breaker.execute();

// Check state
console.log(breaker.getState()); // 'closed', 'open', or 'half-open'

// Manual reset
breaker.reset();
```

### 4. Content Fallback (`content-fallback.ts`)

Graceful degradation with AI → Cache → Static fallback chain.

#### Basic Usage

```typescript
import { getContentWithFallback } from '@/lib/errors';

const { content, source, isFallback } = await getContentWithFallback(
  async () => {
    // Try AI generation
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      body: JSON.stringify({ language: 'python', day: 1 })
    });
    return response.json();
  },
  'python',
  1,
  'task-generation'
);

// Handle different sources
switch (source) {
  case 'ai':
    console.log('Fresh AI content');
    break;
  case 'cache':
    console.log('Using cached content');
    break;
  case 'static':
    console.log('Using static fallback');
    break;
}
```

#### Specialized Functions

```typescript
import { getTasksWithFallback, getTheoryWithFallback } from '@/lib/errors';

// Get tasks with fallback
const { content: tasks, source } = await getTasksWithFallback(
  () => generateTasks(),
  'python',
  1
);

// Get theory with fallback
const { content: theory, source } = await getTheoryWithFallback(
  () => generateTheory(),
  'python',
  1
);
```

#### Prefetching

```typescript
import { prefetchContent } from '@/lib/errors';

// Prefetch next 3 days in background
await prefetchContent('python', currentDay, 3);
```

#### Cache Management

```typescript
import { clearContentCache, getCacheStats } from '@/lib/errors';

// Get cache statistics
const stats = getCacheStats();
console.log(`Cached entries: ${stats.totalEntries}`);
console.log(`Cache size: ${stats.totalSize} bytes`);

// Clear cache
clearContentCache();
```

## Integration Examples

### API Route with Error Handling

```typescript
// src/app/api/generate-tasks/route.ts
import { handleError, retryOperation } from '@/lib/errors';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Retry AI generation
    const result = await retryOperation(
      () => callAIAPI(body),
      {
        maxAttempts: 3,
        retryableErrors: ['NETWORK_ERROR', 'AI_TIMEOUT']
      }
    );
    
    if (!result.success) {
      throw result.error;
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    handleError(error, 'api/generate-tasks', {
      showToast: false, // Don't show toast in API route
      logError: true
    });
    
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    );
  }
}
```

### React Component with Error Handling

```typescript
// src/components/dashboard/DayCard.tsx
import { handleError, getContentWithFallback } from '@/lib/errors';
import { useState } from 'react';

export function DayCard({ day, languageId }: Props) {
  const [loading, setLoading] = useState(false);
  
  const generateContent = async () => {
    setLoading(true);
    
    try {
      const { content, source, isFallback } = await getContentWithFallback(
        async () => {
          const response = await fetch('/api/generate-tasks', {
            method: 'POST',
            body: JSON.stringify({ day, languageId })
          });
          
          if (!response.ok) throw new Error('API request failed');
          
          return response.json();
        },
        languageId,
        day,
        'day-card-generation'
      );
      
      // Show info if using fallback
      if (isFallback) {
        toast.info(
          'Используем сохранённый контент',
          `Источник: ${source === 'cache' ? 'кэш' : 'стандартные задания'}`
        );
      }
      
      // Use content...
    } catch (error) {
      handleError(error, 'day-card', {
        onRetry: generateContent
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={generateContent} disabled={loading}>
        {loading ? 'Генерация...' : 'Начать день'}
      </button>
    </div>
  );
}
```

### Custom Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { handleError } from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    handleError(error, 'error-boundary', {
      showToast: true,
      logError: true
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Что-то пошло не так</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Попробовать снова
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Best Practices

### 1. Always Provide Context

```typescript
// Good
handleError(error, 'task-generation-button-click');

// Bad
handleError(error, 'error');
```

### 2. Use Appropriate Retry Strategies

```typescript
// For critical operations
await retryWithStrategy(operation, 'aggressive');

// For background tasks
await retryWithStrategy(operation, 'patient');
```

### 3. Implement Circuit Breakers for External Services

```typescript
const aiServiceBreaker = createCircuitBreaker(
  () => callAIAPI(),
  { failureThreshold: 5, resetTimeout: 60000 }
);
```

### 4. Prefetch Content When Possible

```typescript
// After completing a day, prefetch next days
await prefetchContent(languageId, completedDay, 3);
```

### 5. Monitor Error Rates

```typescript
// Check error rate periodically
if (errorTracker.isErrorRateHigh()) {
  console.warn('High error rate detected!');
  // Maybe show a banner to users
}
```

### 6. Export Error Logs for Support

```typescript
// Add to settings page
function exportErrorsForSupport() {
  const errorLog = exportErrorLog();
  downloadFile('error-log.json', errorLog);
}
```

## Testing

### Unit Tests

```typescript
import { identifyErrorType, handleError } from '@/lib/errors';

describe('Error Handling', () => {
  it('identifies network errors', () => {
    const error = new Error('fetch failed');
    expect(identifyErrorType(error)).toBe('NETWORK_ERROR');
  });
  
  it('handles errors with toast', () => {
    const error = new Error('test error');
    const result = handleError(error, 'test', { showToast: false });
    expect(result.type).toBeDefined();
  });
});
```

### Integration Tests

```typescript
import { retryOperation } from '@/lib/errors';

describe('Retry Logic', () => {
  it('retries failed operations', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    };
    
    const result = await retryOperation(operation, { maxAttempts: 3 });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
  });
});
```

## Performance Considerations

- **Caching**: Content is cached for 24 hours to reduce AI API calls
- **Exponential Backoff**: Prevents overwhelming services during outages
- **Circuit Breaker**: Stops requests to failing services automatically
- **Jitter**: Prevents thundering herd problem
- **Lazy Loading**: Error tracking data loaded on demand

## Future Enhancements

- [ ] Integration with Sentry/LogRocket for production error tracking
- [ ] Machine learning for error prediction
- [ ] Automatic error categorization
- [ ] User feedback on error messages
- [ ] A/B testing different error messages
- [ ] Error recovery suggestions based on user behavior

## Support

For issues or questions about the error handling system:

1. Check this README
2. Review error logs: `errorTracker.export()`
3. Check error statistics: `errorTracker.getStats()`
4. Contact development team with error ID
