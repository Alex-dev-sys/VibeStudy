'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  targetId: string;
  trigger?: 'hover' | 'click' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  children: React.ReactNode;
}

export function Tooltip({
  content,
  targetId,
  trigger = 'hover',
  position = 'top',
  showOnce = false,
  children
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showOnce) {
      const shown = localStorage.getItem(`tooltip-shown-${targetId}`);
      if (shown) {
        setHasBeenShown(true);
      }
    }
  }, [showOnce, targetId]);

  const showTooltip = () => {
    if (showOnce && hasBeenShown) return;
    setIsVisible(true);
    
    if (showOnce) {
      localStorage.setItem(`tooltip-shown-${targetId}`, 'true');
      setHasBeenShown(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const getTooltipPosition = () => {
    const padding = 8;
    
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: `${padding}px`
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: `${padding}px`
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: `${padding}px`
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: `${padding}px`
        };
    }
  };

  if (showOnce && hasBeenShown) {
    return <>{children}</>;
  }

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-tooltip-id={targetId}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 max-w-xs rounded-lg border border-white/20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] px-3 py-2 text-sm text-white shadow-xl"
            style={getTooltipPosition()}
            role="tooltip"
          >
            {content}
            
            {/* Arrow */}
            <div
              className={`absolute h-2 w-2 rotate-45 border bg-gradient-to-br from-[#1a1a2e] to-[#16213e] ${
                position === 'top'
                  ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r border-white/20'
                  : position === 'bottom'
                  ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t border-white/20'
                  : position === 'left'
                  ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t border-white/20'
                  : 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l border-white/20'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
