/**
 * AI Assistant Privacy Property-Based Tests
 * Feature: ai-learning-assistant, Property 37: Conversations are isolated
 * Feature: ai-learning-assistant, Property 38: History can be deleted
 * Validates: Requirements 9.3, 9.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { SessionManager } from '@/lib/ai-assistant/session-manager';
import type { Message } from '@/lib/ai-assistant/types';

describe('AI Assistant Privacy - Property Tests', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    // Create a fresh SessionManager for each test
    sessionManager = new SessionManager();
  });

  // Feature: ai-learning-assistant, Property 37: Conversations are isolated
  it('should isolate conversations between different users', () => {
    // Property: For any two different users, their sessions should be completely isolated
    // User A should never be able to access User B's messages
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId1
        fc.string({ minLength: 1, maxLength: 50 }), // userId2
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 20 }), // messages for user1
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 20 }), // messages for user2
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // languageId
        (userId1, userId2, user1Messages, user2Messages, day, languageId) => {
          // Skip if users are the same (we want to test isolation)
          if (userId1 === userId2) {
            return true;
          }

          // Create sessions for both users
          const session1 = sessionManager.createSession(userId1, { day, languageId });
          const session2 = sessionManager.createSession(userId2, { day, languageId });

          // Add messages to user1's session
          user1Messages.forEach((content, index) => {
            const message: Message = {
              id: `user1_msg_${index}`,
              sessionId: session1.id,
              role: 'user',
              content,
              timestamp: Date.now() + index,
            };
            sessionManager.addMessage(session1.id, message);
          });

          // Add messages to user2's session
          user2Messages.forEach((content, index) => {
            const message: Message = {
              id: `user2_msg_${index}`,
              sessionId: session2.id,
              role: 'user',
              content,
              timestamp: Date.now() + index,
            };
            sessionManager.addMessage(session2.id, message);
          });

          // Retrieve sessions
          const retrievedSession1 = sessionManager.getSession(session1.id);
          const retrievedSession2 = sessionManager.getSession(session2.id);

          // Property assertions:
          // 1. Both sessions should exist
          expect(retrievedSession1).not.toBeNull();
          expect(retrievedSession2).not.toBeNull();

          // 2. Sessions should have correct user IDs
          expect(retrievedSession1!.userId).toBe(userId1);
          expect(retrievedSession2!.userId).toBe(userId2);

          // 3. Each session should have the correct number of messages
          expect(retrievedSession1!.messages.length).toBe(user1Messages.length);
          expect(retrievedSession2!.messages.length).toBe(user2Messages.length);

          // 4. User1's messages should have correct session IDs (not User2's session ID)
          retrievedSession1!.messages.forEach((message) => {
            expect(message.sessionId).toBe(session1.id);
            expect(message.sessionId).not.toBe(session2.id);
          });

          // 5. User2's messages should have correct session IDs (not User1's session ID)
          retrievedSession2!.messages.forEach((message) => {
            expect(message.sessionId).toBe(session2.id);
            expect(message.sessionId).not.toBe(session1.id);
          });

          // 6. getUserSessions should only return sessions for the specified user
          const user1Sessions = sessionManager.getUserSessions(userId1);
          const user2Sessions = sessionManager.getUserSessions(userId2);

          expect(user1Sessions.length).toBeGreaterThan(0);
          expect(user2Sessions.length).toBeGreaterThan(0);

          user1Sessions.forEach((session) => {
            expect(session.userId).toBe(userId1);
          });

          user2Sessions.forEach((session) => {
            expect(session.userId).toBe(userId2);
          });

          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  // Feature: ai-learning-assistant, Property 38: History can be deleted
  it('should completely delete chat history when clearSession is called', () => {
    // Property: For any session with any number of messages,
    // calling clearSession should remove all messages and the session itself
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 50 }), // messages
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // languageId
        (userId, messageContents, day, languageId) => {
          // Create a session
          const session = sessionManager.createSession(userId, { day, languageId });

          // Add messages to the session
          messageContents.forEach((content, index) => {
            const message: Message = {
              id: `msg_${index}`,
              sessionId: session.id,
              role: index % 2 === 0 ? 'user' : 'assistant',
              content,
              timestamp: Date.now() + index,
            };
            sessionManager.addMessage(session.id, message);
          });

          // Verify messages were added
          const sessionBeforeClear = sessionManager.getSession(session.id);
          expect(sessionBeforeClear).not.toBeNull();
          expect(sessionBeforeClear!.messages.length).toBe(messageContents.length);

          // Clear the session
          sessionManager.clearSession(session.id);

          // Property assertions:
          // 1. Session should no longer exist
          const sessionAfterClear = sessionManager.getSession(session.id);
          expect(sessionAfterClear).toBeNull();

          // 2. getUserSessions should not return the cleared session
          const userSessions = sessionManager.getUserSessions(userId);
          const clearedSessionExists = userSessions.some((s) => s.id === session.id);
          expect(clearedSessionExists).toBe(false);

          // 3. Session count should decrease
          const statsAfterClear = sessionManager.getStats();
          expect(statsAfterClear.totalSessions).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: clearUserSessions deletes all sessions for a user
  it('should delete all sessions for a user when clearUserSessions is called', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.integer({ min: 1, max: 10 }), // number of sessions to create
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // languageId
        (userId, numSessions, day, languageId) => {
          // Create multiple sessions for the user
          const sessionIds: string[] = [];
          for (let i = 0; i < numSessions; i++) {
            const session = sessionManager.createSession(userId, { day, languageId });
            sessionIds.push(session.id);

            // Add at least one message to each session
            const message: Message = {
              id: `msg_${i}`,
              sessionId: session.id,
              role: 'user',
              content: `Test message ${i}`,
              timestamp: Date.now() + i,
            };
            sessionManager.addMessage(session.id, message);
          }

          // Verify sessions were created
          const sessionsBeforeClear = sessionManager.getUserSessions(userId);
          expect(sessionsBeforeClear.length).toBe(numSessions);

          // Clear all user sessions
          sessionManager.clearUserSessions(userId);

          // Property assertions:
          // 1. No sessions should exist for this user
          const sessionsAfterClear = sessionManager.getUserSessions(userId);
          expect(sessionsAfterClear.length).toBe(0);

          // 2. None of the original session IDs should be retrievable
          sessionIds.forEach((sessionId) => {
            const session = sessionManager.getSession(sessionId);
            expect(session).toBeNull();
          });

          // 3. Total session count should be 0
          const stats = sessionManager.getStats();
          expect(stats.totalSessions).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Deletion is immediate and irreversible
  it('should make deleted sessions immediately inaccessible and irreversible', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 20 }), // messages
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // languageId
        (userId, messageContents, day, languageId) => {
          // Create session and add messages
          const session = sessionManager.createSession(userId, { day, languageId });
          const originalSessionId = session.id;

          messageContents.forEach((content, index) => {
            const message: Message = {
              id: `msg_${index}`,
              sessionId: session.id,
              role: 'user',
              content,
              timestamp: Date.now() + index,
            };
            sessionManager.addMessage(session.id, message);
          });

          // Store message count before deletion
          const messageCountBeforeDeletion = sessionManager.getSession(session.id)!.messages.length;
          expect(messageCountBeforeDeletion).toBe(messageContents.length);

          // Delete the session
          sessionManager.clearSession(session.id);

          // Property assertions:
          // 1. Session is immediately inaccessible
          expect(sessionManager.getSession(originalSessionId)).toBeNull();

          // 2. getRecentMessages returns empty array
          const recentMessages = sessionManager.getRecentMessages(originalSessionId, 10);
          expect(recentMessages).toEqual([]);

          // 3. Attempting to add a message to deleted session should throw
          expect(() => {
            const newMessage: Message = {
              id: 'new_msg',
              sessionId: originalSessionId,
              role: 'user',
              content: 'This should fail',
              timestamp: Date.now(),
            };
            sessionManager.addMessage(originalSessionId, newMessage);
          }).toThrow();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Privacy is maintained across multiple operations
  it('should maintain privacy when multiple users perform operations concurrently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.string({ minLength: 1, maxLength: 50 }),
            messages: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
        (users, day, languageId) => {
          // Ensure users have unique IDs
          const uniqueUsers = Array.from(
            new Map(users.map((u) => [u.userId, u])).values()
          );

          if (uniqueUsers.length < 2) {
            return true; // Skip if not enough unique users
          }

          // Create sessions and add messages for all users
          const sessionMap = new Map<string, string>(); // userId -> sessionId

          uniqueUsers.forEach((user) => {
            const session = sessionManager.createSession(user.userId, { day, languageId });
            sessionMap.set(user.userId, session.id);

            user.messages.forEach((content, index) => {
              const message: Message = {
                id: `${user.userId}_msg_${index}`,
                sessionId: session.id,
                role: 'user',
                content,
                timestamp: Date.now() + index,
              };
              sessionManager.addMessage(session.id, message);
            });
          });

          // Verify isolation for each user
          uniqueUsers.forEach((user) => {
            const sessionId = sessionMap.get(user.userId)!;
            const session = sessionManager.getSession(sessionId);

            expect(session).not.toBeNull();
            expect(session!.userId).toBe(user.userId);
            expect(session!.messages.length).toBe(user.messages.length);

            // Verify this user's messages have correct session IDs
            session!.messages.forEach((message) => {
              expect(message.sessionId).toBe(sessionId);
              
              // Verify message doesn't belong to other users' sessions
              uniqueUsers.forEach((otherUser) => {
                if (otherUser.userId !== user.userId) {
                  const otherSessionId = sessionMap.get(otherUser.userId)!;
                  expect(message.sessionId).not.toBe(otherSessionId);
                }
              });
            });
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
