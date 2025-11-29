import { z } from 'zod';

export const taskResponseSchema = z.object({
    id: z.string(),
    difficulty: z.string(),
    prompt: z.string(),
    solutionHint: z.string().optional(),
});

export const generatedContentSchema = z.object({
    theory: z.string().min(400, "Theory must be at least 400 characters (detailed explanation with examples)"),
    recap: z.string().min(20, "Recap question is too short"),
    recapTask: taskResponseSchema.optional(),
    tasks: z.array(taskResponseSchema).length(5, "Must have exactly 5 tasks"),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type GeneratedContent = z.infer<typeof generatedContentSchema>;

export const validateGeneratedContent = (content: unknown) => {
    return generatedContentSchema.safeParse(content);
};
