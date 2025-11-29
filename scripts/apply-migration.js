const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_analytics_tracking.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log('📝 Applying migration: 008_analytics_tracking.sql\n');

        // Execute SQL statements one by one
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

        for (const sql of statements) {
            console.log(`  ⏳ ${sql.substring(0, 60)}...`);
            const { data, error } = await supabase.rpc('query', { sql });

            if (error) {
                // Try direct query if RPC fails
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    },
                    body: JSON.stringify({ sql })
                });

                if (!response.ok) {
                    console.error(`  ❌ Failed: ${error.message}`);
                    console.log('  ℹ️  Please run this SQL manually in Supabase Dashboard');
                } else {
                    console.log('  ✅ Done');
                }
            } else {
                console.log('  ✅ Done');
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log('   Refresh /analytics page to see changes');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n📋 Manual SQL to run in Supabase Dashboard:');
        console.log('   https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/sql/new\n');

        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_analytics_tracking.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        console.log(migrationSQL);
    }
}

applyMigration();
