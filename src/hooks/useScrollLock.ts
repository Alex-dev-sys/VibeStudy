'use client';

import { useEffect } from 'react';

let lockCount = 0;
let storedOverflow: string | null = null;
let storedPaddingRight: string | null = null;

export function useScrollLock(shouldLock: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { body, documentElement } = document;

    if (shouldLock) {
      // Блокируем скролл body
      if (lockCount === 0) {
        // Сохраняем текущие значения только при первой блокировке
        storedOverflow = body.style.overflow || '';
        storedPaddingRight = body.style.paddingRight || '';

        // Вычисляем ширину скроллбара
        const scrollBarWidth = window.innerWidth - documentElement.clientWidth;

        // Блокируем скролл body
        body.style.overflow = 'hidden';

        // Компенсируем исчезновение скроллбара
        if (scrollBarWidth > 0) {
          body.style.paddingRight = `${scrollBarWidth}px`;
        }
      }

      lockCount += 1;
    } else {
      // Разблокируем скролл body
      if (lockCount > 0) {
        lockCount -= 1;
      }

      if (lockCount === 0 && storedOverflow !== null) {
        // Восстанавливаем исходные значения
        body.style.overflow = storedOverflow;
        if (storedPaddingRight !== null) {
          body.style.paddingRight = storedPaddingRight;
        } else {
          body.style.paddingRight = '';
        }

        // Сбрасываем сохраненные значения
        storedOverflow = null;
        storedPaddingRight = null;
      }
    }

    return () => {
      // Очистка при размонтировании компонента
      if (lockCount > 0) {
        lockCount -= 1;
      }

      if (lockCount === 0 && storedOverflow !== null) {
        body.style.overflow = storedOverflow;
        if (storedPaddingRight !== null) {
          body.style.paddingRight = storedPaddingRight;
        } else {
          body.style.paddingRight = '';
        }
        storedOverflow = null;
        storedPaddingRight = null;
      }
    };
  }, [shouldLock]);
}

