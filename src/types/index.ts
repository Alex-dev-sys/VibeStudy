export type Difficulty = 'easy' | 'medium' | 'hard' | 'advanced' | 'challenge';

export type UserTier = 'free' | 'premium' | 'pro_plus';

export interface ProgrammingLanguage {
  id: string;
  label: string;
  description: string;
  monacoLanguage: string;
  highlightColor: string;
}

export interface DayContent {
  day: number;
  title: string;
  theory: string;
  focus: string[];
  recapQuestion: string;
}

export interface GeneratedTask {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  solutionHint?: string;
}

export interface DayStateSnapshot {
  code: string;
  notes: string;
  completedTasks: string[];
  isLocked: boolean;
  lastUpdated: number;
  recapAnswer?: string;
}

export interface CurriculumDay extends DayContent {
  theme: string;
}

export interface TaskGenerationPayload {
  day: number;
  languageId: string;
  theorySummary: string;
  previousDaySummary?: string;
}

export interface TaskGenerationResponse {
  theory: string;
  recap: string;
  recapTask?: GeneratedTask;
  tasks: GeneratedTask[];
  isFallback?: boolean;
}

export interface ProgressRecord {
  completedDays: number[];
  lastActiveDay: number;
  streak: number;
  history: Array<{
    day: number;
    timestamp: number;
    notes?: string;
  }>;
}
