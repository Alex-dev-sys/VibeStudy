/**
 * Enhanced curriculum types with automated testing support
 */

import type { Difficulty } from '@/types';

/**
 * Test case for automated verification
 */
export interface TestCase {
  input: string | string[];      // Input data or code setup
  expected: any;                  // Expected output
  description: string;            // Human-readable description
  hidden?: boolean;               // Hidden test (not shown to user)
}

/**
 * Function signature for tasks that require specific function
 */
export interface FunctionSignature {
  name: string;
  parameters: {
    name: string;
    type: string;
    description?: string;
  }[];
  returnType: string;
}

/**
 * Enhanced task with automated testing
 */
export interface DayTaskWithTests {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  solutionHint?: string;

  // Automated testing
  tests?: TestCase[];
  functionSignature?: FunctionSignature;

  // Solution template (optional starter code)
  starterCode?: string;

  // Solution for reference (not shown to user)
  referenceSolution?: string;

  // Learning objectives
  concepts?: string[];           // e.g., ['loops', 'conditionals']

  // Estimated time
  estimatedMinutes?: number;
}

/**
 * Recap question types
 */
export type RecapType = 'text' | 'code' | 'quiz';

export interface RecapQuestion {
  id: string;
  type: RecapType;
  question: string;

  // For quiz type
  options?: string[];
  correctAnswer?: number | string;

  // For code type
  expectedConcepts?: string[];

  // Points for answering
  points?: number;
}

/**
 * Enhanced day content with rich metadata
 */
export interface EnhancedDayContent {
  day: number;

  // Theory content
  theory: string;
  theoryExamples?: {
    title: string;
    code: string;
    explanation: string;
  }[];

  // Recap system
  recap: string;
  recapQuestions?: RecapQuestion[];
  recapTask?: DayTaskWithTests;

  // Tasks
  tasks: DayTaskWithTests[];

  // Metadata
  topic: string;
  difficulty: number;              // 1-5
  category: string;                // 'basics', 'oop', 'web', etc.
  practiceType: 'coding' | 'theory' | 'project';

  // Prerequisites and next steps
  prerequisiteDays?: number[];     // Days that should be completed first
  relatedTopics?: string[];
  nextSteps?: string;

  // Estimated time
  estimatedMinutes: number;

  // Resources
  resources?: {
    title: string;
    url: string;
    type: 'video' | 'article' | 'documentation';
  }[];
}

/**
 * Progress tracking for adaptive learning
 */
export interface TaskAttempt {
  taskId: string;
  attemptNumber: number;
  code: string;
  testsPassedCount: number;
  totalTestsCount: number;
  hintsUsed: number;
  timeSpentSeconds: number;
  completed: boolean;
  timestamp: Date;
}

/**
 * User mastery level for a topic
 */
export interface TopicMastery {
  topic: string;
  level: number;                   // 0-100
  tasksCompleted: number;
  tasksTotal: number;
  averageAttempts: number;
  lastPracticed: Date;
}

/**
 * Adaptive learning recommendations
 */
export interface LearningRecommendation {
  type: 'review' | 'practice' | 'advance' | 'slow_down';
  topic: string;
  reason: string;
  suggestedTasks?: string[];
  priority: 'high' | 'medium' | 'low';
}
