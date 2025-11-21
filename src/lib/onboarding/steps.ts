import type { OnboardingStep } from '@/store/onboarding-store';

// Simplified 3-step tutorial as per requirements
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'start-day',
    title: 'Начни свой день',
    description: 'Нажми "Начать день", чтобы получить персональные задания от AI. Каждый день содержит теорию и практические задачи.',
    targetElement: '[data-onboarding="start-day"]',
    position: 'bottom'
  },
  {
    id: 'complete-tasks',
    title: 'Выполняй задания',
    description: 'Кликни на задание, чтобы открыть редактор кода. Пиши код, проверяй решение и получай подсказки от AI.',
    targetElement: '[data-onboarding="task-list"]',
    position: 'right'
  },
  {
    id: 'finish-day',
    title: 'Завершай дни',
    description: 'После выполнения всех заданий завершай день и получай награды. Поддерживай серию для максимального прогресса!',
    targetElement: '[data-onboarding="complete-day"]',
    position: 'top'
  }
];
