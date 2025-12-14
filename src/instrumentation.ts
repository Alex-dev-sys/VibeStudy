export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('🏗️ Registering instrumentation hooks...');

        try {
            // Import node-cron only in the server runtime
            const cron = (await import('node-cron')).default;

            const CRON_SECRET = process.env.CRON_SECRET;

            // We use the deployment URL or localhost fallback. 
            // specific to where this component runs (server-side).
            const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

            if (!CRON_SECRET) {
                console.warn('⚠️ CRON_SECRET not defined. Cron jobs will not be authorized.');
            }

            console.log('🚀 Initializing Cron Jobs via Instrumentation...');

            // --- Job 1: Generate Daily Challenge ---
            // Schedule: Every day at midnight (00:00)
            cron.schedule('0 0 * * *', async () => {
                console.log('⏰ [Daily Challenge] Starting job...');
                try {
                    const response = await fetch(`${APP_URL}/api/cron/generate-challenge`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${CRON_SECRET}`,
                        },
                        cache: 'no-store',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ [Daily Challenge] Success:', JSON.stringify(data, null, 2));
                    } else {
                        console.error(`❌ [Daily Challenge] Failed: ${response.status} ${await response.text()}`);
                    }
                } catch (error) {
                    console.error('❌ [Daily Challenge] Error executing job:', error);
                }
            });

            // --- Job 2: Verify Pending Payments ---
            // Schedule: Every 10 minutes
            cron.schedule('*/10 * * * *', async () => {
                // console.log('⏰ [Payment Verification] Starting job...');
                try {
                    const response = await fetch(`${APP_URL}/api/cron/verify-pending-payments`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${CRON_SECRET}`,
                        },
                        cache: 'no-store',
                    });

                    if (response.ok) {
                        const data = await response.json() as { processed: number;[key: string]: any };
                        if (data?.processed > 0) {
                            console.log('✅ [Payment Verification] Processed payments:', JSON.stringify(data, null, 2));
                        }
                    } else {
                        console.error(`❌ [Payment Verification] Failed: ${response.status} ${await response.text()}`);
                    }
                } catch (error) {
                    console.error('❌ [Payment Verification] Error executing job:', error);
                }
            });

            console.log('✨ Cron jobs registered successfully.');

        } catch (error) {
            console.error('❌ Failed to register cron jobs:', error);
        }
    }
}
