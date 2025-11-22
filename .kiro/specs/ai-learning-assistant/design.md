# Design Document: AI Learning Assistant

## Overview

AI Learning Assistant - это интеллектуальный помощник, интегрированный в платформу VibeStudy, который помогает премиум-пользователям эффективнее учиться программированию. Ассистент использует существующую AI инфраструктуру платформы (AIRouter, AI-client) и предоставляет контекстно-зависимую помощь через удобный чат-интерфейс.

Ключевые возможности:
- Ответы на вопросы по материалам курса с учетом текущего дня обучения
- Помощь с отладкой кода без предоставления готовых решений
- Персонализированные рекомендации на основе прогресса пользователя
- Мотивационная поддержка и советы по обучению
- Адаптивный интерфейс для десктопа и мобильных устройств

## Visual Design

### Desktop Layout

Чат-интерфейс будет отображаться как **плавающая панель** в правой части экрана:

```
┌─────────────────────────────────────────────────────────────────────┐
│  VibeStudy - День 15: Циклы в Python                    [👤] [⚙️]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐ │
│  │                             │  │  💬 AI Ассистент        [─][×]│ │
│  │   Теория дня                │  ├──────────────────────────────┤ │
│  │                             │  │                              │ │
│  │   Циклы позволяют...        │  │  🤖 Привет! Я твой AI       │ │
│  │                             │  │     помощник. Сегодня        │ │
│  │   for i in range(10):       │  │     изучаем циклы в Python.  │ │
│  │       print(i)              │  │     Чем могу помочь? 😊      │ │
│  │                             │  │                     10:30     │ │
│  │                             │  │                              │ │
│  ├─────────────────────────────┤  │  👤 Как работает range()?   │ │
│  │                             │  │                     10:31     │ │
│  │   Задачи                    │  │                              │ │
│  │                             │  │  🤖 Отличный вопрос!         │ │
│  │   ☐ Задача 1               │  │     range() создаёт...       │ │
│  │   ☐ Задача 2               │  │                              │ │
│  │   ☐ Задача 3               │  │     ```python                │ │
│  │                             │  │     for i in range(5):       │ │
│  │                             │  │         print(i)             │ │
│  │                             │  │     # Выведет: 0,1,2,3,4     │ │
│  │                             │  │     ```                      │ │
│  │                             │  │                     10:31     │ │
│  │                             │  │                              │ │
│  │   [Редактор кода]           │  │  ⚡ Быстрые действия:        │ │
│  │                             │  │  [Объясни концепцию]         │ │
│  │                             │  │  [Помоги с кодом]            │ │
│  │                             │  │  [Дай подсказку]             │ │
│  │                             │  ├──────────────────────────────┤ │
│  │                             │  │ 💬 Напиши сообщение...  [↑] │ │
│  └─────────────────────────────┘  └──────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Ключевые элементы интерфейса:

**1. Заголовок чата**
```
┌──────────────────────────────────┐
│ 💬 AI Ассистент          [─] [×] │
│ Premium • GPT-4o                  │
└──────────────────────────────────┘
```
- Иконка и название
- Индикатор тарифа (Premium/Pro+)
- Используемая модель
- Кнопки: свернуть, закрыть

**2. Область сообщений**
```
┌──────────────────────────────────┐
│                                  │
│  🤖 [Сообщение ассистента]      │
│     [Текст с форматированием]    │
│     ```python                    │
│     [Код с подсветкой]           │
│     ```                          │
│     • Список предложений         │
│                        10:30     │
│                                  │
│  👤 [Сообщение пользователя]    │
│     [Текст вопроса]              │
│                        10:31     │
│                                  │
│  🤖 ⋯ Печатает...               │
│                                  │
└──────────────────────────────────┘
```

**3. Быстрые действия**
```
┌──────────────────────────────────┐
│ ⚡ Быстрые действия:             │
│ [📚 Объясни концепцию]           │
│ [💻 Помоги с кодом]              │
│ [💡 Дай подсказку]               │
│ [📊 Совет по обучению]           │
└──────────────────────────────────┘
```

**4. Поле ввода**
```
┌──────────────────────────────────┐
│ 💬 Напиши сообщение...      [↑] │
│                                  │
│ [📎] [🎤] [⌨️]        5/5 сегодня│
└──────────────────────────────────┘
```
- Текстовое поле с placeholder
- Кнопка отправки
- Опции: прикрепить код, голосовой ввод
- Счетчик использованных запросов

### Mobile Layout

На мобильных устройствах чат открывается **на весь экран**:

```
┌─────────────────────────┐
│ [←] AI Ассистент   [⋮] │
├─────────────────────────┤
│                         │
│  🤖 Привет! Сегодня    │
│     изучаем циклы.      │
│     Чем помочь? 😊      │
│              10:30      │
│                         │
│  👤 Как работает       │
│     range()?            │
│              10:31      │
│                         │
│  🤖 range() создаёт... │
│                         │
│     ```python           │
│     for i in range(5):  │
│         print(i)        │
│     ```                 │
│              10:31      │
│                         │
│  ⚡ Быстрые действия:   │
│  [Объясни] [Код]        │
│  [Подсказка] [Совет]    │
│                         │
├─────────────────────────┤
│ 💬 Сообщение...    [↑] │
└─────────────────────────┘
```

### Состояния интерфейса

**1. Свернутый режим (Floating Button)**
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│                                  │
│                                  │
│                          ┌────┐  │
│                          │ 💬 │  │
│                          │ AI │  │
│                          └────┘  │
└──────────────────────────────────┘
```

**2. Загрузка ответа**
```
┌──────────────────────────────────┐
│  🤖 ⋯ Думаю над ответом...      │
│     [▓▓▓▓▓░░░░░] 50%            │
└──────────────────────────────────┘
```

**3. Ошибка**
```
┌──────────────────────────────────┐
│  ⚠️ Не удалось получить ответ   │
│     Проверьте подключение        │
│     [🔄 Повторить]               │
└──────────────────────────────────┘
```

**4. Лимит исчерпан (Free tier)**
```
┌──────────────────────────────────┐
│  🔒 Лимит запросов исчерпан      │
│                                  │
│  Вы использовали 5/5 запросов    │
│  сегодня. Обновите подписку для  │
│  неограниченного доступа!        │
│                                  │
│  [⭐ Перейти на Premium]         │
└──────────────────────────────────┘
```

### Цветовая схема

Используем существующую палитру VibeStudy:

- **Фон чата**: `#1a1a1a` (темный)
- **Сообщения ассистента**: `#2a2a2a` с акцентом `#ff4bc1`
- **Сообщения пользователя**: `#2a2a2a` с акцентом `#ffd34f`
- **Код блоки**: Monaco Editor theme (темная)
- **Кнопки**: Gradient `#ff4bc1` → `#ffd34f`
- **Текст**: `#ffffff` (основной), `#a0a0a0` (вторичный)

### Анимации

1. **Появление чата**: Slide-in справа (300ms ease-out)
2. **Новое сообщение**: Fade-in + slide-up (200ms)
3. **Печатает**: Пульсирующие точки
4. **Кнопки**: Hover scale (1.05) + shadow
5. **Код блоки**: Syntax highlight с transition

### Адаптивность

- **Desktop (>1024px)**: Плавающая панель 400px справа
- **Tablet (768-1024px)**: Плавающая панель 350px справа
- **Mobile (<768px)**: Полноэкранный режим

### Accessibility

- Keyboard navigation (Tab, Enter, Esc)
- Screen reader support (ARIA labels)
- High contrast mode support
- Focus indicators
- Минимальный размер кнопок: 44x44px (touch-friendly)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Assistant Chat Interface (React Component)       │  │
│  │  - Message Input                                      │  │
│  │  - Message History                                    │  │
│  │  - Quick Actions                                      │  │
│  │  - Typing Indicators                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/ai-assistant/chat                              │  │
│  │  - Tier Check Middleware                             │  │
│  │  - Rate Limiting                                      │  │
│  │  - Context Building                                   │  │
│  │  - Request Validation                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Assistant Service                                 │  │
│  │  - Context Aggregator                                 │  │
│  │  - Prompt Builder                                     │  │
│  │  - Response Parser                                    │  │
│  │  - Session Manager                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Integration Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AIRouter (existing)                                  │  │
│  │  - Tier-based Model Selection                         │  │
│  │  - Fallback Handling                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Progress Store (existing)                            │  │
│  │  - User Progress Data                                 │  │
│  │  - Day States                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Achievements Store (existing)                        │  │
│  │  - User Stats                                         │  │
│  │  - Achievements                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase                                             │  │
│  │  - User Tier & Subscription                           │  │
│  │  - AI Request Tracking                                │  │
│  │  - Chat History (optional)                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Storage                                      │  │
│  │  - Temporary Chat History                             │  │
│  │  - Context Cache                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User Interaction**: Пользователь отправляет сообщение через чат-интерфейс
2. **Tier Verification**: Middleware проверяет подписку и лимиты
3. **Context Building**: Система собирает контекст (день, язык, прогресс, код)
4. **AI Request**: Запрос отправляется через AIRouter с контекстом
5. **Response Processing**: Ответ парсится и форматируется
6. **UI Update**: Интерфейс обновляется с новым сообщением
7. **Analytics**: Логируется использование для мониторинга

## Components and Interfaces

### 1. Chat Interface Component

**Location**: `src/components/ai-assistant/ChatInterface.tsx`

```typescript
interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    codeBlocks?: CodeBlock[];
    suggestions?: string[];
  };
}

interface CodeBlock {
  language: string;
  code: string;
}
```

**Responsibilities**:
- Отображение истории сообщений
- Обработка пользовательского ввода
- Показ индикаторов загрузки
- Рендеринг code blocks с подсветкой синтаксиса
- Управление состоянием чата (открыт/закрыт)

### 2. AI Assistant Service

**Location**: `src/lib/ai-assistant/service.ts`

```typescript
interface AssistantContext {
  userId: string;
  tier: UserTier;
  currentDay: number;
  languageId: string;
  dayState: DayStateSnapshot;
  progressRecord: ProgressRecord;
  achievements: UserStats;
  conversationHistory: Message[];
}

interface AssistantRequest {
  message: string;
  context: AssistantContext;
  requestType: 'question' | 'code-help' | 'advice' | 'general';
}

interface AssistantResponse {
  message: string;
  codeExamples?: CodeBlock[];
  suggestions?: string[];
  relatedTopics?: string[];
}

class AIAssistantService {
  async sendMessage(request: AssistantRequest): Promise<AssistantResponse>;
  buildPrompt(request: AssistantRequest): string;
  parseResponse(raw: string): AssistantResponse;
  aggregateContext(userId: string): Promise<AssistantContext>;
}
```

**Responsibilities**:
- Агрегация контекста из различных источников
- Построение промптов для AI
- Парсинг и форматирование ответов
- Управление историей разговора в сессии

### 3. API Route

**Location**: `src/app/api/ai-assistant/chat/route.ts`

```typescript
interface ChatRequest {
  message: string;
  requestType?: 'question' | 'code-help' | 'advice' | 'general';
  code?: string;
  taskId?: string;
}

interface ChatResponse {
  message: string;
  codeExamples?: CodeBlock[];
  suggestions?: string[];
  relatedTopics?: string[];
  usage?: {
    requestsToday: number;
    limit: number;
  };
}
```

**Middleware Stack**:
1. `withTierCheck` - проверка подписки и лимитов
2. Rate limiting - защита от злоупотреблений
3. Request validation - валидация входных данных

### 4. Session Manager

**Location**: `src/lib/ai-assistant/session-manager.ts`

```typescript
interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  startedAt: number;
  lastActivity: number;
}

class SessionManager {
  createSession(userId: string): ChatSession;
  getSession(sessionId: string): ChatSession | null;
  addMessage(sessionId: string, message: Message): void;
  clearSession(sessionId: string): void;
  getRecentMessages(sessionId: string, count: number): Message[];
}
```

**Responsibilities**:
- Управление сессиями чата
- Хранение истории в памяти (sessionStorage)
- Очистка старых сессий
- Ограничение размера истории

### 5. Context Aggregator

**Location**: `src/lib/ai-assistant/context-aggregator.ts`

```typescript
class ContextAggregator {
  async getUserContext(userId: string): Promise<AssistantContext>;
  async getCurrentDayContent(languageId: string, day: number): Promise<DayContent>;
  async getUserProgress(userId: string): Promise<ProgressData>;
  async getUserAchievements(userId: string): Promise<UserStats>;
}
```

**Responsibilities**:
- Сбор данных из progress-store
- Получение контента текущего дня
- Агрегация статистики пользователя
- Кэширование контекста

## Data Models

### Message Model

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    codeBlocks?: CodeBlock[];
    suggestions?: string[];
    relatedTopics?: string[];
    requestType?: string;
  };
}
```

### Chat Session Model

```typescript
interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  startedAt: number;
  lastActivity: number;
  context: {
    day: number;
    languageId: string;
    taskId?: string;
  };
}
```

### Assistant Context Model

```typescript
interface AssistantContext {
  // User Info
  userId: string;
  tier: UserTier;
  
  // Learning Context
  currentDay: number;
  languageId: string;
  dayState: DayStateSnapshot;
  
  // Progress Data
  completedDays: number[];
  currentStreak: number;
  totalTasksCompleted: number;
  
  // Current Day Content
  dayTheory?: string;
  dayTasks?: Task[];
  
  // Conversation History
  recentMessages: Message[];
}
```

### Usage Analytics Model

```typescript
interface AssistantUsageLog {
  id: string;
  userId: string;
  tier: UserTier;
  requestType: string;
  messageLength: number;
  responseLength: number;
  processingTime: number;
  modelUsed: string;
  timestamp: number;
  success: boolean;
  error?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Access Control Properties

**Property 1: Premium users see assistant interface**
*For any* premium user accessing the learning dashboard, the AI assistant interface should be rendered and accessible
**Validates: Requirements 1.1**

**Property 2: Free users see paywall**
*For any* free user attempting to access the AI assistant, a paywall with subscription options should be displayed instead of the chat interface
**Validates: Requirements 1.2**

**Property 3: Expired subscriptions are blocked**
*For any* user with an expired subscription, attempting to access the AI assistant should result in access denial and an upgrade prompt
**Validates: Requirements 1.3**

**Property 4: Subscription verification on every request**
*For any* AI assistant request, the system should verify the user's subscription status before processing
**Validates: Requirements 1.4**

### Context Awareness Properties

**Property 5: Welcome message includes context**
*For any* user context (day, language), the initial welcome message should reference the current day and programming language
**Validates: Requirements 1.5**

**Property 6: Questions include day context**
*For any* user question, the AI prompt should include the current day number and day's topic
**Validates: Requirements 2.1, 6.1**

**Property 7: Responses reference user language**
*For any* AI response, code examples and explanations should be in the user's selected programming language
**Validates: Requirements 2.2, 2.3, 6.4**

**Property 8: Theory questions use curriculum**
*For any* theory question, the AI prompt should include relevant curriculum content for the current day
**Validates: Requirements 2.4, 6.2**

**Property 9: Conversation context is maintained**
*For any* sequence of messages in a session, subsequent AI requests should include previous messages as context
**Validates: Requirements 2.5**

**Property 10: Examples match curriculum level**
*For any* AI response with examples, the complexity should align with the current day number (early days = simpler examples)
**Validates: Requirements 6.5**

### Code Analysis Properties

**Property 11: Code is analyzed for errors**
*For any* code shared with the assistant, the system should attempt to identify syntax or logical errors
**Validates: Requirements 3.1**

**Property 12: Errors are explained**
*For any* detected code error, the AI response should contain an explanation of the error
**Validates: Requirements 3.2**

**Property 13: Suggestions are provided**
*For any* code analysis request, the AI response should include improvement suggestions
**Validates: Requirements 3.3**

**Property 14: No complete solutions given**
*For any* task-related question, the AI response should not contain a complete solution to the task
**Validates: Requirements 3.4, 6.3**

**Property 15: Skill level is respected**
*For any* code analysis, the AI prompt should include the user's current day and skill level
**Validates: Requirements 3.5**

### Personalization Properties

**Property 16: Progress is analyzed for advice**
*For any* advice request, the system should fetch and include the user's progress history in the AI prompt
**Validates: Requirements 4.1**

**Property 17: Recommendations consider metrics**
*For any* recommendation request, the AI prompt should include completed days, achievements, and struggle areas
**Validates: Requirements 4.2**

**Property 18: Alternative explanations for struggles**
*For any* request indicating difficulty, the AI response should include alternative explanations or resources
**Validates: Requirements 4.3**

**Property 19: Motivational support includes progress**
*For any* AI response, when appropriate, it should reference the user's streak and progress for motivation
**Validates: Requirements 4.4**

**Property 20: Study strategies are personalized**
*For any* advice request, the AI response should include study strategies based on the user's learning patterns
**Validates: Requirements 4.5**

### UI/UX Properties

**Property 21: Typing indicators during generation**
*For any* message send action, a typing indicator should appear while waiting for the AI response
**Validates: Requirements 5.2**

**Property 22: Messages have timestamps**
*For any* message displayed in the chat, it should include a visible timestamp
**Validates: Requirements 5.3**

**Property 23: Code blocks have syntax highlighting**
*For any* message containing code blocks, syntax highlighting should be applied based on the language
**Validates: Requirements 5.4**

**Property 24: Chat history is scrollable**
*For any* chat session with more messages than fit in the viewport, the message container should be scrollable
**Validates: Requirements 5.5**

### Performance Properties

**Property 25: Response time under 5 seconds**
*For any* AI assistant request under normal conditions, the response should be received within 5 seconds
**Validates: Requirements 7.1**

**Property 26: Error messages on service failure**
*For any* AI service failure, a clear error message with retry option should be displayed to the user
**Validates: Requirements 7.2**

**Property 27: Rate limiting is enforced**
*For any* user sending requests rapidly, rate limiting should be applied after exceeding the threshold
**Validates: Requirements 7.3**

**Property 28: Failed requests are queued**
*For any* network error during a request, the message should be queued for retry
**Validates: Requirements 7.4**

**Property 29: Identical requests are cached**
*For any* identical request sent twice, the second request should be served from cache (faster response)
**Validates: Requirements 7.5**

### Analytics Properties

**Property 30: Requests are tracked**
*For any* AI assistant request, the user's request count should be incremented
**Validates: Requirements 8.1**

**Property 31: Limits trigger notifications**
*For any* user reaching their usage limit, a notification should be displayed and throttling applied
**Validates: Requirements 8.2**

**Property 32: Interactions are logged**
*For any* AI assistant interaction, a log entry should be created with request details
**Validates: Requirements 8.3**

**Property 33: Inappropriate content is blocked**
*For any* request containing inappropriate content, the request should be filtered or blocked
**Validates: Requirements 8.4**

**Property 34: Usage analytics are collected**
*For any* AI assistant request, analytics data (type, duration, success) should be recorded
**Validates: Requirements 8.5**

### Privacy Properties

**Property 35: Session-only history by default**
*For any* new chat session, messages should be stored only in session storage (not persisted to database)
**Validates: Requirements 9.1**

**Property 36: History cleared on session end**
*For any* session that ends, the chat history should be cleared unless the user opted to save
**Validates: Requirements 9.2**

**Property 37: Conversations are isolated**
*For any* user, they should only be able to access their own chat history (queries filtered by user ID)
**Validates: Requirements 9.3**

**Property 38: History can be deleted**
*For any* user requesting history deletion, all their chat messages should be removed immediately
**Validates: Requirements 9.5**

### Mobile Properties

**Property 39: Responsive layout**
*For any* viewport width below 768px, the chat interface should adapt to a mobile-friendly layout
**Validates: Requirements 10.1**

**Property 40: Touch interactions work**
*For any* touch event on mobile, the interface should respond appropriately (scroll, tap, swipe)
**Validates: Requirements 10.2**

**Property 41: Interface is collapsible**
*For any* mobile view, the chat interface should have collapse/expand functionality
**Validates: Requirements 10.5**

## Error Handling

### Error Categories

1. **Authentication Errors**
   - User not logged in
   - Invalid session
   - Expired subscription

2. **Validation Errors**
   - Empty message
   - Message too long (>2000 chars)
   - Invalid request type

3. **Rate Limit Errors**
   - Daily limit exceeded
   - Request rate too high
   - Tier limit reached

4. **AI Service Errors**
   - API timeout
   - Model unavailable
   - Invalid response format

5. **Network Errors**
   - Connection lost
   - Request timeout
   - Server error

### Error Handling Strategy

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    userMessage: string; // Friendly message for UI
    retryable: boolean;
    upgradePrompt?: {
      tier: string;
      url: string;
    };
  };
}
```

**Error Recovery**:
- Automatic retry for network errors (max 3 attempts)
- Fallback to simpler model on AI service errors
- Queue messages for later retry on connection loss
- Clear error messages with actionable steps

**User Feedback**:
- Toast notifications for transient errors
- Inline error messages in chat for request failures
- Upgrade prompts for tier limit errors
- Retry buttons for recoverable errors

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Test Coverage**:
1. **Context Aggregator Tests**
   - Test context building with various user states
   - Test handling of missing data
   - Test caching behavior

2. **Prompt Builder Tests**
   - Test prompt generation for different request types
   - Test context inclusion
   - Test prompt length limits

3. **Response Parser Tests**
   - Test parsing of valid AI responses
   - Test handling of malformed responses
   - Test code block extraction

4. **Session Manager Tests**
   - Test session creation and retrieval
   - Test message history management
   - Test session cleanup

### Property-Based Testing

**Framework**: fast-check (JavaScript property testing library)

**Configuration**: Each property test should run minimum 100 iterations

**Test Organization**: Each property-based test must be tagged with a comment referencing the design document property:
```typescript
// Feature: ai-learning-assistant, Property 1: Premium users see assistant interface
```

**Property Tests**:

1. **Access Control Properties (1-4)**
   - Generate random user tiers and verify correct UI rendering
   - Generate random subscription states and verify access control
   - Test subscription verification on all request types

2. **Context Awareness Properties (5-10)**
   - Generate random user contexts and verify context inclusion in prompts
   - Generate random conversation histories and verify context maintenance
   - Test language and day context across all request types

3. **Code Analysis Properties (11-15)**
   - Generate random code samples (valid and invalid) and verify analysis
   - Generate random task questions and verify no complete solutions
   - Test skill level adaptation across different days

4. **Personalization Properties (16-20)**
   - Generate random progress histories and verify personalization
   - Generate random struggle patterns and verify recommendations
   - Test motivational content inclusion

5. **UI/UX Properties (21-24)**
   - Generate random message sequences and verify UI updates
   - Generate random code blocks and verify syntax highlighting
   - Test scrolling behavior with varying message counts

6. **Performance Properties (25-29)**
   - Test response times with various request sizes
   - Test error handling with simulated failures
   - Test caching with identical requests

7. **Analytics Properties (30-34)**
   - Generate random request sequences and verify tracking
   - Test limit enforcement with rapid requests
   - Verify logging for all interaction types

8. **Privacy Properties (35-38)**
   - Test session storage behavior
   - Test history isolation between users
   - Test deletion functionality

9. **Mobile Properties (39-41)**
   - Test responsive behavior at various viewport sizes
   - Test touch event handling
   - Test collapse/expand functionality

### Integration Testing

**Framework**: Playwright

**Test Scenarios**:
1. End-to-end chat flow (send message, receive response)
2. Tier verification and paywall display
3. Code sharing and analysis
4. Mobile responsive behavior
5. Error handling and recovery

### Performance Testing

**Metrics**:
- Response time: < 5 seconds (p95)
- UI render time: < 100ms
- Memory usage: < 50MB for chat component
- Cache hit rate: > 30% for common questions

## Implementation Notes

### Integration with Existing Systems

1. **AIRouter Integration**
   - Use existing `createAIRouter(tier)` for model selection
   - Leverage tier-based fallback mechanism
   - Reuse AI caching infrastructure

2. **Progress Store Integration**
   - Subscribe to progress updates for context
   - Use existing `useProgressStore` hooks
   - Leverage day state snapshots

3. **Achievements Integration**
   - Include achievement data in context
   - Use `useAchievementsStore` for stats
   - Reference achievements in motivational messages

4. **Middleware Integration**
   - Use existing `withTierCheck` middleware
   - Leverage existing rate limiting
   - Reuse authentication helpers

### Prompt Engineering

**System Prompt Template**:
```
You are an AI learning assistant for VibeStudy, a programming education platform.
Your role is to help students learn {languageId} programming.

Current Context:
- Student is on Day {day} of 90
- Today's topic: {topic}
- Student's tier: {tier}
- Completed days: {completedDays}
- Current streak: {streak}

Guidelines:
1. Be encouraging and supportive
2. Explain concepts clearly without giving complete solutions
3. Provide code examples in {languageId}
4. Reference the current day's material when relevant
5. Adapt complexity to the student's level (Day {day})
6. Keep responses concise but helpful

Remember: Your goal is to guide learning, not to solve problems for the student.
```

**User Prompt Template**:
```
Student Question: {message}

{if code provided}
Student's Code:
```{languageId}
{code}
```
{endif}

{if task context}
Current Task: {taskTitle}
{taskDescription}
{endif}

{if conversation history}
Recent Conversation:
{recentMessages}
{endif}
```

### Caching Strategy

1. **Context Caching**
   - Cache user context for 5 minutes
   - Invalidate on progress updates
   - Store in memory (not database)

2. **Response Caching**
   - Cache common questions for 24 hours
   - Key: hash(message + day + language)
   - Store in existing AI cache system

3. **Session Caching**
   - Store in sessionStorage
   - Clear on tab close
   - Max 50 messages per session

### Security Considerations

1. **Input Sanitization**
   - Limit message length (2000 chars)
   - Strip HTML/scripts from input
   - Validate request types

2. **Rate Limiting**
   - Free tier: 5 requests/day
   - Premium: 30 requests/minute
   - Pro+: 100 requests/minute

3. **Content Filtering**
   - Block inappropriate language
   - Prevent prompt injection
   - Filter sensitive data from logs

4. **Data Privacy**
   - No persistent storage by default
   - User ID isolation in queries
   - GDPR-compliant deletion

### Localization

Support for Russian and English:
- System prompts in both languages
- UI text from i18n system
- Error messages localized
- Code examples language-agnostic

### Monitoring and Analytics

**Metrics to Track**:
- Request volume by tier
- Response times (p50, p95, p99)
- Error rates by type
- Cache hit rates
- User satisfaction (implicit: retry rate)
- Most common question types
- Model usage distribution

**Logging**:
- All requests logged with metadata
- Errors logged with stack traces
- Performance metrics logged
- Usage patterns analyzed weekly
