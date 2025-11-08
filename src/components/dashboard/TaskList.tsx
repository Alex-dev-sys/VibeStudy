'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { difficultyColorMap } from '@/lib/utils';
import type { GeneratedTask } from '@/types';
import { useProgressStore } from '@/store/progress-store';
import { TaskModal } from './TaskModal';

interface TaskListProps {
  day: number;
  tasks: GeneratedTask[];
  languageId: string;
  monacoLanguage: string;
  topic: string;
}

export function TaskList({ day, tasks, languageId, monacoLanguage, topic }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<{ task: GeneratedTask; index: number } | null>(null);
  const toggleTask = useProgressStore((state) => state.toggleTask);
  const dayState = useProgressStore((state) => state.dayStates[day]);
  const completedTasks = dayState?.completedTasks ?? [];

  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/60 sm:rounded-3xl sm:p-6 sm:text-sm">
        Задания пока не готовы — нажми «Сгенерировать теорию и задания», чтобы получить набор.
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 sm:gap-4">
        {tasks.map((task, index) => {
          const isCompleted = completedTasks.includes(task.id);
          return (
            <li
              key={task.id}
              className={clsx(
                'cursor-pointer rounded-2xl border border-white/10 bg-black/40 p-3 transition-all duration-200 sm:rounded-3xl sm:p-4',
                isCompleted ? 'border-accent/60 bg-accent/10 shadow-glow' : 'hover:border-white/20 hover:bg-black/60'
              )}
              onClick={() => setSelectedTask({ task, index })}
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 sm:gap-2 sm:text-sm">
                  <span className="text-[10px] text-white/40 sm:text-xs">#{index + 1}</span>
                  <span className={clsx('text-[10px] uppercase tracking-wide sm:text-xs', difficultyColorMap[task.difficulty])}>{task.difficulty}</span>
                  {isCompleted && <span className="text-accent">✓</span>}
                </div>
                <span className="hidden text-xs text-white/50 sm:inline">Нажми, чтобы открыть →</span>
                <span className="text-[10px] text-white/50 sm:hidden">→</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/80 sm:mt-3 sm:text-sm">{task.prompt}</p>
              {task.solutionHint && <p className="mt-1.5 text-[10px] text-white/50 sm:mt-2 sm:text-xs">💡 {task.solutionHint}</p>}
            </li>
          );
        })}
      </ul>

      {selectedTask && (
        <TaskModal
          task={selectedTask.task}
          taskNumber={selectedTask.index + 1}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onComplete={(taskId) => toggleTask(day, taskId)}
          isCompleted={completedTasks.includes(selectedTask.task.id)}
          languageId={languageId}
          monacoLanguage={monacoLanguage}
          day={day}
          topic={topic}
        />
      )}
    </>
  );
}

