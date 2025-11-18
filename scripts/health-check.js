/**
 * Simple health check script that pings the Next.js health endpoint.
 */
const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:3000/api/health';

async function run() {
  try {
    const response = await fetch(HEALTH_URL);
    const payload = await response.json();

    if (!response.ok || payload.status !== 'ok') {
      console.error('[health-check] Service unhealthy:', payload);
      process.exit(1);
    }

    console.log('[health-check] OK', payload);
  } catch (error) {
    console.error('[health-check] Failed to reach service:', error);
    process.exit(1);
  }
}

run();

