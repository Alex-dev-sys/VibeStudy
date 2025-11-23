'use client';

/**
 * Floating Chat Button Component
 * Button to open AI Assistant chat interface
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
  locale?: 'ru' | 'en';
  hasUnread?: boolean;
}

/**
 * FloatingChatButton component
 * Displays a floating action button to open the AI assistant
 */
export function FloatingChatButton({
  onClick,
  locale = 'ru',
  hasUnread = false,
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 md:bottom-6 right-6 z-50 group"
      aria-label={locale === 'ru' ? 'Открыть AI ассистента' : 'Open AI assistant'}
    >
      {/* Main button */}
      <div className="relative">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-active:scale-95">
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        
        {/* Unread indicator */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1a1a1a] animate-pulse" />
        )}
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] opacity-0 group-hover:opacity-20 animate-ping" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#2a2a2a] text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {locale === 'ru' ? 'AI Ассистент' : 'AI Assistant'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2a2a2a]" />
      </div>
    </button>
  );
}
