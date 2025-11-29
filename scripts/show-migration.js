require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applying migration via Supabase REST API...\n');
console.log('URL:', supabaseUrl);
console.log('Key length:', serviceKey?.length || 0);

const sqlStatements = `
-- Add analytics tracking fields
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS day INTEGER;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT FALSE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- Make code nullable  
ALTER TABLE task_attempts ALTER COLUMN code DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_attempts_day ON task_attempts(user_id, day);
CREATE INDEX IF NOT EXISTS idx_task_attempts_success ON task_attempts(user_id, success);
CREATE INDEX IF NOT EXISTS idx_task_attempts_time ON task_attempts(user_id, start_time);
`;

// Show SQL for manual application
console.log('📋 SQL to run in Supabase Dashboard:');
console.log('='.repeat(60));
console.log(sqlStatements);
console.log('='.repeat(60));
console.log('\n👉 Apply at: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/sql/new');
console.log('\n⚠️  Note: For security, SQL execution requires Dashboard access');
