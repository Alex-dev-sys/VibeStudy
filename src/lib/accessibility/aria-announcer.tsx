/**
 * ARIA Live Region Announcer
 * Provides screen reader announcements for dynamic content
 */

'use client';

import { useEffect, useRef, useState } from 'react';

type PolitenessLevel = 'polite' | 'assertive' | 'off';

interface Announcement {
  id: string;
  message: string;
  politeness: PolitenessLevel;
  timestamp: number;
}

// Global announcement queue
let announcementQueue: Announcement[] = [];
let listeners: Set<(announcements: Announcement[]) => void> = new Set();

/**
 * Announce a message to screen readers
 */
export function announce(message: string, politeness: PolitenessLevel = 'polite') {
  const announcement: Announcement = {
    id: `announcement-${Date.now()}-${Math.random()}`,
    message,
    politeness,
    timestamp: Date.now(),
  };

  announcementQueue = [...announcementQueue, announcement];
  listeners.forEach(listener => listener(announcementQueue));

  // Clear announcement after 5 seconds
  setTimeout(() => {
    announcementQueue = announcementQueue.filter(a => a.id !== announcement.id);
    listeners.forEach(listener => listener(announcementQueue));
  }, 5000);
}

/**
 * ARIA Live Region Component
 * Place this component once in your app layout
 */
export function AriaAnnouncer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const listener = (newAnnouncements: Announcement[]) => {
      setAnnouncements(newAnnouncements);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const politeAnnouncements = announcements.filter(a => a.politeness === 'polite');
  const assertiveAnnouncements = announcements.filter(a => a.politeness === 'assertive');

  return (
    <>
      {/* Polite announcements - don't interrupt */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncements.map(announcement => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>

      {/* Assertive announcements - interrupt immediately */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncements.map(announcement => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>
    </>
  );
}

/**
 * Hook to announce messages
 */
export function useAnnounce() {
  return announce;
}

/**
 * Hook to announce on mount
 */
export function useAnnounceOnMount(message: string, politeness: PolitenessLevel = 'polite') {
  useEffect(() => {
    announce(message, politeness);
  }, [message, politeness]);
}

/**
 * Hook to announce loading states
 */
export function useAnnounceLoading(isLoading: boolean, loadingMessage: string, completeMessage: string) {
  const previousLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (isLoading && !previousLoadingRef.current) {
      announce(loadingMessage, 'polite');
    } else if (!isLoading && previousLoadingRef.current) {
      announce(completeMessage, 'polite');
    }
    previousLoadingRef.current = isLoading;
  }, [isLoading, loadingMessage, completeMessage]);
}

/**
 * Announce form errors
 */
export function announceFormError(fieldName: string, errorMessage: string) {
  announce(`${fieldName}: ${errorMessage}`, 'assertive');
}

/**
 * Announce success messages
 */
export function announceSuccess(message: string) {
  announce(message, 'polite');
}

/**
 * Announce navigation changes
 */
export function announceNavigation(pageName: string) {
  announce(`Navigated to ${pageName}`, 'polite');
}

/**
 * Announce progress updates
 */
export function announceProgress(current: number, total: number, itemName: string = 'items') {
  announce(`${current} of ${total} ${itemName} completed`, 'polite');
}
