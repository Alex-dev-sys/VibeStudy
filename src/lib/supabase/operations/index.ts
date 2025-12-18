/**
 * Database Operations Index
 * Re-exports all database operation modules
 */

// Progress operations
export {
  upsertProgress,
  fetchProgress,
  fetchDayProgress,
  type ProgressData
} from './progress';

// Achievement operations
export {
  unlockAchievement,
  fetchAchievements,
  updateUserStats,
  fetchUserStats
} from './achievements';

// Profile operations
export {
  upsertProfile,
  fetchProfile,
  type ProfileData
} from './profiles';

// Task attempt operations
export {
  createTaskAttempt,
  fetchTaskAttempts,
  fetchRecentAttempts,
  type TaskAttempt
} from './task-attempts';

// Topic mastery operations
export {
  updateTopicMastery,
  fetchTopicMastery,
  fetchTopicMasteryByTopic,
  type TopicMastery
} from './topic-mastery';
