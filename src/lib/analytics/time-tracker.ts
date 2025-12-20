/**
 * Time tracking для аналитики
 */

export interface TimeEntry {
  day: number;
  taskId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // в секундах
}

export interface DayTimeStats {
  day: number;
  totalTime: number; // в минутах
  tasksTime: Record<string, number>; // время на каждую задачу
  averageTaskTime: number;
}

class TimeTracker {
  private currentEntry: TimeEntry | null = null;
  private entries: TimeEntry[] = [];

  /**
   * Начать отслеживание времени для задачи
   */
  startTracking(day: number, taskId: string) {
    // Завершить предыдущее если есть
    if (this.currentEntry) {
      this.stopTracking();
    }

    this.currentEntry = {
      day,
      taskId,
      startTime: Date.now(),
    };
  }

  /**
   * Остановить отслеживание
   */
  stopTracking(): TimeEntry | null {
    if (!this.currentEntry) return null;

    const endTime = Date.now();
    const duration = Math.floor((endTime - this.currentEntry.startTime) / 1000); // в секундах

    const completedEntry: TimeEntry = {
      ...this.currentEntry,
      endTime,
      duration,
    };

    this.entries.push(completedEntry);
    this.currentEntry = null;

    // Сохранить в localStorage
    this.saveToStorage();

    return completedEntry;
  }

  /**
   * Получить статистику по дню
   */
  getDayStats(day: number): DayTimeStats {
    const dayEntries = this.entries.filter(e => e.day === day && e.duration);

    const totalTime = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 60; // в минутах

    const tasksTime: Record<string, number> = {};
    dayEntries.forEach(e => {
      if (e.duration) {
        tasksTime[e.taskId] = (tasksTime[e.taskId] || 0) + e.duration / 60; // в минутах
      }
    });

    const averageTaskTime = dayEntries.length > 0 ? totalTime / dayEntries.length : 0;

    return {
      day,
      totalTime,
      tasksTime,
      averageTaskTime,
    };
  }

  /**
   * Получить все записи
   */
  getAllEntries(): TimeEntry[] {
    return [...this.entries];
  }

  /**
   * Сохранить в localStorage
   */
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('time-tracker-entries', JSON.stringify(this.entries));
    }
  }

  /**
   * Загрузить из localStorage
   */
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('time-tracker-entries');
      if (saved) {
        this.entries = JSON.parse(saved);
      }
    }
  }

  /**
   * Очистить все данные
   */
  clear() {
    this.entries = [];
    this.currentEntry = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('time-tracker-entries');
    }
  }
}

export const timeTracker = new TimeTracker();

// Загрузить при инициализации
if (typeof window !== 'undefined') {
  timeTracker.loadFromStorage();
}
