import { syncManager } from '@/lib/sync';
import { getCurrentUser } from '@/lib/supabase/auth';

export const triggerSync = (action: () => Promise<void>) => {
    setTimeout(action, 0);
};

export const syncTaskCompletion = async (day: number, taskId: string, isCompleted: boolean) => {
    const user = await getCurrentUser();
    if (user) {
        await syncManager.syncTaskCompletion(String(day), taskId, isCompleted);
    }
};

export const syncCode = async (day: number, code: string) => {
    const user = await getCurrentUser();
    if (user) {
        await syncManager.syncCode(String(day), 'code', code);
    }
};

export const syncNotes = async (day: number, notes: string) => {
    const user = await getCurrentUser();
    if (user) {
        await syncManager.syncNotes(String(day), notes);
    }
};

export const syncRecapAnswer = async (day: number, answer: string) => {
    const user = await getCurrentUser();
    if (user) {
        await syncManager.syncRecapAnswer(String(day), answer);
    }
};

export const syncDayCompletion = async (day: number) => {
    const user = await getCurrentUser();
    if (user) {
        await syncManager.syncDayCompletion(String(day), true);
    }
};
