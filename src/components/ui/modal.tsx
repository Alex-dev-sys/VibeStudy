'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/accessibility/focus-management';
import { useReducedMotion } from '@/lib/accessibility/reduced-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  showCloseButton?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  title,
  showCloseButton = true,
  ariaLabel,
  ariaDescribedBy,
}: ModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`modal-description-${Math.random().toString(36).substr(2, 9)}`);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Announce modal opening to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `${title || 'Dialog'} opened`;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 1000);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-overlay bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div 
            className="fixed inset-0 z-modal flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId.current : undefined}
            aria-label={!title ? ariaLabel : undefined}
            aria-describedby={ariaDescribedBy || descriptionId.current}
          >
            <motion.div
              ref={modalRef}
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
              className={`relative w-full ${sizeClasses[size]} pointer-events-auto`}
            >
              <div className="relative bg-[#1a0b2e] border border-white/20 rounded-2xl shadow-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c061c]">
                {/* Close button */}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a0b2e]"
                    aria-label="Close dialog"
                    type="button"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                )}

                {/* Title */}
                {title && (
                  <div className="px-6 py-5 border-b border-white/10">
                    <h2 id={titleId.current} className="text-h2 text-white">
                      {title}
                    </h2>
                  </div>
                )}

                {/* Content */}
                <div 
                  id={descriptionId.current}
                  className="max-h-[80vh] overflow-y-auto"
                >
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
