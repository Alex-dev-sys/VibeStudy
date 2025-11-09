import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDayContent } from '@/data/curriculum-content';
import { getDayTopic } from '@/lib/curriculum';
import type { CurriculumDay, TaskGenerationResponse } from '@/types';

interface UseTaskGeneratorParams {
  currentDay: CurriculumDay;
  previousDay?: CurriculumDay;
  languageId: string;
}

export const useTaskGenerator = ({ currentDay, previousDay, languageId }: UseTaskGeneratorParams) => {
  const [taskSet, setTaskSet] = useState<TaskGenerationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dayContent = useMemo(() => getDayContent(currentDay.day), [currentDay.day]);

  // Проверяем, есть ли сохранённый контент в БД
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Пытаемся загрузить из БД
        const response = await fetch(`/api/get-content?day=${currentDay.day}&languageId=${languageId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setTaskSet({
              theory: data.theory,
              recap: data.recap,
              recapTask: data.recapTask,
              tasks: data.tasks
            });
            setLoading(false);
            return;
          }
        }
        
        // Если нет в БД, используем статический контент
        setTaskSet({
          theory: dayContent.theory,
          recap: dayContent.recap,
          recapTask: dayContent.recapTask,
          tasks: dayContent.tasks
        });
      } catch (err) {
        console.error('Ошибка загрузки контента:', err);
        // При ошибке используем статический контент
        setTaskSet({
          theory: dayContent.theory,
          recap: dayContent.recap,
          tasks: dayContent.tasks
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [currentDay.day, languageId, dayContent]);

  // Функция для AI-генерации
  const generateWithAI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dayTopic = getDayTopic(currentDay.day);
      const previousDayTopic = previousDay ? getDayTopic(previousDay.day) : undefined;
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
            previousDaySummary: previousDayTopic?.topic
          })
        });

        if (!response.ok) {
          throw new Error('Не удалось получить задания от AI. Попробуйте позже.');
        }

        const data = (await response.json()) as TaskGenerationResponse;

        if (!data.isFallback) {
          setTaskSet(data);
          return;
        }

        console.warn(`Попытка ${attempt} генерации вернула fallback.`);

        if (attempt === MAX_ATTEMPTS) {
          setError('AI пока возвращает шаблонные данные. Показываем программу курса.');
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      setTaskSet({
        theory: dayContent.theory,
        recap: dayContent.recap,
        recapTask: dayContent.recapTask,
        tasks: dayContent.tasks
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка генерации.');
      // При ошибке возвращаемся к статическому контенту
      setTaskSet({
        theory: dayContent.theory,
        recap: dayContent.recap,
        recapTask: dayContent.recapTask,
        tasks: dayContent.tasks
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentDay.day,
    currentDay.theory,
    languageId,
    previousDay?.day,
    previousDay?.theory,
    dayContent
  ]);

  return {
    taskSet,
    loading,
    error,
    regenerate: generateWithAI
  };
};

