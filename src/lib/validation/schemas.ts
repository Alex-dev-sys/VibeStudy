/**
 * Validation Schemas using Zod
 * Centralized validation for API endpoints
 */

import { z } from 'zod';

// Task generation validation
export const taskGenerationSchema = z.object({
  day: z.number().int().min(1).max(90),
  languageId: z.string().min(1).max(50),
  theorySummary: z.string().optional(),
  previousDaySummary: z.string().optional(),
  locale: z.enum(['ru', 'en']).optional()
});

// Code execution validation
export const codeExecutionSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.string().min(1).max(50)
});

const taskSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'advanced', 'challenge']),
  hints: z.array(z.string()).optional()
});

// Solution check validation
export const solutionCheckSchema = z.object({
  code: z.string().min(5).max(50000),
  task: taskSchema,
  languageId: z.string().min(1).max(50),
  locale: z.enum(['ru', 'en']).optional()
});

export const codeReviewSchema = solutionCheckSchema.extend({
  day: z.number().int().min(1).max(90)
});

// Theory explanation validation
export const theoryExplanationSchema = z.object({
  question: z.string().min(3).max(1000),
  context: z.object({
    day: z.number().int().min(1).max(90),
    topic: z.string().min(1).max(200),
    theory: z.string().max(5000).optional()
  }),
  languageId: z.string().min(1).max(50),
  locale: z.enum(['ru', 'en']).optional()
});

// Hint request validation
export const hintRequestSchema = z.object({
  code: z.string().min(1).max(50000),
  task: z.object({
    prompt: z.string(),
    difficulty: z.string()
  }),
  languageId: z.string().min(1).max(50),
  locale: z.enum(['ru', 'en']).optional()
});

// Analytics tracking validation
export const analyticsTrackingSchema = z.object({
  taskId: z.string().min(1),
  day: z.number().int().min(1).max(90),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
  success: z.boolean(),
  attempts: z.number().int().min(1).optional()
});

// Adaptive recommendations validation
export const adaptiveRecommendationsSchema = z.object({
  currentDay: z.number().int().min(1).max(90),
  languageId: z.string().min(1).max(50),
  userId: z.string().uuid().optional()
});

// Regenerate task validation
export const regenerateTaskSchema = z.object({
  day: z.number().int().min(1).max(90),
  languageId: z.string().min(1).max(50),
  taskId: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'advanced', 'challenge']),
  dayTopic: z.string().min(1).max(200),
  dayDescription: z.string().min(1).max(500),
  existingTasks: z.array(
    z.object({
      id: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard', 'advanced', 'challenge']),
      prompt: z.string()
    })
  )
});

export type TaskGenerationInput = z.infer<typeof taskGenerationSchema>;
export type CodeExecutionInput = z.infer<typeof codeExecutionSchema>;
export type SolutionCheckInput = z.infer<typeof solutionCheckSchema>;
export type TheoryExplanationInput = z.infer<typeof theoryExplanationSchema>;
export type CodeReviewInput = z.infer<typeof codeReviewSchema>;
export type HintRequestInput = z.infer<typeof hintRequestSchema>;
export type AnalyticsTrackingInput = z.infer<typeof analyticsTrackingSchema>;
export type AdaptiveRecommendationsInput = z.infer<typeof adaptiveRecommendationsSchema>;
export type RegenerateTaskInput = z.infer<typeof regenerateTaskSchema>;

