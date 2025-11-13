import { getSupabaseClient } from '../supabase/client';
import type { MigrationResult } from './types';

/**
 * Migrate knowledge profile data from localStorage to Supabase
 */
export async function migrateKnowledgeProfile(userId: string): Promise<MigrationResult> {
  const errors: Error[] = [];
  let itemsMigrated = 0;

  try {
    // Read knowledge profile data from localStorage
    const knowledgeDataRaw = localStorage.getItem('vibestudy-knowledge-profile');
    
    if (!knowledgeDataRaw) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    const knowledgeData = JSON.parse(knowledgeDataRaw);
    const state = knowledgeData?.state;

    if (!state || !state.topicMastery) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      errors.push(new Error('Supabase not configured'));
      return {
        success: false,
        itemsMigrated: 0,
        errors
      };
    }

    // Transform and upload topic mastery data
    const topicMasteryEntries = Object.entries(state.topicMastery).map(([topic, data]: [string, any]) => ({
      user_id: userId,
      topic,
      mastery_level: data.masteryLevel || 0,
      total_attempts: data.totalAttempts || 0,
      successful_attempts: data.successfulAttempts || 0,
      last_practice: data.lastPractice ? new Date(data.lastPractice).toISOString() : new Date().toISOString()
    }));

    if (topicMasteryEntries.length > 0) {
      const { error } = await supabase
        .from('topic_mastery')
        .upsert(topicMasteryEntries, { onConflict: 'user_id,topic' });

      if (error) {
        errors.push(error);
        return {
          success: false,
          itemsMigrated: 0,
          errors
        };
      }

      itemsMigrated = topicMasteryEntries.length;
    }

    return {
      success: true,
      itemsMigrated,
      errors: []
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error during knowledge profile migration');
    errors.push(err);
    return {
      success: false,
      itemsMigrated,
      errors
    };
  }
}
