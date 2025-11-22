# Implementation Plan: AI Learning Assistant

- [x] 1. Set up core infrastructure and types
  - Create TypeScript interfaces for Message, ChatSession, AssistantContext, AssistantRequest/Response
  - Define error types and response formats
  - Set up directory structure: `src/lib/ai-assistant/` and `src/components/ai-assistant/`
  - _Requirements: 1.1, 2.1, 5.1_

- [x] 1.1 Write property test for message model
  - **Property 22: Messages have timestamps**
  - **Validates: Requirements 5.3**

- [x] 2. Implement Session Manager
  - Create SessionManager class with in-memory storage
  - Implement session creation, retrieval, and cleanup
  - Add message history management with size limits (max 50 messages)
  - Implement session expiration logic (clear after 1 hour of inactivity)
  - _Requirements: 2.5, 9.1, 9.2_

- [x] 2.1 Write property test for session management
  - **Property 9: Conversation context is maintained**
  - **Validates: Requirements 2.5**

- [x] 2.2 Write property test for session cleanup
  - **Property 35: Session-only history by default**
  - **Property 36: History cleared on session end**
  - **Validates: Requirements 9.1, 9.2**

- [x] 3. Implement Context Aggregator
  - Create ContextAggregator class to collect user data
  - Implement getUserContext() to fetch from progress-store and achievements-store
  - Implement getCurrentDayContent() to get curriculum content
  - Add context caching with 5-minute TTL
  - _Requirements: 2.1, 2.2, 4.1, 6.1, 6.2_

- [x] 3.1 Write property test for context building
  - **Property 6: Questions include day context**
  - **Property 7: Responses reference user language**
  - **Validates: Requirements 2.1, 2.2, 6.1, 6.4**

- [x] 3.2 Write property test for progress inclusion
  - **Property 16: Progress is analyzed for advice**
  - **Property 17: Recommendations consider metrics**
  - **Validates: Requirements 4.1, 4.2**

- [x] 4. Implement Prompt Builder


  - Create `src/lib/ai-assistant/prompt-builder.ts` with PromptBuilder class
  - Create prompt templates for different request types (question, code-help, advice, general)
  - Implement buildPrompt() method with context injection
  - Add system prompt with user context (day, language, tier, progress)
  - Implement prompt length limiting and truncation
  - Support both Russian and English prompts based on locale
  - _Requirements: 2.3, 2.4, 3.4, 6.3, 6.5_

- [x] 4.1 Write property test for context inclusion






  - **Property 8: Theory questions use curriculum**
  - **Property 10: Examples match curriculum level**
  - **Validates: Requirements 2.4, 6.2, 6.5**
- [x] 4.2 Write property test for solution prevention







- [ ] 4.2 Write property test for solution prevention


  - **Property 14: No complete solutions given**
  - **Validates: Requirements 3.4, 6.3**

- [x] 5. Implement Response Parser


  - Create `src/lib/ai-assistant/response-parser.ts` with ResponseParser class
  - Create parseResponse() method to extract message, code blocks, suggestions
  - Implement code block detection and language identification using regex
  - Add error handling for malformed responses
  - Implement fallback responses for parsing failures
  - _Requirements: 2.3, 3.2, 5.4_
- [x] 5.1 Write property test for code block extraction



- [ ] 5.1 Write property test for code block extraction


  - **Property 23: Code blocks have syntax highlighting**
  - **Validates: Requirements 5.4**

- [x] 6. Implement AI Assistant Service


  - Create `src/lib/ai-assistant/service.ts` with AIAssistantService class
  - Implement sendMessage() method orchestrating the flow (context → prompt → AI → parse)
  - Integrate with existing AIRouter for tier-based model selection
  - Add request/response logging for analytics
  - Implement error handling and retry logic (max 3 retries)
  - Export singleton instance via getAIAssistantService()
  - _Requirements: 1.4, 2.1, 3.1, 7.2, 7.4_
- [x] 6.1 Write property test for code analysis




- [ ] 6.1 Write property test for code analysis


  - **Property 11: Code is analyzed for errors**
  - **Property 12: Errors are explained**
  - **Validates: Requirements 3.1, 3.2**

- [x] 6.2 Write property test for skill level adaptation





  - **Property 15: Skill level is respected**
  - **Validates: Requirements 3.5**

- [x] 7. Create API route with tier checking


  - Create `src/app/api/ai-assistant/chat/route.ts`
  - Apply withTierCheck middleware for subscription verification
  - Implement POST handler with request validation using Zod schema
  - Add rate limiting using existing rate-limit infrastructure
  - Implement request/response handling with proper error responses
  - Return usage info (requestsToday, limit) in response
  - _Requirements: 1.2, 1.3, 1.4, 7.3, 8.1, 8.2_

- [x] 7.1 Write property test for tier verification





  - **Property 1: Premium users see assistant interface**
  - **Property 2: Free users see paywall**
  - **Property 3: Expired subscriptions are blocked**
  - **Property 4: Subscription verification on every request**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 7.2 Write property test for rate limiting





  - **Property 27: Rate limiting is enforced**
  - **Property 31: Limits trigger notifications**
  - **Validates: Requirements 7.3, 8.2**

- [x] 8. Implement usage tracking and analytics


  - Add analytics logging in AI Assistant Service (log to console for now)
  - Track request count per user via withTierCheck middleware (already implemented)
  - Add analytics for request types, response times, success rates in service
  - Create database migration `supabase/migrations/006_ai_assistant_logs.sql` for ai_assistant_logs table
  - _Requirements: 8.1, 8.3, 8.5_
-

- [ ] 8.1 Write property test for request tracking






  - **Property 30: Requests are tracked**
  - **Property 32: Interactions are logged**
  - **Validates: Requirements 8.1, 8.3**

- [x] 9. Implement content filtering and moderation


  - Create `src/lib/ai-assistant/content-filter.ts` with ContentFilter class
  - Add input sanitization (strip HTML, limit length to 2000 chars)
  - Implement inappropriate content detection with basic keyword blocklist
  - Add prompt injection prevention (detect system prompt patterns)
  - Export filterContent() function
  --_Requirements: 8.4_

- [x] 9.1 Write property test for content filtering

  - **Property 33: Inappropriate content is blocked**
  - **Validates: Requirements 8.4**

- [x] 10. Create Chat Interface component



  - Create `src/components/ai-assistant/ChatInterface.tsx` with message list and input
  - Implement MessageList component with role-based styling (user/assistant/system)
  - Add TypingIndicator component with animated dots
  - Implement auto-scroll to latest message using useEffect + scrollIntoView
  - Add timestamp display for messages (format: HH:mm)
  - Style with dark theme matching VibeStudy design (#1a1a1a background)
  - _Requirements: 5.1, 5.2, 5.3, 5.5_


- [x] 10.1 Write property test for UI updates





  - **Property 21: Typing indicators during generation**
  - **Property 24: Chat history is scrollable**
  - **Validates: Requirements 5.2, 5.5**

- [x] 11. Implement code block rendering with syntax highlighting


  - Create `src/components/ai-assistant/CodeBlock.tsx` component
  - Use Prism.js for syntax highlighting (lighter than Monaco for inline blocks)
  - Add copy-to-clipboard functionality with toast notification
  - Support all 7 platform languages (Python, JS, TS, Java, C++, C#, Go)
  - Style with dark theme and language badge
  - _Requirements: 5.4_

- [x] 12. Create quick action buttons




  - Create `src/components/ai-assistant/QuickActions.tsx` component
  - Add buttons: "Explain this concept", "Help with my code", "Give me a hint", "Study advice"
  - Implement click handlers to populate input with templates
  - Make buttons contextual based on current day/task from progress store
  - Style with gradient buttons matching VibeStudy theme
  - _Requirements: 5.6_
- [x] 13. Implement chat state management




- [x] 13. Implement chat state management

  - Create `src/hooks/useAIAssistant.ts` hook for state management
  - Manage open/closed state, messages array, loading state, error state
  - Implement sendMessage action with optimistic updates
  - Add error state handling and retry functionality
  - Integrate with SessionManager for history persistence
  - Store session ID in hook state
  - _Requirements: 5.1, 7.2, 7.4_
-

- [x] 13.1 Write property test for error handling




  - **Property 26: Error messages on service failure**
  - **Property 28: Failed requests are queued**
  - **Validates: Requirements 7.2, 7.4**

- [x] 14. Implement paywall and upgrade prompts




  - Create `src/components/ai-assistant/PaywallModal.tsx` for free users
  - Create `src/components/ai-assistant/UpgradePrompt.tsx` for expired subscriptions
  - Create `src/components/ai-assistant/LimitReachedNotification.tsx` component
  - Add links to pricing page (/pricing)
  - Show remaining requests counter for free tier
  - _Requirements: 1.2, 1.3, 8.2_

- [x] 15. Add welcome message and initialization





  - Implement generateWelcomeMessage() in AI Assistant Service
  - Include current day, language, and progress in welcome
  - Add motivational message based on streak from achievements store
  - Show quick tips for using the assistant
  - Display welcome message as first system message on chat open
  - _Requirements: 1.5_


- [x] 15.1 Write property test for welcome message




  - **Property 5: Welcome message includes context**
  - **Validates: Requirements 1.5**
-

- [x] 16. Implement mobile responsive design


  - Add responsive styles for mobile viewports (<768px) in ChatInterface
  - Create collapsible chat interface for mobile (full screen overlay)
  - Create `src/components/ai-assistant/FloatingChatButton.tsx` to open chat
  - Add touch-friendly tap targets (min 44px) for all buttons
  - Optimize layout for keyboard appearance (adjust viewport height)
  - _Requirements: 10.1, 10.2, 10.5_

- [x] 16.1 Write property test for responsive behavior







  - **Property 39: Responsive layout**
  - **Property 40: Touch interactions work**
  - **Property 41: Interface is collapsible**
  - **Validates: Requirements 10.1, 10.2, 10.5**


- [ ] 17. Implement caching for performance









  - Add response caching in AI Assistant Service using existing AI cache
  - Implement context caching with 5-minute TTL (already in ContextAggregator)
  - Cache common questions with hash-based keys (hash message + day + language)
  - Add cache hit/miss tracking in analytics logs
  - _Requirements: 7.5_
 

- [ ] 17.1 Write property test for caching





  - **Property 29: Identical requests are cached**
  - **Validates: Requirements 7.5**
-

- [x] 18. Add privacy controls



  - Add "Clear History" button to ChatInterface header
  - Add "Save Conversation" toggle (opt-in) - for future database persistence
  - Create privacy notice in chat interface footer
  - Implement immediate deletion via SessionManager.clearSession()
  - _Requirements: 9.2, 9.5_

- [x] 18.1 Write property test for privacy







  - **Property 37: Conversations are isolated**
  - **Property 38: History can be deleted**
  - **Validates: Requirements 9.3, 9.5**

- [ ] 19. Integrate with learning dashboard
  - Add AI Assistant button to `src/components/dashboard/LearningDashboard.tsx`
  - Position ChatInterface as floating panel (fixed position, right side)
  - Implement open/close animations (slide-in from right)
  - Add keyboard shortcut (Ctrl+K or Cmd+K) to open assistant
  - Show "New" badge for first-time users (check localStorage flag)
  - _Requirements: 1.1, 5.1_

- [ ] 20. Add localization support
  - Add Russian translations to `src/lib/i18n/locales/ru.ts` for AI assistant
  - Add English translations to `src/lib/i18n/locales/en.ts` for AI assistant
  - Translate UI labels, error messages, quick actions, welcome message
  - Implement locale-aware prompt building in PromptBuilder
  - Use useLocaleStore() to get current locale
  - _Requirements: All (localization is cross-cutting)_

- [ ] 21. Checkpoint - Ensure all tests pass
  - Run all unit tests: `npm run test:unit`
  - Fix any failing tests
  - Ensure all property tests pass with 100 iterations
  - Ask the user if questions arise

- [ ]* 22. End-to-end testing
  - Create `tests/e2e/ai-assistant.spec.ts` for complete chat flow
  - Test tier verification and paywall display
  - Test code sharing and analysis
  - Test mobile responsive behavior
  - Test error handling and recovery
  - _Requirements: All_

- [ ] 23. Final checkpoint - Ensure all tests pass
  - Run all tests: `npm run test:unit && npm run test:e2e`
  - Ensure all tests pass, ask the user if questions arise
