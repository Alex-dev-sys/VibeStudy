import { z } from 'zod';

export const taskResponseSchema = z.object({
    id: z.string(),
    difficulty: z.string(),
    prompt: z.string(),
    solutionHint: z.string().optional(),
});

export const generatedContentSchema = z.object({
    theory: z.string().min(100, "Theory is too short"),
    recap: z.string(),
    recapTask: taskResponseSchema.optional(),
    tasks: z.array(taskResponseSchema).length(5, "Must have exactly 5 tasks"),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type GeneratedContent = z.infer<typeof generatedContentSchema>;

export const validateGeneratedContent = (content: unknown) => {
    return generatedContentSchema.safeParse(content);
};
