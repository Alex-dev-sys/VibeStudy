# MCP Supabase Testing Guide

This guide provides step-by-step instructions for testing the Supabase MCP integration.

## Prerequisites

1. ✅ MCP server configured in `.mcp.json`
2. ✅ Environment variables set in `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. ⚠️ **Restart Kiro AI assistant** to load the new MCP server configuration

## How to Restart Kiro AI

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Search for "MCP"
3. Select "Reconnect MCP Servers" or restart the IDE

## Test 1: Verify MCP Server is Loaded

**Objective**: Confirm that Supabase MCP tools are available

**Test Command**: Ask Kiro AI:
```
List all available MCP tools
```

**Expected Result**: You should see tools including:
- `supabase_query`
- `supabase_get_schema`
- `supabase_list_tables`
- `supabase_get_table_info`

**Status**: ⏳ Pending restart

---

## Test 2: List All Database Tables (Task 4.1)

**Objective**: Verify `supabase_list_tables` tool works correctly

**Test Command**: Ask Kiro AI:
```
What tables are in the Supabase database?
```

or

```
Use the supabase_list_tables MCP tool to show me all tables
```

**Expected Result**: Response should include these tables:
- `users`
- `user_progress`
- `task_attempts`
- `user_achievements`
- `topic_mastery`
- `generated_content_cache`

**Status**: ⏳ Pending restart

---

## Test 3: Get Table Schema (Task 4.2)

**Objective**: Verify `supabase_get_schema` tool retrieves column information

**Test Command**: Ask Kiro AI:
```
What columns does the user_progress table have?
```

or

```
Show me the schema for the user_progress table
```

**Expected Result**: Response should include columns:
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY to users)
- `topic_id` (TEXT)
- `completed` (BOOLEAN)
- `score` (INTEGER)
- `time_spent` (INTEGER)
- `last_accessed` (TIMESTAMP WITH TIME ZONE)
- `created_at` (TIMESTAMP WITH TIME ZONE)

**Status**: ⏳ Pending restart

---

## Test 4: Get Detailed Table Info (Task 4.3)

**Objective**: Verify `supabase_get_table_info` tool shows indexes and relationships

**Test Command**: Ask Kiro AI:
```
Show me detailed information about the topic_mastery table including indexes and foreign keys
```

**Expected Result**: Response should include:
- Column definitions with types and constraints
- Index: `idx_topic_mastery_user_id` on `user_id`
- Foreign key: `user_id` references `users(id)` with ON DELETE CASCADE
- Unique constraint on `(user_id, topic)`

**Status**: ⏳ Pending restart

---

## Test 5: Simple SELECT Query (Task 5.1)

**Objective**: Verify `supabase_query` tool can execute SELECT queries

**Test Command**: Ask Kiro AI:
```
Show me the latest 5 user achievements from the database
```

or

```
Execute this query: SELECT * FROM user_achievements ORDER BY unlocked_at DESC LIMIT 5
```

**Expected Result**: 
- Query executes successfully
- Results returned in structured JSON format
- Each result includes: `id`, `user_id`, `achievement_id`, `unlocked_at`

**Status**: ⏳ Pending restart

---

## Test 6: JOIN Query (Task 5.2)

**Objective**: Verify JOIN operations across related tables

**Test Command**: Ask Kiro AI:
```
Show me users and their progress by joining the users and user_progress tables
```

or

```
Execute a JOIN query between users and user_progress tables
```

**Expected Result**:
- Query executes with JOIN successfully
- Results include data from both tables
- Relationship data is correctly retrieved

**Status**: ⏳ Pending restart

---

## Test 7: Aggregate Query (Task 5.3)

**Objective**: Verify GROUP BY and aggregate functions work

**Test Command**: Ask Kiro AI:
```
What's the average mastery level for each topic in the topic_mastery table?
```

or

```
Execute: SELECT topic, AVG(mastery_level) as avg_mastery FROM topic_mastery GROUP BY topic
```

**Expected Result**:
- Query executes with GROUP BY and AVG()
- Results show topic names with average mastery levels
- Numeric values are properly formatted

**Status**: ⏳ Pending restart

---

## Test 8: Parameterized Query (Task 5.4)

**Objective**: Verify parameterized queries prevent SQL injection

**Test Command**: Ask Kiro AI:
```
Show me a user by ID using a parameterized query with placeholder $1
```

**Expected Result**:
- Query uses `$1` placeholder for parameter
- Parameters are properly escaped
- Query is safe from SQL injection

**Status**: ⏳ Pending restart

---

## Test 9: Invalid Query Error (Task 6.1)

**Objective**: Verify error handling for syntax errors

**Test Command**: Ask Kiro AI:
```
Execute this invalid query: SELCT * FORM users
```

**Expected Result**:
- Clear error message indicating syntax error
- Error details explain what's wrong
- Suggestion on how to fix the query

**Status**: ⏳ Pending restart

---

## Test 10: Non-existent Table Error (Task 6.2)

**Objective**: Verify error handling for invalid table names

**Test Command**: Ask Kiro AI:
```
Query the table named 'nonexistent_table'
```

**Expected Result**:
- Error message indicates table doesn't exist
- Helpful suggestion listing available tables
- Clear guidance on next steps

**Status**: ⏳ Pending restart

---

## Test 11: Credentials Security (Task 6.3)

**Objective**: Verify credentials are not exposed in responses

**Test Steps**:
1. Execute any query using MCP tools
2. Check the response for any credential leakage
3. Verify `.env.local` is in `.gitignore`

**Expected Result**:
- No `SUPABASE_SERVICE_ROLE_KEY` visible in responses
- No `SUPABASE_URL` credentials exposed
- `.env.local` is properly gitignored

**Status**: ⏳ Pending restart

---

## Test 12: RLS Policy Behavior (Task 6.4)

**Objective**: Verify service role key bypasses RLS as expected

**Test Command**: Ask Kiro AI:
```
Query all users from the users table
```

**Expected Result**:
- Query succeeds (service role bypasses RLS)
- All users are returned (not filtered by RLS)
- Document that frontend uses anon key with RLS, MCP uses service role without RLS

**Status**: ⏳ Pending restart

---

## Troubleshooting

### MCP Server Not Appearing

**Problem**: Supabase MCP tools don't appear in available tools list

**Solutions**:
1. Verify `.mcp.json` syntax is correct (valid JSON)
2. Check environment variables are set in `.env.local`
3. Restart Kiro AI assistant completely
4. Check MCP server logs for errors

### Connection Errors

**Problem**: "Failed to connect to Supabase" error

**Solutions**:
1. Verify `SUPABASE_URL` is correct in `.env.local`
2. Check `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Test connection manually using Supabase client
4. Verify network connectivity to Supabase

### Permission Errors

**Problem**: "Permission denied" when querying tables

**Solutions**:
1. Verify using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
2. Check service role key has correct permissions in Supabase dashboard
3. Verify RLS policies are configured correctly

### Query Errors

**Problem**: SQL queries fail with syntax errors

**Solutions**:
1. Verify table and column names match schema
2. Check SQL syntax is PostgreSQL-compatible
3. Use parameterized queries for dynamic values
4. Test query directly in Supabase SQL editor first

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Mark tasks 4.1-6.4 as completed in `tasks.md`
2. 📝 Document any issues or unexpected behavior
3. 🚀 Proceed to tasks 7-8 (documentation and performance testing)
4. 🎉 Integration is complete and ready for use!

---

## Quick Reference: MCP Tools

### supabase_list_tables
```
Lists all tables in the database
Parameters: None
```

### supabase_get_schema
```
Get schema for specific table or all tables
Parameters: table_name (optional)
```

### supabase_get_table_info
```
Get detailed info about a table
Parameters: table_name (required)
```

### supabase_query
```
Execute SQL query
Parameters: query (required), params (optional array)
```

---

## Database Schema Quick Reference

```sql
-- Users
users (id, username, email, created_at, updated_at)

-- Progress
user_progress (id, user_id, topic_id, completed, score, time_spent, last_accessed, created_at)

-- Attempts
task_attempts (id, user_id, task_id, code, result, is_correct, hints_used, time_spent, created_at)

-- Achievements
user_achievements (id, user_id, achievement_id, unlocked_at)

-- Mastery
topic_mastery (id, user_id, topic, mastery_level, total_attempts, successful_attempts, last_practice, updated_at)

-- Cache
generated_content_cache (id, content_type, topic, difficulty, language, content, created_at, expires_at)
```
