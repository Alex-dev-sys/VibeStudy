import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
      icon: '✓',
      className: 'bg-green-500/10 border-green-500/30',
    });
  },
  
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
      icon: '✕',
      className: 'bg-red-500/10 border-red-500/30',
    });
  },
  
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
      icon: 'ℹ',
      className: 'bg-blue-500/10 border-blue-500/30',
    });
  },
  
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
      icon: '⚠',
      className: 'bg-yellow-500/10 border-yellow-500/30',
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      duration: Infinity,
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
  
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  },
  
  // Custom toast for task completion
  taskComplete: (taskTitle: string) => {
    return sonnerToast.success('Задание выполнено!', {
      description: taskTitle,
      duration: 3000,
      icon: '🎉',
      className: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30',
    });
  },
  
  // Custom toast for day completion
  dayComplete: (day: number) => {
    return sonnerToast.success(`День ${day} завершён!`, {
      description: 'Отличная работа! Продолжай в том же духе',
      duration: 4000,
      icon: '🎊',
      className: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30',
    });
  },
  
  // Custom toast for streak milestone
  streakMilestone: (streak: number) => {
    return sonnerToast.success(`${streak} дней подряд!`, {
      description: 'Невероятная серия! Так держать!',
      duration: 4000,
      icon: '🔥',
      className: 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30',
    });
  },
  
  // Custom toast for achievement unlock
  achievementUnlock: (title: string, description: string) => {
    return sonnerToast.success('Достижение разблокировано!', {
      description: `${title}: ${description}`,
      duration: 5000,
      icon: '🏆',
      className: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30',
    });
  },
};
