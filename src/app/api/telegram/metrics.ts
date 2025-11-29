// Telegram Webhook Metrics Tracking
// Separate file to avoid Next.js route export restrictions

// In-memory metrics (reset on server restart)
// For production, consider using Redis or database
export const metrics = {
    startTime: Date.now(),
    totalUpdates: 0,
    successfulUpdates: 0,
    failedUpdates: 0,
    lastUpdateAt: null as number | null,
    errorsByType: {} as Record<string, number>,
    updatesByCommand: {} as Record<string, number>,
    rateLimitedRequests: 0
};

export function incrementMetric(metric: keyof typeof metrics) {
    if (typeof metrics[metric] === 'number') {
        (metrics[metric] as number)++;
    }
}

export function recordUpdate(success: boolean, command?: string) {
    metrics.totalUpdates++;
    metrics.lastUpdateAt = Date.now();

    if (success) {
        metrics.successfulUpdates++;
    } else {
        metrics.failedUpdates++;
    }

    if (command) {
        metrics.updatesByCommand[command] = (metrics.updatesByCommand[command] || 0) + 1;
    }
}

export function recordError(errorType: string) {
    metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
}

export function recordRateLimit() {
    metrics.rateLimitedRequests++;
}

export function resetMetrics() {
    metrics.startTime = Date.now();
    metrics.totalUpdates = 0;
    metrics.successfulUpdates = 0;
    metrics.failedUpdates = 0;
    metrics.lastUpdateAt = null;
    metrics.errorsByType = {};
    metrics.updatesByCommand = {};
    metrics.rateLimitedRequests = 0;
}
