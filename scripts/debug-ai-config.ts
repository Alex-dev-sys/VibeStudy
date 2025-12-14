
import { loadEnvConfig } from '@next/env';
import { isAiConfiguredAsync, resolveConfigAsync } from '../src/lib/ai-client';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function checkConfig() {
    console.log('🔍 Checking AI Configuration...');

    const isConfigured = await isAiConfiguredAsync();
    console.log(`isAiConfiguredAsync: ${isConfigured ? '✅ YES' : '❌ NO'}`);

    if (!isConfigured) {
        console.log('Trying to resolve config to see details...');
        const config = await resolveConfigAsync();
        console.log('Config:', {
            ...config,
            apiKey: config.apiKey ? '***HIDDEN***' : 'MISSING'
        });
    } else {
        console.log('🎉 AI is properly configured!');
    }
}

checkConfig().catch(console.error);
