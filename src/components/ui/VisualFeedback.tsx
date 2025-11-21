'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

export function Ripple({ x, y, size }: RippleProps) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
      }}
    />
  );
}

interface PulseProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: string;
}

export function Pulse({ children, isActive = false, color = 'rgba(255, 0, 148, 0.5)' }: PulseProps) {
  return (
    <motion.div
      animate={isActive ? {
        boxShadow: [
          `0 0 0 0 ${color}`,
          `0 0 0 10px rgba(255, 0, 148, 0)`,
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut'
      }}
      style={{ borderRadius: 'inherit' }}
    >
      {children}
    </motion.div>
  );
}

interface ShakeProps {
  children: React.ReactNode;
  trigger?: boolean;
}

export function Shake({ children, trigger = false }: ShakeProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setKey(prev => prev + 1);
    }
  }, [trigger]);

  return (
    <motion.div
      key={key}
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{
        duration: 0.5,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
}

export function Bounce({ children, trigger = false }: BounceProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setKey(prev => prev + 1);
    }
  }, [trigger]);

  return (
    <motion.div
      key={key}
      animate={trigger ? {
        y: [0, -20, 0],
      } : {}}
      transition={{
        duration: 0.5,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}

interface SuccessPulseProps {
  children: React.ReactNode;
  show?: boolean;
}

export function SuccessPulse({ children, show = false }: SuccessPulseProps) {
  return (
    <motion.div
      animate={show ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// Haptic feedback utility
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type]);
  }
}

// Visual feedback for form validation
interface ValidationFeedbackProps {
  isValid?: boolean;
  isInvalid?: boolean;
  children: React.ReactNode;
}

export function ValidationFeedback({ isValid, isInvalid, children }: ValidationFeedbackProps) {
  return (
    <motion.div
      animate={
        isValid ? {
          borderColor: ['rgba(255, 255, 255, 0.1)', 'rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 0.3)']
        } : isInvalid ? {
          x: [0, -10, 10, -10, 10, 0],
          borderColor: ['rgba(255, 255, 255, 0.1)', 'rgba(239, 68, 68, 0.5)', 'rgba(239, 68, 68, 0.3)']
        } : {}
      }
      transition={{
        duration: 0.5,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}
