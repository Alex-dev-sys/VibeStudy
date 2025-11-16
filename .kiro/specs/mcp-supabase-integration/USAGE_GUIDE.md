# MCP Supabase Usage Guide

This guide provides practical examples and best practices for using the Supabase MCP integration with Kiro AI assistant.

## Overview

The Supabase MCP integration allows Kiro AI to interact directly with your Supabase PostgreSQL database through four main tools:

1. **supabase_list_tables** - Discover available tables
2. **supabase_get_schema** - Understand table structure
3. **supabase_get_table_info** - Get detailed table information
4. **supabase_query** - Execute SQL queries

## Common Query Patterns

### 1. User Progress Analysis

**Use Case**: Analyze how users are progressing through the curriculum

**Natural Language Query**:
```
Show me users who have completed more than 10 topics
```

**SQL Query**:
```sql
SELECT 
  u.username,
  COUNT(up.id) as completed_topics,
  AVG(up.score) as avg_score
FROM users u
JOIN user_progress up ON u.id = up.user_id
WHERE up.completed = true
GROUP BY u.id, u.username
HAVING COUNT(up.id) > 10
ORDER BY completed_topics DESC;
```

**Expected Output**: List of users with their completion counts and average scores

---

### 2. Achievement Statistics

**Use Case**: Understand which achievements are most commonly unlocked

**Natural Language Query**:
```
What are the most popular achievements?
```

**SQL Query**:
```sql
SELECT 
  achievement_id,
  COUNT(*) as unlock_count,
  MIN(unlocked_at) as first_unlock,
  MAX(unlocked_at) as latest_unlock
FROM user_achievements
GROUP BY achievement_id
ORDER BY unlock_count DESC
LIMIT 10;
```

**Expected Output**: Top 10 achievements with unlock statistics

---

### 3. Learning Pattern Analysis

**Use Case**: Identify topics where users struggle

**Natural Language Query**:
```
Which topics have the lowest mastery levels?
```

**SQL Query**:
```sql
SELECT 
  topic,
  AVG(mastery_level) as avg_mastery,
  AVG(CAST(successful_attempts AS FLOAT) / NULLIF(total_attempts, 0)) as success_rate,
  COUNT(DISTINCT user_id) as user_count
FROM topic_mastery
GROUP BY topic
HAVING COUNT(DISTINCT user_id) >= 5
ORDER BY avg_mastery ASC
LIMIT 10;
```

**Expected Output**: Topics with low mastery levels and success rates

---

### 4. Recent Activity Tracking

**Use Case**: Monitor recent user activity

**Natural Language Query**:
```
Show me the most recent task attempts
```

**SQL Query**:
```sql
SELECT 
  u.username,
  ta.task_id,
  ta.is_correct,
  ta.hints_used,
  ta.time_spent,
  ta.created_at
FROM task_attempts ta
JOIN users u ON ta.user_id = u.id
ORDER BY ta.created_at DESC
LIMIT 20;
```

**Expected Output**: Recent task attempts with user information

---

### 5. User Performance Report

**Use Case**: Generate comprehensive user performance report

**Natural Language Query**:
```
Give me a performance report for a specific user
```

**SQL Query** (parameterized):
```sql
SELECT 
  u.username,
  u.email,
  COUNT(DISTINCT up.topic_id) as topics_completed,
  AVG(up.score) as avg_score,
  SUM(up.time_spent) as total_time_minutes,
  COUNT(DISTINCT ua.achievement_id) as achievements_unlocked,
  AVG(tm.mastery_level) as avg_mastery
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed = true
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN topic_mastery tm ON u.id = tm.user_id
WHERE u.id = $1
GROUP BY u.id, u.username, u.email;
```

**Expected Output**: Comprehensive statistics for one user

---

### 6. Content Cache Analysis

**Use Case**: Monitor AI-generated content cache usage

**Natural Language Query**:
```
What types of content are cached most frequently?
```

**SQL Query**:
```sql
SELECT 
  content_type,
  topic,
  difficulty,
  language,
  COUNT(*) as cache_count,
  MAX(created_at) as last_generated
FROM generated_content_cache
WHERE expires_at IS NULL OR expires_at > NOW()
GROUP BY content_type, topic, difficulty, language
ORDER BY cache_count DESC;
```

**Expected Output**: Cache statistics by content type and topic

---

## Best Practices

### 1. Use Parameterized Queries

**Why**: Prevent SQL injection and improve query reusability

**Bad Example**:
```sql
SELECT * FROM users WHERE username = 'user_input';
```

**Good Example**:
```sql
SELECT * FROM users WHERE username = $1;
```

**How to Ask Kiro**:
```
Query users table with username parameter using $1 placeholder
```

---

### 2. Limit Result Sets

**Why**: Prevent large data transfers and improve performance

**Bad Example**:
```sql
SELECT * FROM task_attempts;
```

**Good Example**:
```sql
SELECT * FROM task_attempts 
ORDER BY created_at DESC 
LIMIT 100;
```

**How to Ask Kiro**:
```
Show me the latest 100 task attempts
```

---

### 3. Use Indexes Efficiently

**Why**: Leverage existing indexes for faster queries

**Indexed Columns**:
- `user_progress.user_id` → `idx_user_progress_user_id`
- `task_attempts.user_id` → `idx_task_attempts_user_id`
- `task_attempts.task_id` → `idx_task_attempts_task_id`
- `topic_mastery.user_id` → `idx_topic_mastery_user_id`
- `generated_content_cache.(content_type, topic, difficulty, language)` → `idx_generated_content_cache_lookup`

**Good Practice**: Always filter by indexed columns when possible

```sql
-- Fast: Uses index
SELECT * FROM user_progress WHERE user_id = $1;

-- Slow: No index on topic_id alone
SELECT * FROM user_progress WHERE topic_id = 'python_basics';
```

---

### 4. Understand RLS Context

**Important**: MCP server uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses Row Level Security (RLS)

**What This Means**:
- ✅ AI can query all user data for analytics
- ✅ No RLS policy restrictions apply
- ⚠️ Be careful with data exposure in responses
- ⚠️ Don't expose sensitive user data unnecessarily

**Frontend vs MCP**:
```
Frontend (Next.js):
- Uses NEXT_PUBLIC_SUPABASE_ANON_KEY
- RLS policies enforced
- Users see only their own data

MCP (AI Assistant):
- Uses SUPABASE_SERVICE_ROLE_KEY
- RLS policies bypassed
- Can access all data for analytics
```

---

### 5. Optimize JOIN Queries

**Why**: Reduce query complexity and improve performance

**Good Practice**: Only join tables you need

```sql
-- Good: Only necessary joins
SELECT u.username, COUNT(up.id) as progress_count
FROM users u
JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.username;

-- Avoid: Unnecessary joins
SELECT u.username, COUNT(up.id) as progress_count
FROM users u
JOIN user_progress up ON u.id = up.user_id
JOIN task_attempts ta ON u.id = ta.user_id  -- Not needed!
GROUP BY u.id, u.username;
```

---

## Security Considerations

### 1. Credential Protection

**✅ Do**:
- Keep `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Never commit credentials to git
- Use environment variables in MCP config

**❌ Don't**:
- Hardcode credentials in `.mcp.json`
- Share service role key publicly
- Expose credentials in logs or responses

---

### 2. Query Safety

**✅ Do**:
- Use parameterized queries with `$1, $2` placeholders
- Validate user input before querying
- Limit result sets with `LIMIT` clause

**❌ Don't**:
- Concatenate user input into SQL strings
- Execute queries without validation
- Return entire tables without limits

---

### 3. Data Privacy

**✅ Do**:
- Aggregate data when possible
- Remove PII from analytics queries
- Use anonymized data for reports

**❌ Don't**:
- Expose user emails unnecessarily
- Return sensitive user data in responses
- Share individual user data without consent

---

## Troubleshooting Common Issues

### Issue 1: "Table does not exist"

**Cause**: Table name is incorrect or schema not loaded

**Solution**:
```
Ask Kiro: "List all tables in the database"
Verify table name matches exactly (case-sensitive)
```

---

### Issue 2: "Column does not exist"

**Cause**: Column name is incorrect or typo

**Solution**:
```
Ask Kiro: "Show me the schema for [table_name]"
Check column name spelling and case
```

---

### Issue 3: "Permission denied"

**Cause**: Service role key not configured or invalid

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Check key is valid in Supabase dashboard
3. Restart Kiro AI to reload environment variables

---

### Issue 4: "Query timeout"

**Cause**: Query is too complex or result set too large

**Solution**:
- Add `LIMIT` clause to reduce result set
- Optimize query with proper indexes
- Break complex query into smaller queries

---

### Issue 5: "Syntax error near..."

**Cause**: SQL syntax is incorrect

**Solution**:
- Check PostgreSQL syntax documentation
- Verify table and column names
- Test query in Supabase SQL editor first

---

## Example Workflows

### Workflow 1: New User Onboarding Analysis

**Goal**: Understand how new users engage with the platform

**Steps**:
1. Ask Kiro: "Show me users created in the last 7 days"
2. Ask Kiro: "What's the average progress for these new users?"
3. Ask Kiro: "Which topics do new users complete first?"

**Expected Insights**: User onboarding patterns and initial engagement

---

### Workflow 2: Content Effectiveness Analysis

**Goal**: Identify which topics need improvement

**Steps**:
1. Ask Kiro: "What topics have the lowest success rates?"
2. Ask Kiro: "How many hints are used for these topics?"
3. Ask Kiro: "What's the average time spent on difficult topics?"

**Expected Insights**: Topics that need better content or explanations

---

### Workflow 3: Achievement System Optimization

**Goal**: Balance achievement difficulty and unlock rates

**Steps**:
1. Ask Kiro: "Which achievements are unlocked most frequently?"
2. Ask Kiro: "Which achievements have never been unlocked?"
3. Ask Kiro: "What's the average time to unlock each achievement?"

**Expected Insights**: Achievement balance and engagement metrics

---

## Advanced Techniques

### 1. Window Functions

**Use Case**: Rank users by performance

```sql
SELECT 
  username,
  total_score,
  RANK() OVER (ORDER BY total_score DESC) as rank
FROM (
  SELECT 
    u.username,
    SUM(up.score) as total_score
  FROM users u
  JOIN user_progress up ON u.id = up.user_id
  GROUP BY u.id, u.username
) ranked_users;
```

---

### 2. Common Table Expressions (CTEs)

**Use Case**: Break complex queries into readable parts

```sql
WITH user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_attempts
  FROM task_attempts
  GROUP BY user_id
)
SELECT 
  u.username,
  us.total_attempts,
  us.correct_attempts,
  ROUND(us.correct_attempts::NUMERIC / us.total_attempts * 100, 2) as success_rate
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY success_rate DESC;
```

---

### 3. JSON Aggregation

**Use Case**: Aggregate related data into JSON

```sql
SELECT 
  u.username,
  json_agg(
    json_build_object(
      'achievement_id', ua.achievement_id,
      'unlocked_at', ua.unlocked_at
    )
  ) as achievements
FROM users u
JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.username;
```

---

## Quick Reference

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | `id`, `username`, `email` |
| `user_progress` | Learning progress | `user_id`, `topic_id`, `completed`, `score` |
| `task_attempts` | Task submissions | `user_id`, `task_id`, `is_correct`, `code` |
| `user_achievements` | Unlocked achievements | `user_id`, `achievement_id`, `unlocked_at` |
| `topic_mastery` | Skill levels | `user_id`, `topic`, `mastery_level` |
| `generated_content_cache` | AI content cache | `content_type`, `topic`, `content` |

### Common Aggregations

| Function | Purpose | Example |
|----------|---------|---------|
| `COUNT(*)` | Count rows | `SELECT COUNT(*) FROM users` |
| `AVG(column)` | Average value | `SELECT AVG(score) FROM user_progress` |
| `SUM(column)` | Total sum | `SELECT SUM(time_spent) FROM task_attempts` |
| `MIN(column)` | Minimum value | `SELECT MIN(created_at) FROM users` |
| `MAX(column)` | Maximum value | `SELECT MAX(mastery_level) FROM topic_mastery` |

### Useful Filters

| Filter | Purpose | Example |
|--------|---------|---------|
| `WHERE completed = true` | Only completed items | Progress tracking |
| `WHERE created_at > NOW() - INTERVAL '7 days'` | Last 7 days | Recent activity |
| `WHERE mastery_level > 0.7` | High mastery | Advanced users |
| `HAVING COUNT(*) > 10` | Aggregate filter | Active users |

---

## Getting Help

If you need assistance with MCP Supabase queries:

1. **Ask Kiro naturally**: "Show me users who completed Python topics"
2. **Request schema info**: "What columns does the user_progress table have?"
3. **Get query suggestions**: "How can I find users with high mastery levels?"
4. **Debug errors**: "Why did my query fail?" (include error message)

Kiro AI will use the appropriate MCP tools automatically to help you!
