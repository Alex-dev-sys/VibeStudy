/**
 * Property-based tests for AI Assistant Session Manager
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { SessionManager } from '@/lib/ai-assistant/session-manager';
import { Message, ChatSession } from '@/lib/ai-assistant/types';

/**
 * Arbitrary generator for session context
 */
const sessionContextArbitrary = fc.record({
  day: fc.integer({ min: 1, max: 90 }),
  languageId: fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
  taskId: fc.option(fc.uuid(), { nil: undefined }),
});

/**
 * Arbitrary generator for Message
 */
const messageArbitrary = fc.record({
  id: fc.uuid(),
  sessionId: fc.uuid(),
  role: fc.constantFrom('user', 'assistant', 'system') as fc.Arbitrary<'user' | 'assistant' | 'system'>,
  content: fc.string({ minLength: 1, maxLength: 2000 }),
  timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
  metadata: fc.option(fc.record({
    codeBlocks: fc.option(fc.array(fc.record({
      language: fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
      code: fc.string({ minLength: 1, maxLength: 500 }),
    }), { minLength: 0, maxLength: 3 }), { nil: undefined }),
    suggestions: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
    relatedTopics: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
    requestType: fc.option(fc.constantFrom('question', 'code-help', 'advice', 'general'), { nil: undefined }),
  }), { nil: undefined }),
});

describe('AI Assistant Session Manager - Property Tests', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    // Create a fresh SessionManager for each test
    sessionManager = new SessionManager({
      maxMessages: 50,
      sessionTimeout: 60 * 60 * 1000, // 1 hour
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    });
  });

  afterEach(() => {
    // Clean up after each test
    sessionManager.stopCleanup();
  });

  /**
   * Feature: ai-learning-assistant, Property 9: Conversation context is maintained
   * Validates: Requirements 2.5
   * 
   * For any sequence of messages in a session, subsequent AI requests should include previous messages as context
   */
  it('Property 9: Conversation context is maintained across messages', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        fc.array(messageArbitrary, { minLength: 1, maxLength: 20 }), // messages to add
        (userId: string, context, messages: Message[]) => {
          // Create a session
          const session = sessionManager.createSession(userId, context);

          // Add messages one by one
          messages.forEach((message) => {
            const messageWithCorrectSession = {
              ...message,
              sessionId: session.id,
            };
            sessionManager.addMessage(session.id, messageWithCorrectSession);
          });

          // Retrieve the session
          const retrievedSession = sessionManager.getSession(session.id);

          // Session should exist
          expect(retrievedSession).not.toBeNull();

          if (retrievedSession) {
            // All messages should be present (up to max limit)
            const expectedMessageCount = Math.min(messages.length, 50);
            expect(retrievedSession.messages.length).toBe(expectedMessageCount);

            // Messages should be in order (most recent messages if limit exceeded)
            const expectedMessages = messages.slice(-expectedMessageCount);
            retrievedSession.messages.forEach((msg, index) => {
              expect(msg.content).toBe(expectedMessages[index].content);
              expect(msg.role).toBe(expectedMessages[index].role);
            });

            // Context should be preserved
            expect(retrievedSession.context.day).toBe(context.day);
            expect(retrievedSession.context.languageId).toBe(context.languageId);
            expect(retrievedSession.context.taskId).toBe(context.taskId);

            // User ID should be preserved
            expect(retrievedSession.userId).toBe(userId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Session creation returns valid session', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        (userId: string, context) => {
          const session = sessionManager.createSession(userId, context);

          // Session should have all required fields
          expect(session).toHaveProperty('id');
          expect(session).toHaveProperty('userId');
          expect(session).toHaveProperty('messages');
          expect(session).toHaveProperty('startedAt');
          expect(session).toHaveProperty('lastActivity');
          expect(session).toHaveProperty('context');

          // Session ID should be non-empty
          expect(session.id.length).toBeGreaterThan(0);

          // User ID should match
          expect(session.userId).toBe(userId);

          // Messages should start empty
          expect(session.messages).toEqual([]);

          // Timestamps should be valid
          expect(session.startedAt).toBeGreaterThan(0);
          expect(session.lastActivity).toBeGreaterThan(0);
          expect(session.lastActivity).toBeGreaterThanOrEqual(session.startedAt);

          // Context should match
          expect(session.context).toEqual(context);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Message limit is enforced (max 50 messages)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        fc.integer({ min: 51, max: 100 }), // number of messages (more than limit)
        (userId: string, context, messageCount: number) => {
          const session = sessionManager.createSession(userId, context);

          // Add more messages than the limit
          for (let i = 0; i < messageCount; i++) {
            const message: Message = {
              id: `msg_${i}`,
              sessionId: session.id,
              role: 'user',
              content: `Message ${i}`,
              timestamp: Date.now() + i,
            };
            sessionManager.addMessage(session.id, message);
          }

          const retrievedSession = sessionManager.getSession(session.id);

          // Should only keep the last 50 messages
          expect(retrievedSession?.messages.length).toBe(50);

          // Should keep the most recent messages
          if (retrievedSession) {
            expect(retrievedSession.messages[0].content).toBe(`Message ${messageCount - 50}`);
            expect(retrievedSession.messages[49].content).toBe(`Message ${messageCount - 1}`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: getRecentMessages returns correct number of messages', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        fc.integer({ min: 1, max: 30 }), // total messages
        fc.integer({ min: 1, max: 10 }), // messages to retrieve
        (userId: string, context, totalMessages: number, requestedCount: number) => {
          const session = sessionManager.createSession(userId, context);

          // Add messages
          for (let i = 0; i < totalMessages; i++) {
            const message: Message = {
              id: `msg_${i}`,
              sessionId: session.id,
              role: 'user',
              content: `Message ${i}`,
              timestamp: Date.now() + i,
            };
            sessionManager.addMessage(session.id, message);
          }

          const recentMessages = sessionManager.getRecentMessages(session.id, requestedCount);

          // Should return the requested number of messages (or fewer if not enough messages)
          const expectedCount = Math.min(requestedCount, totalMessages);
          expect(recentMessages.length).toBe(expectedCount);

          // Should return the most recent messages
          if (recentMessages.length > 0) {
            expect(recentMessages[recentMessages.length - 1].content).toBe(`Message ${totalMessages - 1}`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Session retrieval after creation returns same session', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        (userId: string, context) => {
          const createdSession = sessionManager.createSession(userId, context);
          const retrievedSession = sessionManager.getSession(createdSession.id);

          // Retrieved session should match created session
          expect(retrievedSession).not.toBeNull();
          expect(retrievedSession?.id).toBe(createdSession.id);
          expect(retrievedSession?.userId).toBe(createdSession.userId);
          expect(retrievedSession?.context).toEqual(createdSession.context);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Multiple sessions for same user are independent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        sessionContextArbitrary,
        (userId: string, context1, context2) => {
          // Create two sessions for the same user
          const session1 = sessionManager.createSession(userId, context1);
          const session2 = sessionManager.createSession(userId, context2);

          // Sessions should have different IDs
          expect(session1.id).not.toBe(session2.id);

          // Add a message to session1
          const message1: Message = {
            id: 'msg1',
            sessionId: session1.id,
            role: 'user',
            content: 'Message in session 1',
            timestamp: Date.now(),
          };
          sessionManager.addMessage(session1.id, message1);

          // Session2 should not have the message
          const retrievedSession2 = sessionManager.getSession(session2.id);
          expect(retrievedSession2?.messages.length).toBe(0);

          // Session1 should have the message
          const retrievedSession1 = sessionManager.getSession(session1.id);
          expect(retrievedSession1?.messages.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: getUserSessions returns all sessions for a user', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.array(sessionContextArbitrary, { minLength: 1, maxLength: 5 }),
        (userId: string, contexts) => {
          // Clear any existing sessions for this user first
          sessionManager.clearUserSessions(userId);

          // Create multiple sessions for the user
          const createdSessions = contexts.map(context =>
            sessionManager.createSession(userId, context)
          );

          // Get all user sessions
          const userSessions = sessionManager.getUserSessions(userId);

          // Should return all created sessions
          expect(userSessions.length).toBe(createdSessions.length);

          // All sessions should belong to the user
          userSessions.forEach(session => {
            expect(session.userId).toBe(userId);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: lastActivity is updated when messages are added', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        (userId: string, context) => {
          const session = sessionManager.createSession(userId, context);
          const initialLastActivity = session.lastActivity;

          // Wait a tiny bit to ensure timestamp difference
          const message: Message = {
            id: 'msg1',
            sessionId: session.id,
            role: 'user',
            content: 'Test message',
            timestamp: Date.now() + 100,
          };

          // Add message after a delay
          setTimeout(() => {
            sessionManager.addMessage(session.id, message);

            const updatedSession = sessionManager.getSession(session.id);

            // lastActivity should be updated
            expect(updatedSession?.lastActivity).toBeGreaterThanOrEqual(initialLastActivity);
          }, 10);
        }
      ),
      { numRuns: 50 } // Fewer runs due to setTimeout
    );
  });
});

describe('AI Assistant Session Manager - Session Cleanup Property Tests', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    // Create a fresh SessionManager for each test
    sessionManager = new SessionManager({
      maxMessages: 50,
      sessionTimeout: 1000, // 1 second for testing
      cleanupInterval: 500, // 500ms for testing
    });
  });

  afterEach(() => {
    // Clean up after each test
    sessionManager.stopCleanup();
  });

  /**
   * Feature: ai-learning-assistant, Property 35: Session-only history by default
   * Validates: Requirements 9.1
   * 
   * For any new chat session, messages should be stored only in session storage (not persisted to database)
   */
  it('Property 35: Session-only history by default (in-memory storage)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        fc.array(messageArbitrary, { minLength: 1, maxLength: 10 }),
        (userId: string, context, messages: Message[]) => {
          // Create a session
          const session = sessionManager.createSession(userId, context);

          // Add messages
          messages.forEach((message) => {
            const messageWithCorrectSession = {
              ...message,
              sessionId: session.id,
            };
            sessionManager.addMessage(session.id, messageWithCorrectSession);
          });

          // Verify messages are stored in memory (can be retrieved)
          const retrievedSession = sessionManager.getSession(session.id);
          expect(retrievedSession).not.toBeNull();
          expect(retrievedSession?.messages.length).toBeGreaterThan(0);

          // Verify that messages are only in memory (SessionManager instance)
          // If we create a new SessionManager, it should not have these sessions
          const newSessionManager = new SessionManager();
          const sessionFromNewManager = newSessionManager.getSession(session.id);
          expect(sessionFromNewManager).toBeNull();

          newSessionManager.stopCleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 36: History cleared on session end
   * Validates: Requirements 9.2
   * 
   * For any session that ends, the chat history should be cleared unless user opts to save
   */
  it('Property 36: History cleared on session end (clearSession)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        fc.array(messageArbitrary, { minLength: 1, maxLength: 10 }),
        (userId: string, context, messages: Message[]) => {
          // Create a session
          const session = sessionManager.createSession(userId, context);

          // Add messages
          messages.forEach((message) => {
            const messageWithCorrectSession = {
              ...message,
              sessionId: session.id,
            };
            sessionManager.addMessage(session.id, messageWithCorrectSession);
          });

          // Verify messages exist
          const retrievedSession = sessionManager.getSession(session.id);
          expect(retrievedSession).not.toBeNull();
          expect(retrievedSession?.messages.length).toBe(Math.min(messages.length, 50));

          // Clear the session (simulating session end)
          sessionManager.clearSession(session.id);

          // Verify session and history are cleared
          const clearedSession = sessionManager.getSession(session.id);
          expect(clearedSession).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Expired sessions return null when retrieved', () => {
    // This test verifies that expired sessions are treated as non-existent
    const testSessionManager = new SessionManager({
      maxMessages: 50,
      sessionTimeout: 10, // 10ms timeout for testing
      cleanupInterval: 5000, // Long interval so we test getSession behavior, not automatic cleanup
    });

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        sessionContextArbitrary,
        (userId: string, context) => {
          // Create a session
          const session = testSessionManager.createSession(userId, context);

          // Verify session exists immediately
          expect(testSessionManager.getSession(session.id)).not.toBeNull();

          // Manually set lastActivity to simulate expiration
          const retrievedSession = testSessionManager.getSession(session.id);
          if (retrievedSession) {
            retrievedSession.lastActivity = Date.now() - 1000; // 1 second ago
          }

          // Now when we try to get the session, it should return null (expired)
          const expiredSession = testSessionManager.getSession(session.id);
          expect(expiredSession).toBeNull();
        }
      ),
      { numRuns: 100 }
    );

    testSessionManager.stopCleanup();
  });

  it('Property: clearUserSessions removes all sessions for a user', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.array(sessionContextArbitrary, { minLength: 1, maxLength: 5 }),
        (userId: string, contexts) => {
          // Clear any existing sessions first
          sessionManager.clearUserSessions(userId);

          // Create multiple sessions for the user
          const createdSessions = contexts.map(context =>
            sessionManager.createSession(userId, context)
          );

          // Verify sessions exist
          expect(sessionManager.getUserSessions(userId).length).toBe(createdSessions.length);

          // Clear all user sessions
          sessionManager.clearUserSessions(userId);

          // Verify all sessions are cleared
          expect(sessionManager.getUserSessions(userId).length).toBe(0);

          // Verify each individual session is gone
          createdSessions.forEach(session => {
            expect(sessionManager.getSession(session.id)).toBeNull();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Session isolation - clearing one user does not affect others', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId1
        fc.string({ minLength: 1, maxLength: 50 }), // userId2
        sessionContextArbitrary,
        sessionContextArbitrary,
        (userId1: string, userId2: string, context1, context2) => {
          // Skip if users are the same
          if (userId1 === userId2) return;

          // Clear existing sessions
          sessionManager.clearUserSessions(userId1);
          sessionManager.clearUserSessions(userId2);

          // Create sessions for both users
          const session1 = sessionManager.createSession(userId1, context1);
          const session2 = sessionManager.createSession(userId2, context2);

          // Clear user1's sessions
          sessionManager.clearUserSessions(userId1);

          // User1's session should be gone
          expect(sessionManager.getSession(session1.id)).toBeNull();

          // User2's session should still exist
          expect(sessionManager.getSession(session2.id)).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Session count reflects active sessions', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }),
            context: sessionContextArbitrary,
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (sessionData) => {
          // Clear all sessions first
          const initialCount = sessionManager.getSessionCount();

          // Create sessions
          const createdSessions = sessionData.map(data =>
            sessionManager.createSession(data.userId, data.context)
          );

          // Session count should increase
          expect(sessionManager.getSessionCount()).toBe(initialCount + createdSessions.length);

          // Clear half the sessions
          const halfCount = Math.floor(createdSessions.length / 2);
          for (let i = 0; i < halfCount; i++) {
            sessionManager.clearSession(createdSessions[i].id);
          }

          // Session count should decrease
          expect(sessionManager.getSessionCount()).toBe(initialCount + createdSessions.length - halfCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: getStats returns accurate statistics', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }),
            context: sessionContextArbitrary,
            messageCount: fc.integer({ min: 0, max: 20 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (sessionData) => {
          // Clear all sessions first
          sessionData.forEach(data => sessionManager.clearUserSessions(data.userId));

          // Create sessions and add messages
          let totalExpectedMessages = 0;
          sessionData.forEach(data => {
            const session = sessionManager.createSession(data.userId, data.context);

            for (let i = 0; i < data.messageCount; i++) {
              const message: Message = {
                id: `msg_${i}`,
                sessionId: session.id,
                role: 'user',
                content: `Message ${i}`,
                timestamp: Date.now() + i,
              };
              sessionManager.addMessage(session.id, message);
            }

            totalExpectedMessages += data.messageCount;
          });

          const stats = sessionManager.getStats();

          // Verify session count
          expect(stats.totalSessions).toBeGreaterThanOrEqual(sessionData.length);

          // Verify total messages
          expect(stats.totalMessages).toBeGreaterThanOrEqual(totalExpectedMessages);

          // Verify average is calculated correctly
          if (stats.totalSessions > 0) {
            expect(stats.averageMessagesPerSession).toBe(stats.totalMessages / stats.totalSessions);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
