import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDayContent } from '@/data/curriculum-content';
import { getDayTopic } from '@/lib/curriculum';
import { useProgressStore } from '@/store/progress-store';
import { useLocaleStore } from '@/store/locale-store';
import type { CurriculumDay, GeneratedTask, TaskGenerationResponse } from '@/types';
import { formatTheoryContent, trimPrompt } from '@/lib/content-formatting';

interface UseTaskGeneratorParams {
  currentDay: CurriculumDay;
  previousDay?: CurriculumDay;
  languageId: string;
  autoLoad?: boolean;
}

type ContentSource = 'pending' | 'database' | 'ai' | 'fallback';

export const useTaskGenerator = ({ currentDay, previousDay, languageId, autoLoad = true }: UseTaskGeneratorParams) => {
  const [taskSet, setTaskSet] = useState<TaskGenerationResponse | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [contentSource, setContentSource] = useState<ContentSource>('pending');
  const [regeneratingTaskId, setRegeneratingTaskId] = useState<string | null>(null);
  const [loadToken, setLoadToken] = useState<number>(autoLoad ? 1 : 0);

  const dayContent = useMemo(() => getDayContent(currentDay.day), [currentDay.day]);

  const resetDayProgress = useCallback(() => {
    const store = useProgressStore.getState();
    store.resetDayTasks(currentDay.day);
  }, [currentDay.day]);

  const markTaskRegenerated = useCallback(
    (oldTaskId: string, newTaskId: string) => {
      const store = useProgressStore.getState();
      store.replaceTask(currentDay.day, oldTaskId, newTaskId);
    },
    [currentDay.day]
  );

  const formattedContent = useCallback(
    (content: TaskGenerationResponse): TaskGenerationResponse => {
      const dayTopic = getDayTopic(currentDay.day, languageId);
      return {
        ...content,
        theory: formatTheoryContent(content.theory, { topic: dayTopic.topic, languageId }),
        recap: content.recap?.trim() ?? '',
        recapTask: content.recapTask ? trimPrompt(content.recapTask) : content.recapTask,
        tasks: content.tasks.map((task) => trimPrompt(task))
      };
    },
    [currentDay.day, languageId]
  );

  const generateWithAI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRegeneratingTaskId(null);
      setContentSource('pending');

      const { locale } = useLocaleStore.getState();
      const dayTopic = getDayTopic(currentDay.day, languageId);
      const previousDayTopic = previousDay ? getDayTopic(previousDay.day, languageId) : undefined;
      const MAX_ATTEMPTS = 3;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const response = await fetch('/api/generate-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day: currentDay.day,
            languageId,
            dayTopic: dayTopic.topic,
            dayDescription: dayTopic.description,
            theorySummary: currentDay.theory,
            previousDaySummary: previousDayTopic?.topic,
            locale
          })
        });

        if (!response.ok) {
          throw new Error('Не удалось получить задания от AI. Попробуйте позже.');
        }

        const data = (await response.json()) as TaskGenerationResponse;

        if (!data.isFallback) {
          setTaskSet(formattedContent(data));
          setContentSource('ai');
          resetDayProgress();
          return;
        }

        console.warn(`Попытка ${attempt} генерации вернула fallback.`);

        if (attempt === MAX_ATTEMPTS) {
          setError('AI пока возвращает шаблонные данные. Показываем программу курса.');
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setTaskSet(
        formattedContent({
        theory: dayContent.theory,
        recap: dayContent.recap,
        recapTask: dayContent.recapTask,
        tasks: dayContent.tasks
        })
      );
      setContentSource('fallback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка генерации.');
      // При ошибке возвращаемся к статическому контенту
      setTaskSet(
        formattedContent({
        theory: dayContent.theory,
        recap: dayContent.recap,
        recapTask: dayContent.recapTask,
        tasks: dayContent.tasks
        })
      );
      setContentSource('fallback');
    } finally {
      setLoading(false);
    }
  }, [currentDay.day, currentDay.theory, languageId, previousDay, dayContent, resetDayProgress, formattedContent]);

  useEffect(() => {
    if (autoLoad) {
      setLoadToken((token) => (token === 0 ? 1 : token + 1));
    } else {
      setLoadToken(0);
      setTaskSet(null);
      setContentSource('pending');
      setError(null);
      setLoading(false);
      setRegeneratingTaskId(null);
    }
  }, [autoLoad, currentDay.day, languageId]);

  useEffect(() => {
    if (loadToken === 0) {
      return;
    }

    let cancelled = false;

    const loadContent = async () => {
      let fetchedFromDatabase = false;

      try {
        setLoading(true);
        setError(null);

        // First, try to load from client-side localStorage (immediate)
        if (typeof window !== 'undefined') {
          const key = `${languageId}_day${currentDay.day}`;
          const stored = localStorage.getItem(`vibestudy_content_${key}`);
          
          if (stored && !cancelled) {
            try {
              const record = JSON.parse(stored);
              if (record.content) {
                setTaskSet(
                  formattedContent({
                    theory: record.content.theory,
                    recap: record.content.recap,
                    recapTask: record.content.recapTask,
                    tasks: record.content.tasks
                  })
                );
                setContentSource('database');
                fetchedFromDatabase = true;
                setLoading(false);
                return;
              }
            } catch (e) {
              console.warn('Failed to parse localStorage content:', e);
            }
          }
        }

        // If not in localStorage, try server-side storage
        const response = await fetch(`/api/get-content?day=${currentDay.day}&languageId=${languageId}`);

        if (cancelled) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (cancelled) {
            return;
          }

          if (data.exists) {
            setTaskSet(
              formattedContent({
              theory: data.theory,
              recap: data.recap,
              recapTask: data.recapTask,
              tasks: data.tasks
              })
            );
            setContentSource('database');
            fetchedFromDatabase = true;
            setLoading(false);
            return;
          }
        }

      } catch (err) {
        console.error('Ошибка загрузки контента:', err);
      }

        if (!cancelled) {
        if (!fetchedFromDatabase) {
          await generateWithAI();
        } else {
          setLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [loadToken, currentDay.day, languageId, generateWithAI, formattedContent]);

  const regenerateTask = useCallback(
    async (taskId: string) => {
      if (!taskSet?.tasks) return;

      const targetTask = taskSet.tasks.find((task) => task.id === taskId);
      if (!targetTask) return;

      try {
        setRegeneratingTaskId(taskId);
        setError(null);

        const dayTopic = getDayTopic(currentDay.day, languageId);
        const response = await fetch('/api/regenerate-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day: currentDay.day,
            languageId,
            taskId,
            difficulty: targetTask.difficulty,
            dayTopic: dayTopic.topic,
            dayDescription: dayTopic.description,
            existingTasks: taskSet.tasks
              .filter((task) => task.id !== taskId)
              .map((task) => ({
                id: task.id,
                difficulty: task.difficulty,
                prompt: task.prompt
              }))
          })
        });

        if (!response.ok) {
          throw new Error('Не удалось перегенерировать задачу. Попробуйте позже.');
        }

        const { task: newTask } = (await response.json()) as { task: GeneratedTask };

        if (!newTask) {
          throw new Error('Сервис вернул пустой ответ при перегенерации задачи.');
        }

        setTaskSet((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: prev.tasks.map((task) => (task.id === taskId ? trimPrompt(newTask) : task))
          };
        });
        setContentSource('ai');
        markTaskRegenerated(taskId, newTask.id);
      } catch (err) {
        console.error('Ошибка перегенерации задачи:', err);
        setError(err instanceof Error ? err.message : 'Не удалось обновить задачу.');
      } finally {
        setRegeneratingTaskId(null);
      }
    },
    [currentDay.day, languageId, taskSet, markTaskRegenerated]
  );

  const requestInitialGeneration = useCallback(() => {
    setLoadToken((token) => (token === 0 ? 1 : token + 1));
  }, []);

  return {
    taskSet,
    loading,
    error,
    regenerate: generateWithAI,
    contentSource,
    regenerateTask,
    regeneratingTaskId,
    requestInitialGeneration
  };
};

