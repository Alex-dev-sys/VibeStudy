import { loadEnvConfig } from '@next/env';
import cron from 'node-cron';
import fetch from 'node-fetch'; // Standard fetch might differ in Node < 18, but Next.js environment usually has it. If issues, we can use 'undici' or similar. 
// Note: In Node 18+, global fetch is available. If using earlier node, might need polyfill.
// Since this is a Next.js project, it likely runs on a recent Node version. 
// If 'node-fetch' is not installed, we can rely on global fetch if Node >= 18.

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
    console.error('❌ Error: CRON_SECRET is not defined in environment variables.');
    process.exit(1);
}

console.log('🚀 Cron Service Starting...');
console.log(`📍 Target URL: ${API_URL}`);

// --- Job 1: Generate Daily Challenge ---
// Schedule: Every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Daily Challenge] Starting job...');
    try {
        const response = await fetch(`${API_URL}/api/cron/generate-challenge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ [Daily Challenge] Success:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.error(`❌ [Daily Challenge] Failed: ${response.status} ${response.statusText}`, text);
        }
    } catch (error) {
        console.error('❌ [Daily Challenge] Error executing job:', error);
    }
});

// --- Job 2: Verify Pending Payments ---
// Schedule: Every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ [Payment Verification] Starting job...');
    try {
        const response = await fetch(`${API_URL}/api/cron/verify-pending-payments`, {
            method: 'GET', // Note: The route might be GET or POST. Checked route.ts, it is GET.
            headers: {
                'Authorization': `Bearer ${CRON_SECRET}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Log only if work was done to avoid spamming logs
            if (data.processed > 0) {
                console.log('✅ [Payment Verification] Processed payments:', JSON.stringify(data, null, 2));
            } else {
                // console.log('💤 [Payment Verification] No pending payments.');
            }
        } else {
            const text = await response.text();
            console.error(`❌ [Payment Verification] Failed: ${response.status} ${response.statusText}`, text);
        }
    } catch (error) {
        console.error('❌ [Payment Verification] Error executing job:', error);
    }
});

console.log('✨ Cron scheduler is running. Press Ctrl+C to stop.');
