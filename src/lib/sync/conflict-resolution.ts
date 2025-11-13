/**
 * Conflict Resolution Logic
 * Handles conflicts when syncing data between local and remote storage
 */

export type ConflictStrategy = 'last-write-wins' | 'merge' | 'local-wins' | 'remote-wins';

export interface TimestampedData {
  updated_at?: string | number;
  timestamp?: number;
  lastModified?: number;
}

export interface ConflictResolutionResult<T> {
  resolved: T;
  strategy: ConflictStrategy;
  hadConflict: boolean;
}

/**
 * Detect if there's a conflict between local and remote data
 */
export function detectConflict<T extends TimestampedData>(
  local: T | null,
  remote: T | null
): boolean {
  // No conflict if one is missing
  if (!local || !remote) {
    return false;
  }

  const localTime = getTimestamp(local);
  const remoteTime = getTimestamp(remote);

  // No conflict if timestamps are the same
  if (localTime === remoteTime) {
    return false;
  }

  // Conflict exists if both have different timestamps
  return true;
}

/**
 * Resolve conflict between local and remote data
 */
export function resolveConflict<T extends TimestampedData>(
  local: T | null,
  remote: T | null,
  strategy: ConflictStrategy = 'last-write-wins'
): ConflictResolutionResult<T | null> {
  // If no local data, use remote
  if (!local && remote) {
    return {
      resolved: remote,
      strategy,
      hadConflict: false,
    };
  }

  // If no remote data, use local
  if (local && !remote) {
    return {
      resolved: local,
      strategy,
      hadConflict: false,
    };
  }

  // If both are null
  if (!local && !remote) {
    return {
      resolved: null,
      strategy,
      hadConflict: false,
    };
  }

  // Both exist - check for conflict
  const hasConflict = detectConflict(local, remote);

  if (!hasConflict) {
    // No conflict, return remote (most recent)
    return {
      resolved: remote,
      strategy,
      hadConflict: false,
    };
  }

  // Resolve based on strategy
  let resolved: T | null;

  switch (strategy) {
    case 'last-write-wins':
      resolved = resolveLastWriteWins(local!, remote!);
      break;
    case 'merge':
      resolved = resolveMerge(local!, remote!);
      break;
    case 'local-wins':
      resolved = local;
      break;
    case 'remote-wins':
      resolved = remote;
      break;
    default:
      resolved = resolveLastWriteWins(local!, remote!);
  }

  return {
    resolved,
    strategy,
    hadConflict: true,
  };
}

/**
 * Last-write-wins strategy: Use the data with the most recent timestamp
 */
function resolveLastWriteWins<T extends TimestampedData>(local: T, remote: T): T {
  const localTime = getTimestamp(local);
  const remoteTime = getTimestamp(remote);

  if (localTime > remoteTime) {
    console.log('[ConflictResolution] Last-write-wins: Local data is newer');
    return local;
  } else {
    console.log('[ConflictResolution] Last-write-wins: Remote data is newer');
    return remote;
  }
}

/**
 * Merge strategy: Intelligently merge local and remote data
 */
function resolveMerge<T extends TimestampedData>(local: T, remote: T): T {
  const localTime = getTimestamp(local);
  const remoteTime = getTimestamp(remote);

  // Start with the newer data as base
  const base = localTime > remoteTime ? { ...local } : { ...remote };
  const other = localTime > remoteTime ? remote : local;

  // Merge properties from both
  const merged = { ...base };

  // For each property in the other object
  for (const key in other) {
    if (Object.prototype.hasOwnProperty.call(other, key)) {
      const baseValue = base[key];
      const otherValue = other[key];

      // Skip if values are the same
      if (baseValue === otherValue) {
        continue;
      }

      // Handle arrays - merge unique values
      if (Array.isArray(baseValue) && Array.isArray(otherValue)) {
        merged[key] = mergeArrays(baseValue, otherValue) as any;
        continue;
      }

      // Handle objects - recursive merge
      if (
        typeof baseValue === 'object' &&
        baseValue !== null &&
        typeof otherValue === 'object' &&
        otherValue !== null &&
        !Array.isArray(baseValue) &&
        !Array.isArray(otherValue)
      ) {
        merged[key] = { ...baseValue, ...otherValue } as any;
        continue;
      }

      // For primitive values, keep the base value (from newer data)
      // This is already set, so no action needed
    }
  }

  console.log('[ConflictResolution] Merge: Combined local and remote data');
  return merged as T;
}

/**
 * Merge two arrays, keeping unique values
 */
function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
  const merged = [...arr1];

  for (const item of arr2) {
    // For primitive values, check if already exists
    if (typeof item !== 'object') {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    } else {
      // For objects, add if not found (simple check)
      const exists = merged.some(
        (existing) => JSON.stringify(existing) === JSON.stringify(item)
      );
      if (!exists) {
        merged.push(item);
      }
    }
  }

  return merged;
}

/**
 * Extract timestamp from data object
 */
function getTimestamp(data: TimestampedData): number {
  // Try different timestamp fields
  if (data.updated_at) {
    if (typeof data.updated_at === 'number') {
      return data.updated_at;
    }
    if (typeof data.updated_at === 'string') {
      return new Date(data.updated_at).getTime();
    }
  }

  if (data.timestamp) {
    return data.timestamp;
  }

  if (data.lastModified) {
    return data.lastModified;
  }

  // Default to 0 if no timestamp found
  return 0;
}

/**
 * Resolve conflicts for progress data
 */
export function resolveProgressConflict(
  local: any,
  remote: any
): ConflictResolutionResult<any> {
  // For progress data, we want to merge completed tasks
  if (!local && remote) {
    return { resolved: remote, strategy: 'remote-wins', hadConflict: false };
  }

  if (local && !remote) {
    return { resolved: local, strategy: 'local-wins', hadConflict: false };
  }

  if (!local && !remote) {
    return { resolved: null, strategy: 'last-write-wins', hadConflict: false };
  }

  // Merge strategy for progress
  const merged = { ...local };

  // Merge completed tasks (union)
  if (local.completedTasks && remote.completedTasks) {
    merged.completedTasks = Array.from(
      new Set([...local.completedTasks, ...remote.completedTasks])
    );
  } else if (remote.completedTasks) {
    merged.completedTasks = remote.completedTasks;
  }

  // Use most recent code and notes
  const localTime = getTimestamp(local);
  const remoteTime = getTimestamp(remote);

  if (remoteTime > localTime) {
    merged.code = remote.code || local.code;
    merged.notes = remote.notes || local.notes;
    merged.recapAnswer = remote.recapAnswer || local.recapAnswer;
  }

  // Use most recent completion status
  if (remote.completed !== undefined) {
    merged.completed = remote.completed || local.completed;
  }

  merged.updated_at = Math.max(localTime, remoteTime);

  return {
    resolved: merged,
    strategy: 'merge',
    hadConflict: detectConflict(local, remote),
  };
}

/**
 * Resolve conflicts for achievement data
 */
export function resolveAchievementConflict(
  local: any,
  remote: any
): ConflictResolutionResult<any> {
  // For achievements, merge unlocked achievements
  if (!local && remote) {
    return { resolved: remote, strategy: 'remote-wins', hadConflict: false };
  }

  if (local && !remote) {
    return { resolved: local, strategy: 'local-wins', hadConflict: false };
  }

  if (!local && !remote) {
    return { resolved: null, strategy: 'last-write-wins', hadConflict: false };
  }

  const merged = { ...local };

  // Merge unlocked achievements (union)
  if (local.unlockedAchievements && remote.unlockedAchievements) {
    merged.unlockedAchievements = Array.from(
      new Set([...local.unlockedAchievements, ...remote.unlockedAchievements])
    );
  } else if (remote.unlockedAchievements) {
    merged.unlockedAchievements = remote.unlockedAchievements;
  }

  // Use maximum values for stats
  if (remote.stats) {
    merged.stats = {
      totalTasks: Math.max(local.stats?.totalTasks || 0, remote.stats.totalTasks || 0),
      completedDays: Math.max(
        local.stats?.completedDays || 0,
        remote.stats.completedDays || 0
      ),
      currentStreak: Math.max(
        local.stats?.currentStreak || 0,
        remote.stats.currentStreak || 0
      ),
      longestStreak: Math.max(
        local.stats?.longestStreak || 0,
        remote.stats.longestStreak || 0
      ),
    };
  }

  const localTime = getTimestamp(local);
  const remoteTime = getTimestamp(remote);
  merged.updated_at = Math.max(localTime, remoteTime);

  return {
    resolved: merged,
    strategy: 'merge',
    hadConflict: detectConflict(local, remote),
  };
}

/**
 * Resolve conflicts for profile data
 */
export function resolveProfileConflict(
  local: any,
  remote: any
): ConflictResolutionResult<any> {
  // For profile, use last-write-wins
  return resolveConflict(local, remote, 'last-write-wins');
}
