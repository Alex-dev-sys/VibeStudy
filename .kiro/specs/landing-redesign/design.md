# Design Document

## Overview

Редизайн главной страницы и страницы логина VibeStudy с фокусом на современный минималистичный дизайн, высокую конверсию и wow-эффект. Используем темную тему с градиентами, белые акценты и плавные анимации.

## Architecture

### Component Structure

```
src/
├── app/
│   ├── page.tsx (новая landing page)
│   └── login/
│       └── page.tsx (новая страница логина)
├── components/
│   ├── landing/
│   │   ├── ModernHero.tsx (главная секция)
│   │   ├── StatsSection.tsx (статистика с анимацией)
│   │   ├── FeaturesGrid.tsx (преимущества)
│   │   └── CTASection.tsx (финальный призыв)
│   └── auth/
│       ├── LoginForm.tsx (форма входа)
│       ├── GoogleButton.tsx (кнопка Google OAuth)
│       └── DecorativeLines.tsx (белые линии)
```

## Components and Interfaces

### 1. ModernHero Component

**Purpose:** Главная секция с крупным заголовком и CTA

**Props:**
```typescript
interface ModernHeroProps {
  locale?: 'ru' | 'en';
}
```

**Features:**
- Крупный заголовок с градиентом
- Подзаголовок с описанием
- Главная CTA кнопка
- Анимированный фон с частицами

### 2. LoginForm Component

**Purpose:** Минималистичная форма входа с белыми линиями

**Props:**
```typescript
interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}
```

**Design:**
- Темный фон (#0a0a0a)
- Белые закругленные поля (border: 2px solid white, border-radius: 50px)
- Градиентная кнопка (pink to yellow)
- Декоративные белые линии по краям

### 3. GoogleButton Component

**Purpose:** Кнопка для входа через Google

**Props:**
```typescript
interface GoogleButtonProps {
  onClick: () => void;
  isLoading: boolean;
  locale?: 'ru' | 'en';
}
```

**Design:**
- Белая обводка
- Иконка Google слева
- Hover эффект

## Data Models

### User Authentication Flow

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  provider: 'google' | 'email';
  created_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Landing page redirects authenticated users
*For any* authenticated user visiting the landing page, the system should redirect them to /learn
**Validates: Requirements 6.3**

### Property 2: Login form validates email format
*For any* string entered in the email field, the system should only accept valid email formats (contains @ and domain)
**Validates: Requirements 2.3**

### Property 3: Google OAuth creates or updates user
*For any* successful Google OAuth flow, the system should either create a new user profile or update existing one
**Validates: Requirements 3.3**

### Property 4: CTA buttons navigate to login
*For any* CTA button clicked on landing page, the system should navigate to /login page
**Validates: Requirements 1.4**

### Property 5: Mobile layout adapts correctly
*For any* screen width less than 768px, the system should use mobile-optimized layout
**Validates: Requirements 4.1**

### Property 6: Animations trigger on element visibility
*For any* element with animation, the animation should trigger when element enters viewport
**Validates: Requirements 5.1**

## Error Handling

### Authentication Errors

```typescript
enum AuthErrorCode {
  INVALID_EMAIL = 'invalid_email',
  OAUTH_FAILED = 'oauth_failed',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit'
}

interface AuthError {
  code: AuthErrorCode;
  message: string;
  userMessage: string; // Локализованное сообщение для пользователя
}
```

**Error Display:**
- Показывать ошибки под формой
- Использовать shake анимацию
- Автоматически скрывать через 5 секунд

## Testing Strategy

### Unit Tests
- Валидация email формата
- Навигация между страницами
- Обработка ошибок OAuth

### Property-Based Tests
- Property 1-6 (см. Correctness Properties)
- Используем библиотеку: `fast-check` для TypeScript
- Минимум 100 итераций на тест

### Integration Tests
- Полный flow регистрации через Google
- Полный flow входа через Magic Link
- Редирект авторизованных пользователей

## Implementation Notes

### Styling Approach
- TailwindCSS для всех стилей
- Framer Motion для анимаций
- Градиенты: `from-[#ff4bc1] to-[#ffd34f]`
- Темный фон: `#0a0a0a`, `#1a1a1a`

### Performance
- Lazy load компонентов landing page
- Оптимизация изображений (WebP)
- Prefetch /login route

### Accessibility
- ARIA labels для всех интерактивных элементов
- Keyboard navigation
- Focus indicators
- Screen reader support
