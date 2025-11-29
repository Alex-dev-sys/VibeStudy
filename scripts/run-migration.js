const https = require('https');

const SUPABASE_URL = 'https://qtswuibugwuvgzppkbtq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c3d1aWJ1Z3d1dmd6cHBrYnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYxNzQ2NywiZXhwIjoyMDc4MTkzNDY3fQ.q3JGkniUcjC4MK6Hm7-qdkSWhcJvj9c1zGSbzvSI81Y';

const statements = [
    'ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS day INTEGER',
    'ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE',
    'ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE',
    'ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT FALSE',
    'ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1',
    'ALTER TABLE task_attempts ALTER COLUMN code DROP NOT NULL',
    'CREATE INDEX IF NOT EXISTS idx_task_attempts_day ON task_attempts(user_id, day)',
    'CREATE INDEX IF NOT EXISTS idx_task_attempts_success ON task_attempts(user_id, success)',
    'CREATE INDEX IF NOT EXISTS idx_task_attempts_time ON task_attempts(user_id, start_time)'
];

async function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });

        const options = {
            hostname: 'qtswuibugwuvgzppkbtq.supabase.co',
            port: 443,
            path: '/rest/v1/rpc/exec_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Prefer': 'return=minimal'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, status: res.statusCode });
                } else {
                    resolve({ success: false, status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function applyMigration() {
    console.log('🚀 Applying analytics migration...\n');

    for (const sql of statements) {
        const shortSql = sql.substring(0, 70) + '...';
        process.stdout.write(`  ⏳ ${shortSql} `);

        try {
            const result = await executeSQL(sql);
            if (result.success) {
                console.log('✅');
            } else {
                console.log(`❌ (${result.status})`);
                console.log(`     ${result.body}`);
            }
        } catch (error) {
            console.log(`❌ ${error.message}`);
        }
    }

    console.log('\n🎉 Migration complete!');
    console.log('   Refresh /analytics page to test');
}

applyMigration();
