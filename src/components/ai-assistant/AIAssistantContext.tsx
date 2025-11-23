'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AIAssistantContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenClick: () => void;
  setOpenHandler: (handler: () => void) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openHandler, setOpenHandlerState] = useState<(() => void) | null>(null);

  const setOpenHandler = useCallback((handler: () => void) => {
    setOpenHandlerState(() => handler);
  }, []);

  const onOpenClick = useCallback(() => {
    if (openHandler) {
      openHandler();
    } else {
      setIsOpen(true);
    }
  }, [openHandler]);

  return (
    <AIAssistantContext.Provider value={{ isOpen, setIsOpen, onOpenClick, setOpenHandler }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    return { 
      isOpen: false, 
      setIsOpen: () => {}, 
      onOpenClick: () => {},
      setOpenHandler: () => {}
    };
  }
  return context;
}

