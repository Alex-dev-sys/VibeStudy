# Performance Testing and Optimization Guide

This guide provides strategies for testing and optimizing the performance of MCP Supabase queries.

## Overview

Performance optimization ensures that AI-assisted database queries execute quickly and efficiently, providing a smooth user experience and minimizing database load.

## Performance Metrics

### Key Metrics to Monitor

1. **Query Execution Time**: Time from query submission to result return
2. **Result Set Size**: Number of rows and data volume returned
3. **Connection Time**: Time to establish database connection
4. **Memory Usage**: Memory consumed by query results
5. **Database Load**: Impact on database CPU and I/O

### Target Performance Goals

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Simple SELECT | < 50ms | < 200ms | > 500ms |
| JOIN query | < 100ms | < 500ms | > 1s |
| Aggregate query | < 200ms | < 1s | > 2s |
| Result set size | < 100 rows | < 1000 rows | > 10000 rows |
| Connection time | < 100ms | < 300ms | > 1s |

---

## Performance Testing

### Test 1: Simple SELECT Query Performance

**Objective**: Measure baseline query performance

**Test Query**:
```sql
SELECT * FROM users LIMIT 100;
```

**How to Test**:
1. Ask Kiro: "Show me 100 users from the database"
2. Note the execution time in response
3. Repeat 5 times and calculate average

**Expected Result**: < 50ms average execution time

**Optimization if Slow**:
- Reduce result set size with LIMIT
- Select only needed columns instead of *
- Check database connection latency

---

### Test 2: JOIN Query Performance

**Objective**: Measure performance of related table queries

**Test Query**:
```sql
SELECT 
  u.username,
  up.topic_id,
  up.score
FROM users u
JOIN user_progress up ON u.id = up.user_id
LIMIT 100;
```

**How to Test**:
1. Ask Kiro: "Show me users and their progress (limit 100)"
2. Measure execution time
3. Compare with single table query

**Expected Result**: < 100ms execution time

**Optimization if Slow**:
- Ensure foreign key indexes exist
- Reduce number of joined tables
- Add WHERE clause to filter before JOIN

---

### Test 3: Aggregate Query Performance

**Objective**: Measure GROUP BY and aggregate function performance

**Test Query**:
```sql
SELECT 
  topic,
  COUNT(*) as user_count,
  AVG(mastery_level) as avg_mastery
FROM topic_mastery
GROUP BY topic;
```

**How to Test**:
1. Ask Kiro: "What's the average mastery level by topic?"
2. Measure execution time
3. Note number of groups returned

**Expected Result**: < 200ms execution time

**Optimization if Slow**:
- Add index on GROUP BY column
- Filter data with WHERE before GROUP BY
- Use HAVING to filter groups after aggregation

---

### Test 4: Large Result Set Handling

**Objective**: Test behavior with large data volumes

**Test Query**:
```sql
SELECT * FROM task_attempts LIMIT 10000;
```

**How to Test**:
1. Ask Kiro: "Show me 10,000 task attempts"
2. Measure execution time and memory usage
3. Check if response is truncated

**Expected Result**: 
- Query completes in < 1s
- Results may be paginated or truncated
- No memory issues

**Optimization if Slow**:
- Implement pagination (OFFSET/LIMIT)
- Reduce result set size
- Stream results instead of loading all at once

---

### Test 5: Complex Query Performance

**Objective**: Test multi-table JOIN with aggregation

**Test Query**:
```sql
SELECT 
  u.username,
  COUNT(DISTINCT up.topic_id) as topics_completed,
  COUNT(DISTINCT ua.achievement_id) as achievements,
  AVG(tm.mastery_level) as avg_mastery
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed = true
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN topic_mastery tm ON u.id = tm.user_id
GROUP BY u.id, u.username
LIMIT 50;
```

**How to Test**:
1. Ask Kiro: "Give me a comprehensive user statistics report (50 users)"
2. Measure execution time
3. Check query plan if slow

**Expected Result**: < 500ms execution time

**Optimization if Slow**:
- Break into multiple simpler queries
- Add indexes on JOIN columns
- Use subqueries or CTEs for clarity
- Cache results if query is frequent

---

## Optimization Strategies

### 1. Index Optimization

**Existing Indexes**:
```sql
-- Already created in schema
idx_user_progress_user_id
idx_task_attempts_user_id
idx_task_attempts_task_id
idx_topic_mastery_user_id
idx_generated_content_cache_lookup
```

**How to Use Indexes Effectively**:

**✅ Good - Uses Index**:
```sql
-- Uses idx_user_progress_user_id
SELECT * FROM user_progress WHERE user_id = $1;

-- Uses idx_task_attempts_user_id
SELECT * FROM task_attempts WHERE user_id = $1;
```

**❌ Bad - Doesn't Use Index**:
```sql
-- No index on topic_id alone
SELECT * FROM user_progress WHERE topic_id = 'python_basics';

-- Function on indexed column prevents index use
SELECT * FROM users WHERE LOWER(username) = 'john';
```

**Recommendation**: Always filter by indexed columns when possible

---

### 2. Query Structure Optimization

#### Use EXPLAIN ANALYZE

**Purpose**: Understand query execution plan

**How to Use**:
```sql
EXPLAIN ANALYZE
SELECT * FROM user_progress WHERE user_id = $1;
```

**What to Look For**:
- Seq Scan (bad) vs Index Scan (good)
- High cost estimates
- Nested loops vs hash joins
- Actual time vs estimated time

**Ask Kiro**:
```
Explain the execution plan for this query: [your query]
```

---

#### Optimize JOIN Order

**Principle**: Join smaller tables first

**Good**:
```sql
-- Join smaller result set first
SELECT *
FROM (
  SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days'
) recent_users
JOIN user_progress up ON recent_users.id = up.user_id;
```

**Bad**:
```sql
-- Joins all users first, then filters
SELECT *
FROM users u
JOIN user_progress up ON u.id = up.user_id
WHERE u.created_at > NOW() - INTERVAL '7 days';
```

---

#### Use Subqueries Wisely

**When to Use Subqueries**:
- Filter data before JOIN
- Calculate intermediate results
- Improve query readability

**Example**:
```sql
-- Good: Filter in subquery
SELECT u.username, stats.total_score
FROM users u
JOIN (
  SELECT user_id, SUM(score) as total_score
  FROM user_progress
  WHERE completed = true
  GROUP BY user_id
) stats ON u.id = stats.user_id;
```

---

### 3. Result Set Optimization

#### Always Use LIMIT

**Why**: Prevent accidentally returning millions of rows

**Good**:
```sql
SELECT * FROM task_attempts 
ORDER BY created_at DESC 
LIMIT 100;
```

**Bad**:
```sql
SELECT * FROM task_attempts;
-- Could return millions of rows!
```

**Recommendation**: Default LIMIT of 100-1000 for most queries

---

#### Select Only Needed Columns

**Why**: Reduce data transfer and memory usage

**Good**:
```sql
SELECT username, email FROM users LIMIT 100;
-- Returns ~10KB
```

**Bad**:
```sql
SELECT * FROM users LIMIT 100;
-- Returns ~50KB (includes all columns)
```

**Impact**: 5x reduction in data transfer

---

#### Implement Pagination

**Why**: Handle large result sets efficiently

**Pattern**:
```sql
-- Page 1
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 0;

-- Page 2
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 50;

-- Page 3
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 100;
```

**Better Pattern (Keyset Pagination)**:
```sql
-- Page 1
SELECT * FROM users 
ORDER BY created_at DESC 
LIMIT 50;

-- Page 2 (using last created_at from page 1)
SELECT * FROM users 
WHERE created_at < $1
ORDER BY created_at DESC 
LIMIT 50;
```

**Why Better**: Keyset pagination is faster for large offsets

---

### 4. Connection Pooling

**How MCP Handles Connections**:
- MCP server maintains connection pool
- Connections reused across queries
- Automatic reconnection on failure

**Best Practices**:
- Don't worry about opening/closing connections
- MCP handles this automatically
- Focus on query optimization instead

**Configuration** (if needed):
```json
// .mcp.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}",
        "PGPOOL_MAX": "10",
        "PGPOOL_IDLE_TIMEOUT": "30000"
      }
    }
  }
}
```

---

### 5. Caching Strategies

#### Query Result Caching

**When to Cache**:
- Frequently accessed data
- Data that changes infrequently
- Expensive aggregate queries

**Example Use Case**: Topic statistics

**Implementation**:
```sql
-- Cache in generated_content_cache table
INSERT INTO generated_content_cache (
  content_type,
  topic,
  content,
  expires_at
) VALUES (
  'statistics',
  'all_topics',
  '{"avg_mastery": 0.75, "user_count": 1500}'::jsonb,
  NOW() + INTERVAL '1 hour'
);

-- Retrieve from cache
SELECT content 
FROM generated_content_cache
WHERE content_type = 'statistics'
  AND topic = 'all_topics'
  AND (expires_at IS NULL OR expires_at > NOW());
```

**Cache Invalidation**:
- Time-based (expires_at)
- Event-based (clear on data update)
- Manual (clear cache command)

---

#### Schema Caching

**What to Cache**: Table schemas, column types, indexes

**Why**: Avoid repeated schema queries

**Implementation**: MCP server likely caches schema internally

**Manual Cache**:
```sql
-- Cache schema information
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public';
```

---

### 6. Query Timeout Configuration

**Purpose**: Prevent long-running queries from blocking

**Configuration**:
```json
// .mcp.json
{
  "mcpServers": {
    "supabase": {
      "env": {
        "PGSTATEMENT_TIMEOUT": "30000"
      }
    }
  }
}
```

**Recommendation**: 30 seconds for most queries

**Handling Timeouts**:
- Break complex queries into smaller parts
- Add indexes to speed up slow queries
- Use pagination for large result sets

---

## Performance Monitoring

### 1. Query Logging

**What to Log**:
```json
{
  "timestamp": "2025-11-16T10:30:00Z",
  "query": "SELECT * FROM users WHERE id = $1",
  "params": ["123"],
  "execution_time_ms": 45,
  "row_count": 1,
  "cache_hit": false
}
```

**Analysis**:
- Identify slow queries (> 500ms)
- Find frequently executed queries (cache candidates)
- Detect query patterns

---

### 2. Performance Dashboards

**Metrics to Track**:
- Average query execution time
- 95th percentile query time
- Queries per minute
- Cache hit rate
- Error rate

**Tools**:
- Supabase Dashboard (built-in metrics)
- Custom logging and analysis
- PostgreSQL pg_stat_statements

---

### 3. Alerting

**Alert Conditions**:
- Query execution time > 5 seconds
- Error rate > 5%
- Connection pool exhausted
- Database CPU > 80%

**Actions**:
- Investigate slow queries
- Optimize or cache problematic queries
- Scale database if needed

---

## Common Performance Issues

### Issue 1: Slow JOIN Queries

**Symptoms**: JOIN queries take > 1 second

**Diagnosis**:
```sql
EXPLAIN ANALYZE
SELECT * FROM users u
JOIN user_progress up ON u.id = up.user_id;
```

**Solutions**:
1. Add index on JOIN columns
2. Filter data before JOIN
3. Use INNER JOIN instead of LEFT JOIN if possible
4. Break into multiple queries

---

### Issue 2: Large Result Sets

**Symptoms**: Query returns thousands of rows, slow response

**Diagnosis**: Check row count in query result

**Solutions**:
1. Add LIMIT clause
2. Implement pagination
3. Add WHERE clause to filter data
4. Aggregate data instead of returning raw rows

---

### Issue 3: Sequential Scans

**Symptoms**: EXPLAIN shows "Seq Scan" instead of "Index Scan"

**Diagnosis**:
```sql
EXPLAIN SELECT * FROM user_progress WHERE topic_id = 'python';
-- Shows: Seq Scan on user_progress
```

**Solutions**:
1. Add index on topic_id
2. Use indexed column in WHERE clause
3. Update table statistics (ANALYZE)

---

### Issue 4: Connection Timeouts

**Symptoms**: "Connection timeout" errors

**Diagnosis**: Check connection pool status

**Solutions**:
1. Increase connection pool size
2. Reduce query execution time
3. Check network connectivity
4. Verify Supabase service status

---

### Issue 5: Memory Issues

**Symptoms**: Out of memory errors, slow performance

**Diagnosis**: Check result set size and memory usage

**Solutions**:
1. Reduce result set size with LIMIT
2. Stream results instead of loading all
3. Use pagination
4. Select fewer columns

---

## Optimization Checklist

### Before Deploying Query

- [ ] Query uses parameterized placeholders ($1, $2)
- [ ] LIMIT clause included (unless intentionally unlimited)
- [ ] Only necessary columns selected (avoid SELECT *)
- [ ] WHERE clause filters data early
- [ ] Indexed columns used in WHERE and JOIN
- [ ] Query tested with EXPLAIN ANALYZE
- [ ] Execution time < 500ms for typical data volume
- [ ] Result set size reasonable (< 1000 rows)

### After Deployment

- [ ] Query performance monitored
- [ ] Slow queries identified and optimized
- [ ] Cache hit rate tracked
- [ ] Error rate acceptable (< 1%)
- [ ] Database load reasonable
- [ ] User experience smooth

---

## Performance Testing Scenarios

### Scenario 1: New User Onboarding

**Load**: 100 new users per day

**Queries**:
- User creation (INSERT)
- Initial progress setup (INSERT)
- Welcome achievements (INSERT)

**Performance Target**: < 100ms per user

**Test**:
```sql
-- Simulate user creation
INSERT INTO users (username, email) 
VALUES ('test_user', 'test@example.com');

-- Measure time
```

---

### Scenario 2: Daily Active Users

**Load**: 1000 active users per day

**Queries**:
- Progress updates (UPDATE)
- Task attempts (INSERT)
- Achievement unlocks (INSERT)
- Progress queries (SELECT)

**Performance Target**: < 50ms per query

**Test**:
```sql
-- Simulate progress update
UPDATE user_progress 
SET completed = true, score = 95 
WHERE user_id = $1 AND topic_id = $2;
```

---

### Scenario 3: Analytics Dashboard

**Load**: 10 dashboard views per hour

**Queries**:
- User statistics (aggregate)
- Topic performance (aggregate)
- Achievement distribution (aggregate)

**Performance Target**: < 1s per dashboard load

**Test**:
```sql
-- Simulate dashboard query
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  AVG(score) as avg_score,
  COUNT(*) as total_progress
FROM user_progress;
```

---

## Optimization Results

### Expected Improvements

| Optimization | Before | After | Improvement |
|--------------|--------|-------|-------------|
| Add LIMIT | 5000ms | 50ms | 100x faster |
| Add Index | 1000ms | 10ms | 100x faster |
| Select columns | 500ms | 100ms | 5x faster |
| Use WHERE | 2000ms | 200ms | 10x faster |
| Pagination | 3000ms | 100ms | 30x faster |

### Real-World Example

**Before Optimization**:
```sql
SELECT * FROM task_attempts;
-- Execution time: 5000ms
-- Rows returned: 100,000
-- Data transferred: 50MB
```

**After Optimization**:
```sql
SELECT 
  user_id,
  task_id,
  is_correct,
  created_at
FROM task_attempts
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 100;
-- Execution time: 50ms
-- Rows returned: 100
-- Data transferred: 10KB
```

**Result**: 100x faster, 5000x less data

---

## Conclusion

Performance optimization is an ongoing process:

1. **Measure**: Use EXPLAIN ANALYZE and logging
2. **Identify**: Find slow queries and bottlenecks
3. **Optimize**: Apply strategies from this guide
4. **Monitor**: Track performance over time
5. **Iterate**: Continuously improve

**Remember**: Premature optimization is the root of all evil. Optimize when you have real performance issues, not before.

---

## Additional Resources

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Performance Guide](https://supabase.com/docs/guides/platform/performance)
- [EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [Index Usage](https://www.postgresql.org/docs/current/indexes.html)
