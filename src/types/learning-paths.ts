/**
 * Learning Paths Types
 * Supports multi-language, multi-path learning system
 */

import type { Difficulty } from '@/types';

/**
 * Type of learning path
 */
export type PathType = 'beginner' | 'career';

/**
 * Career category for professional paths
 */
export type CareerCategory =
    | 'data-science'
    | 'backend'
    | 'frontend'
    | 'fullstack'
    | 'mobile'
    | 'game-dev'
    | 'ml-ai'
    | 'devops'
    | 'systems';

/**
 * Learning path configuration
 */
export interface LearningPath {
    id: string;
    languageId: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    duration: number; // days
    type: PathType;
    icon: string;
    color: string;
    prerequisitePathId?: string; // career paths require beginner
    careerCategory?: CareerCategory;
    careers?: string[]; // job titles this path prepares for
    skills?: string[]; // skills learned
    order: number; // display order
}

/**
 * Day content within a path
 */
export interface PathDay {
    day: number;
    topic: string;
    topicEn: string;
    description: string;
    category: string;
    estimatedMinutes: number;
}

/**
 * Task within a path day
 */
export interface PathTask {
    id: string;
    pathId: string;
    day: number;
    difficulty: Difficulty;
    prompt: string;
    promptEn?: string;
    solutionHint?: string;
    starterCode?: string;
    concepts?: string[];
    estimatedMinutes?: number;
}

/**
 * Full path content structure
 */
export interface PathContent {
    path: LearningPath;
    days: PathDayContent[];
}

/**
 * Full day content within a path
 */
export interface PathDayContent {
    day: number;
    topic: string;
    topicEn: string;
    description: string;
    theory: string;
    recap: string;
    tasks: PathTask[];
    estimatedMinutes: number;
    category?: string; // Optional override for theme mapping
    practiceType?: string; // Optional override for theme mapping
}

/**
 * User progress within a specific path
 */
export interface UserPathProgress {
    userId: string;
    pathId: string;
    currentDay: number;
    completedDays: number[];
    startedAt: Date;
    completedAt?: Date;
    totalTimeSpent: number; // seconds
    averageScore: number;
}

/**
 * Language with its paths
 */
export interface LanguageWithPaths {
    id: string;
    label: string;
    description: string;
    monacoLanguage: string;
    highlightColor: string;
    icon: string;
    beginnerPath: LearningPath;
    careerPaths: LearningPath[];
}

/**
 * All paths for a language
 */
export interface LanguagePaths {
    languageId: string;
    beginner: LearningPath;
    careers: LearningPath[];
}
