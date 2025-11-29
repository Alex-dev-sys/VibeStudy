// Telegram Webhook Health Check
// Provides metrics and status for monitoring

import { NextResponse } from 'next/server';
import { metrics, resetMetrics } from '../metrics';

/**
 * GET /api/telegram/health
 * Returns health status and metrics
 */
export async function GET() {
  const uptime = Date.now() - metrics.startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const successRate = metrics.totalUpdates > 0
    ? ((metrics.successfulUpdates / metrics.totalUpdates) * 100).toFixed(2)
    : '100.00';

  const lastUpdateAgo = metrics.lastUpdateAt
    ? Math.floor((Date.now() - metrics.lastUpdateAt) / 1000)
    : null;

  // Health status
  const isHealthy =
    metrics.failedUpdates === 0 || // No errors
    (metrics.totalUpdates > 10 && parseFloat(successRate) > 95); // Or 95%+ success rate

  const warnings = [];
  if (parseFloat(successRate) < 95 && metrics.totalUpdates > 10) {
    warnings.push(`Low success rate: ${successRate}%`);
  }
  if (lastUpdateAgo && lastUpdateAgo > 3600) {
    warnings.push(`No updates for ${Math.floor(lastUpdateAgo / 60)} minutes`);
  }
  if (metrics.rateLimitedRequests > 100) {
    warnings.push(`High rate limiting: ${metrics.rateLimitedRequests} requests blocked`);
  }

  const health = {
    status: isHealthy ? 'healthy' : 'degraded',
    warnings,
    timestamp: new Date().toISOString(),
    uptime: {
      milliseconds: uptime,
      seconds: uptimeSeconds,
      minutes: uptimeMinutes,
      hours: uptimeHours,
      formatted: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
    },
    webhook: {
      totalUpdates: metrics.totalUpdates,
      successfulUpdates: metrics.successfulUpdates,
      failedUpdates: metrics.failedUpdates,
      successRate: `${successRate}%`,
      lastUpdateAt: metrics.lastUpdateAt ? new Date(metrics.lastUpdateAt).toISOString() : null,
      lastUpdateAgoSeconds: lastUpdateAgo,
      rateLimitedRequests: metrics.rateLimitedRequests
    },
    errors: metrics.errorsByType,
    commands: metrics.updatesByCommand,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasWebhookSecret: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    },
    memory: process.memoryUsage && {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  };

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

/**
 * POST /api/telegram/health/reset
 * Reset metrics (for testing)
 */
export async function POST() {
  resetMetrics();

  return NextResponse.json({
    success: true,
    message: 'Metrics reset successfully'
  });
}
