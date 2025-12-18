'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/content/curriculum';
import { cn } from '@/lib/utils';
import type { CurriculumDay, TaskGenerationResponse, ProgrammingLanguage } from '@/types';
import { TheoryBlock } from './TheoryBlock';
import { TaskList } from './TaskList';
import { RecapQuestionCard } from './RecapQuestionCard';
import { ProgressIndicator } from '@/components/dashboard/ProgressIndicator';
import { TaskCompletionAnimation } from '@/components/ui/TaskCompletionAnimation';
import { toast } from '@/lib/ui/toast';

interface ContentStateProps {
  day: CurriculumDay;
  taskSet: TaskGenerationResponse;
  language: ProgrammingLanguage;
  onRegenerateTask?: (taskId: string) => void;
  regeneratingTaskId?: string | null;
}

export function ContentState({ 
  day, 
  taskSet, 
  language,
  onRegenerateTask,
  regeneratingTaskId
}: ContentStateProps) {
  const [expandedSection, setExpandedSection] = useState<'theory' | 'tasks' | null>('theory');
  const [showDayCompletionAnimation, setShowDayCompletionAnimation] = useState(false);
  
  const completedDays = useProgressStore((state) => state.record.completedDays);
  const completedTasks = useProgressStore((state) => state.dayStates[day.day]?.completedTasks ?? []);
  const markDayComplete = useProgressStore((state) => state.markDayComplete);
  const languageId = useProgressStore((state) => state.languageId);

  const dayTopic = getDayTopic(day.day, languageId);
  const isDayCompleted = completedDays.includes(day.day);
  
  const tasks = taskSet.tasks ?? [];
  const theory = taskSet.theory ?? day.theory;
  const recapTask = taskSet.recapTask;
  
  // Calculate required task IDs
  const requiredTaskIds = [...tasks.map((task) => task.id)];
  if (recapTask && day.day > 1) {
    requiredTaskIds.push(recapTask.id);
  }
  
  const allTasksCompleted = requiredTaskIds.length > 0 && 
    requiredTaskIds.every((id) => completedTasks.includes(id));

  const toggleSection = (section: 'theory' | 'tasks') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleDayComplete = () => {
    markDayComplete(day.day);
    setShowDayCompletionAnimation(true);
    toast.dayComplete(day.day);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full max-w-full flex-col gap-section"
    >
      {/* Header Card with Progress */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,148,0.18),transparent_62%)]" />
        
        <CardHeader className="relative space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl">
                <span className="text-white/70">День {day.day}</span> · {dayTopic.topic}
                {isDayCompleted && (
                  <Badge tone="accent" className="ml-2 text-xs">
                    ✓ Завершен
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {isDayCompleted ? 'Режим просмотра — день уже завершен' : dayTopic.description}
              </CardDescription>
            </div>
            
            <Badge tone="accent" className="text-sm">
              Язык: {language.label}
            </Badge>
          </div>

          {/* Progress Indicator */}
          {!isDayCompleted && (
            <ProgressIndicator
              completed={completedTasks.length}
              total={requiredTaskIds.length}
            />
          )}
        </CardHeader>
      </Card>

      {/* Theory Section - Collapsible */}
      <Card>
        <button
          onClick={() => toggleSection('theory')}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Теория</h3>
              <p className="text-sm text-white/60">Изучи основы перед практикой</p>
            </div>
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 transition-transform flex-shrink-0',
              expandedSection === 'theory' && 'rotate-180'
            )} 
          />
        </button>

        <AnimatePresence>
          {expandedSection === 'theory' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <TheoryBlock 
                  theory={theory} 
                  dayNumber={day.day} 
                  topic={dayTopic.topic} 
                  languageId={language.id}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Recap Question */}
      {taskSet.recap && !isDayCompleted && (
        <RecapQuestionCard 
          day={day.day} 
          question={taskSet.recap} 
          hasPreviousDay={day.day > 1} 
        />
      )}

      {/* Recap Task from Previous Day */}
      {recapTask && day.day > 1 && (
        <Card className="border border-amber-300/40 bg-amber-200/12">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/30 text-2xl flex-shrink-0">
                🔄
              </span>
              <div>
                <CardTitle className="text-base">Контрольное задание</CardTitle>
                <CardDescription className="text-sm">
                  Повторение материала предыдущего дня
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-6">
            <TaskList
              day={day.day}
              tasks={[recapTask]}
              languageId={language.id}
              monacoLanguage={language.monacoLanguage}
              topic={dayTopic.topic}
              isViewMode={isDayCompleted}
            />
          </div>
        </Card>
      )}

      {/* Tasks Section - Collapsible */}
      <Card>
        <button
          onClick={() => toggleSection('tasks')}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Code className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Практика</h3>
              <p className="text-sm text-white/60">
                {tasks.length} {tasks.length === 1 ? 'задание' : 'заданий'}
              </p>
            </div>
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 transition-transform flex-shrink-0',
              expandedSection === 'tasks' && 'rotate-180'
            )} 
          />
        </button>

        <AnimatePresence>
          {expandedSection === 'tasks' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <TaskList
                  day={day.day}
                  tasks={tasks}
                  languageId={language.id}
                  monacoLanguage={language.monacoLanguage}
                  topic={dayTopic.topic}
                  onRegenerateTask={onRegenerateTask}
                  regeneratingTaskId={regeneratingTaskId}
                  isViewMode={isDayCompleted}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Complete Day CTA - Only when all tasks done */}
      {allTasksCompleted && !isDayCompleted && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Отличная работа! 🎉</h3>
                <p className="text-sm text-white/70">
                  Все задания выполнены. Завершить день?
                </p>
              </div>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleDayComplete}
              className="w-full sm:w-auto"
            >
              Завершить день
            </Button>
          </div>
        </Card>
      )}

      {/* Day Completion Animation */}
      <TaskCompletionAnimation 
        isVisible={showDayCompletionAnimation}
        onComplete={() => setShowDayCompletionAnimation(false)}
      />
    </motion.section>
  );
}
