/**
 * Session Manager for AI Learning Assistant
 * Manages chat sessions with in-memory storage, message history, and automatic cleanup
 */

import { ChatSession, Message } from './types';

/**
 * Configuration for SessionManager
 */
interface SessionManagerConfig {
  maxMessages: number; // Maximum messages per session
  sessionTimeout: number; // Session timeout in milliseconds
  cleanupInterval: number; // Cleanup check interval in milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SessionManagerConfig = {
  maxMessages: 50,
  sessionTimeout: 60 * 60 * 1000, // 1 hour
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
};

/**
 * SessionManager class
 * Manages chat sessions with automatic cleanup and message history limits
 */
export class SessionManager {
  private sessions: Map<string, ChatSession>;
  private config: SessionManagerConfig;
  private cleanupTimer: NodeJS.Timeout | null;

  constructor(config: Partial<SessionManagerConfig> = {}) {
    this.sessions = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cleanupTimer = null;
    
    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Create a new chat session
   */
  createSession(userId: string, context: { day: number; languageId: string; taskId?: string }): ChatSession {
    const session: ChatSession = {
      id: this.generateSessionId(),
      userId,
      messages: [],
      startedAt: Date.now(),
      lastActivity: Date.now(),
      context,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get an existing session by ID
   */
  getSession(sessionId: string): ChatSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (this.isSessionExpired(session)) {
      this.clearSession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Add a message to a session
   */
  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update last activity
    session.lastActivity = Date.now();

    // Add message
    session.messages.push(message);

    // Enforce message limit (keep most recent messages)
    if (session.messages.length > this.config.maxMessages) {
      session.messages = session.messages.slice(-this.config.maxMessages);
    }
  }

  /**
   * Get recent messages from a session
   */
  getRecentMessages(sessionId: string, count: number): Message[] {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return [];
    }

    // Return the last 'count' messages
    return session.messages.slice(-count);
  }

  /**
   * Clear a session (delete all messages and session data)
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Clear all sessions for a user
   */
  clearUserSessions(userId: string): void {
    const sessionIds = Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .map(session => session.id);

    sessionIds.forEach(id => this.clearSession(id));
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId);
  }

  /**
   * Check if a session has expired
   */
  private isSessionExpired(session: ChatSession): boolean {
    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    return timeSinceLastActivity > this.config.sessionTimeout;
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const expiredSessionIds: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (this.isSessionExpired(session)) {
        expiredSessionIds.push(sessionId);
      }
    });

    expiredSessionIds.forEach(id => this.clearSession(id));
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      return;
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get total number of active sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  } {
    const totalSessions = this.sessions.size;
    const totalMessages = Array.from(this.sessions.values())
      .reduce((sum, session) => sum + session.messages.length, 0);
    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession,
    };
  }
}

/**
 * Singleton instance for global use
 */
let globalSessionManager: SessionManager | null = null;

/**
 * Get or create the global SessionManager instance
 */
export function getSessionManager(): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = new SessionManager();
  }
  return globalSessionManager;
}

/**
 * Reset the global SessionManager instance (useful for testing)
 */
export function resetSessionManager(): void {
  if (globalSessionManager) {
    globalSessionManager.stopCleanup();
    globalSessionManager = null;
  }
}
