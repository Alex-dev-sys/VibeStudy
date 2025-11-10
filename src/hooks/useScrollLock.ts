'use client';

import { useEffect } from 'react';

let lockCount = 0;
let storedOverflow = '';
let storedPaddingRight = '';

export function useScrollLock(shouldLock: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined' || !shouldLock) {
      return;
    }

    const { body, documentElement } = document;

    if (lockCount === 0) {
      storedOverflow = body.style.overflow;
      storedPaddingRight = body.style.paddingRight;

      const scrollBarWidth = window.innerWidth - documentElement.clientWidth;

      body.style.overflow = 'hidden';

      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        body.style.overflow = storedOverflow;
        body.style.paddingRight = storedPaddingRight;
      }
    };
  }, [shouldLock]);
}

