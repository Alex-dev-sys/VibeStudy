/**
 * TaskModal Component (Refactored)
 * Main task modal that orchestrates all subcomponents
 * Reduced from 568 lines to ~180 lines
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyConfetti } from '@/lib/performance/lazy-components';
import { useTaskModal } from '@/hooks/useTaskModal';
import { TaskModalHeader } from './TaskModalHeader';
import { TaskModalEditor } from './TaskModalEditor';
import { TaskModalOutput } from './TaskModalOutput';
import { TaskModalActions } from './TaskModalActions';
import type { GeneratedTask } from '@/types';

interface TaskModalProps {
  task: GeneratedTask;
  taskNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  isCompleted: boolean;
  languageId: string;
  monacoLanguage: string;
  day: number;
  topic: string;
  isViewMode?: boolean;
}

export function TaskModal({
  task,
  taskNumber,
  isOpen,
  onClose,
  onComplete,
  isCompleted,
  languageId,
  monacoLanguage,
  day,
  topic,
  isViewMode = false
}: TaskModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const modalContentRef = useRef<HTMLDivElement>(null);

  const {
    code,
    setCode,
    output,
    isChecking,
    isRunning,
    checkResult,
    hints,
    isLoadingHint,
    showSuggestions,
    showConfetti,
    setShowConfetti,
    handleCheck,
    handleRun,
    handleGetHint,
    clearCode,
  } = useTaskModal({
    task,
    languageId,
    day,
    topic,
    onComplete,
    isOpen,
  });

  // Track window size for confetti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/80 p-2 sm:p-4 md:p-6 overflow-y-auto"
        style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Confetti */}
        {showConfetti && (
          <LazyConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={['#ff0094', '#ff5bc8', '#ffd200', '#ff84ff']}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}

        {/* Modal Content */}
        <motion.div
          ref={modalContentRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel-foreground relative flex w-full max-w-5xl flex-col gap-3 rounded-2xl p-4 sm:gap-4 sm:rounded-3xl sm:p-6 md:p-8"
          style={{
            pointerEvents: 'auto',
            maxWidth: '90vw'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <TaskModalHeader
            task={task}
            taskNumber={taskNumber}
            isCompleted={isCompleted}
            isViewMode={isViewMode}
            onClose={onClose}
          />

          {/* Code Editor */}
          <TaskModalEditor
            code={code}
            onChange={setCode}
            language={languageId}
            monacoLanguage={monacoLanguage}
            isViewMode={isViewMode}
          />

          {/* Output & Results */}
          <TaskModalOutput
            output={output}
            checkResult={checkResult}
            showSuggestions={showSuggestions}
            hints={hints}
            languageId={languageId}
            day={day}
            taskId={task.id}
            taskDifficulty={task.difficulty}
          />

          {/* Action Buttons */}
          <TaskModalActions
            isViewMode={isViewMode}
            onClose={onClose}
            onGetHint={handleGetHint}
            onClear={clearCode}
            onRun={handleRun}
            onCheck={handleCheck}
            isLoadingHint={isLoadingHint}
            isRunning={isRunning}
            isChecking={isChecking}
            hasCode={code.trim().length > 0}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
