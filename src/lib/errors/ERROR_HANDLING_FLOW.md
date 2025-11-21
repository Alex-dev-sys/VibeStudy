# Error Handling Flow Diagram

## Overview

This document provides visual representations of the error handling flows in the VibeStudy platform.

## 1. Basic Error Handling Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Operation     │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Error? │
    └───┬────┘
        │
    ┌───┴───┐
    │  Yes  │
    └───┬───┘
        │
        ▼
┌─────────────────────┐
│ identifyErrorType() │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ getUserFriendly     │
│ Error()             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Show Toast          │
│ Notification        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Log Error           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Track Error         │
│ (Analytics)         │
└─────────────────────┘
```

## 2. Retry Logic Flow

```
┌─────────────────┐
│  Operation      │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Error? │
    └───┬────┘
        │
    ┌───┴───┐
    │  Yes  │
    └───┬───┘
        │
        ▼
┌─────────────────────┐
│ Is Retryable?       │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │  Yes  │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Attempt < Max?      │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │  Yes  │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Calculate Delay     │
│ (Exponential        │
│  Backoff + Jitter)  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Wait (delay)        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Retry Operation     │
└─────────┬───────────┘
          │
          ▼
    ┌────────┐
    │Success?│
    └───┬────┘
        │
    ┌───┴───┐
    │  Yes  │──────► Return Result
    └───────┘
        │
    ┌───┴───┐
    │  No   │──────► Loop Back
    └───────┘
```

## 3. Content Fallback Chain

```
┌─────────────────────┐
│ Request Content     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Try AI Generation   │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │Success│──────► Return AI Content
      └───────┘        (source: 'ai')
          │
      ┌───┴───┐
      │ Fail  │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Check Cache         │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │ Found │──────► Return Cached Content
      └───────┘        (source: 'cache')
          │
      ┌───┴───┐
      │ Miss  │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Use Static Fallback │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Return Static       │
│ Content             │
│ (source: 'static')  │
└─────────────────────┘
```

## 4. Circuit Breaker State Machine

```
┌─────────────────────┐
│   CLOSED            │
│ (Normal Operation)  │
└─────────┬───────────┘
          │
          │ Failure Count
          │ >= Threshold
          ▼
┌─────────────────────┐
│   OPEN              │
│ (Reject Requests)   │
└─────────┬───────────┘
          │
          │ After Reset
          │ Timeout
          ▼
┌─────────────────────┐
│   HALF-OPEN         │
│ (Test Recovery)     │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │Success│──────► Back to CLOSED
      └───────┘
          │
      ┌───┴───┐
      │ Fail  │──────► Back to OPEN
      └───────┘
```

## 5. Complete Error Handling Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      User Action                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Try Operation                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                       ┌───┴───┐
                       │ Error │
                       └───┬───┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Identify     │  │ Track Error  │  │ Log Error    │
│ Error Type   │  │ (Analytics)  │  │ (Console)    │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ Is Retryable?│
└──────┬───────┘
       │
   ┌───┴───┐
   │  Yes  │
   └───┬───┘
       │
       ▼
┌──────────────────┐
│ Circuit Breaker  │
│ Check            │
└──────┬───────────┘
       │
   ┌───┴───┐
   │ Closed│
   └───┬───┘
       │
       ▼
┌──────────────────┐
│ Retry with       │
│ Exponential      │
│ Backoff          │
└──────┬───────────┘
       │
   ┌───┴───┐
   │Success│──────► Return Result
   └───────┘
       │
   ┌───┴───┐
   │ Fail  │
   └───┬───┘
       │
       ▼
┌──────────────────┐
│ Content Fallback │
│ (if applicable)  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Show User-       │
│ Friendly Error   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Offer Retry      │
│ (if applicable)  │
└──────────────────┘
```

## 6. Error Tracking Data Flow

```
┌─────────────────┐
│  Error Occurs   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ errorTracker.track()│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Create ErrorEvent   │
│ - id                │
│ - type              │
│ - message           │
│ - stack             │
│ - context           │
│ - timestamp         │
│ - metadata          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Store in Memory     │
│ (last 100 errors)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Save to localStorage│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Send to Analytics   │
│ (Production only)   │
└─────────────────────┘
```

## 7. Cache Management Flow

```
┌─────────────────┐
│ Request Content │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Generate Cache Key  │
│ (language-day-N)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Check localStorage  │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │ Found │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Check TTL           │
│ (24 hours)          │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │ Valid │──────► Return Cached
      └───────┘
          │
      ┌───┴───┐
      │Expired│
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Generate New        │
│ Content             │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Save to Cache       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Check Quota         │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │  Full │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Clear Old Entries   │
│ (7+ days)           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Retry Save          │
└─────────────────────┘
```

## 8. User Experience Flow

```
┌─────────────────────┐
│ User Clicks Button  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Show Loading State  │
│ (<100ms feedback)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Execute Operation   │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │Success│──────► Show Success Toast
      └───────┘        Hide Loading
          │
      ┌───┴───┐
      │ Error │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Show Loading Toast  │
│ "Retrying..."       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Retry Operation     │
│ (with backoff)      │
└─────────┬───────────┘
          │
      ┌───┴───┐
      │Success│──────► Show Success Toast
      └───────┘        "Succeeded!"
          │
      ┌───┴───┐
      │ Fail  │
      └───┬───┘
          │
          ▼
┌─────────────────────┐
│ Show Error Toast    │
│ - Clear Title       │
│ - Helpful Message   │
│ - Recovery Steps    │
│ - Retry Button      │
└─────────────────────┘
```

## Key Principles

### 1. User-First
- Clear, non-technical error messages
- Actionable recovery steps
- Immediate feedback (<100ms)
- Automatic retry when possible

### 2. Resilient
- Multiple fallback layers
- Circuit breaker prevents cascading failures
- Graceful degradation
- Self-healing with automatic retry

### 3. Observable
- Comprehensive error tracking
- Detailed logging
- Analytics integration
- Export for debugging

### 4. Maintainable
- Centralized error handling
- Consistent patterns
- Type-safe
- Well-documented

## Performance Characteristics

### Retry Delays (Conservative Strategy)
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Total max time: ~3 seconds

### Cache Performance
- Cache hit: <10ms
- Cache miss + AI: 2-5 seconds
- Cache miss + fallback: <50ms

### Circuit Breaker
- Failure threshold: 5 failures
- Reset timeout: 60 seconds
- Half-open test: Single request

## Error Message Examples

### Network Error
```
Title: "Проблема с подключением"
Message: "Не удалось связаться с сервером. Проверь интернет-соединение и попробуй снова."
Action: "Повторить"
Recovery Steps:
  1. Проверь подключение к интернету
  2. Попробуй перезагрузить страницу
  3. Если проблема сохраняется, попробуй позже
```

### AI Generation Failed
```
Title: "Не удалось сгенерировать задания"
Message: "AI временно недоступен. Попробуй через минуту или используй стандартные задания."
Action: "Использовать стандартные"
Recovery Steps:
  1. Подожди 1-2 минуты и попробуй снова
  2. Используй стандартные задания из библиотеки
  3. Проверь подключение к интернету
```

## Integration Examples

See `src/lib/errors/README.md` for detailed integration examples with:
- API routes
- React components
- Error boundaries
- Custom hooks
