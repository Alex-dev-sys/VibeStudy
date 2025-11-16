# Security Best Practices for MCP Supabase Integration

This document outlines security considerations and best practices for using the Supabase MCP integration safely and responsibly.

## Overview

The MCP Supabase integration uses the **service role key** which provides full administrative access to your database, bypassing Row Level Security (RLS) policies. This power requires careful handling to maintain security.

## Credential Management

### 1. Environment Variables

**✅ CORRECT Configuration**:

```bash
# .env.local (gitignored)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```json
// .mcp.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

**❌ INCORRECT Configuration**:

```json
// .mcp.json - NEVER DO THIS!
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

**Why**: Hardcoded credentials in `.mcp.json` can be accidentally committed to git and exposed publicly.

---

### 2. Git Configuration

**Required**: Ensure `.env.local` is in `.gitignore`

```bash
# .gitignore
.env.local
.env*.local
.env.production
```

**Verify**:
```bash
git status
# .env.local should NOT appear in untracked files
```

**If accidentally committed**:
```bash
# Remove from git history
git rm --cached .env.local
git commit -m "Remove .env.local from git"

# Rotate credentials immediately!
# Go to Supabase Dashboard -> Settings -> API -> Reset service role key
```

---

### 3. Key Rotation

**Best Practice**: Rotate service role key periodically

**When to Rotate**:
- Every 90 days (recommended)
- After team member departure
- If key is suspected to be compromised
- After accidental exposure

**How to Rotate**:
1. Go to Supabase Dashboard
2. Settings → API
3. Click "Reset" next to Service Role Key
4. Update `.env.local` with new key
5. Restart Kiro AI assistant

---

### 4. Access Control

**Who Should Have Access**:
- ✅ Trusted developers
- ✅ AI assistant (Kiro) for analytics
- ❌ Frontend applications
- ❌ Public APIs
- ❌ Untrusted third parties

**Principle**: Service role key = admin access. Treat it like a root password.

---

## Query Safety

### 1. SQL Injection Prevention

**✅ SAFE - Parameterized Queries**:

```sql
-- Using placeholders
SELECT * FROM users WHERE id = $1;
SELECT * FROM user_progress WHERE user_id = $1 AND topic_id = $2;
```

**How to Ask Kiro**:
```
Query users table with ID parameter using $1 placeholder
```

**❌ UNSAFE - String Concatenation**:

```sql
-- NEVER DO THIS!
SELECT * FROM users WHERE username = 'user_input';
SELECT * FROM users WHERE id = user_input;
```

**Why Unsafe**: Allows SQL injection attacks like:
```
user_input = "1 OR 1=1; DROP TABLE users; --"
```

---

### 2. Query Validation

**Best Practice**: Validate queries before execution

**Validation Checklist**:
- [ ] Uses parameterized queries for dynamic values
- [ ] Includes `LIMIT` clause for large result sets
- [ ] Only queries necessary columns (avoid `SELECT *`)
- [ ] Doesn't expose sensitive data unnecessarily
- [ ] Uses appropriate indexes for performance

**Example Validation**:
```sql
-- Good: Limited, specific, parameterized
SELECT username, email 
FROM users 
WHERE id = $1 
LIMIT 1;

-- Bad: Unlimited, all columns, no parameters
SELECT * FROM users;
```

---

### 3. Read-Only Preference

**Best Practice**: Prefer SELECT queries over INSERT/UPDATE/DELETE

**Why**: Minimize risk of accidental data modification

**Allowed Operations**:
- ✅ `SELECT` - Read data for analytics
- ⚠️ `INSERT` - Only when necessary (e.g., caching)
- ⚠️ `UPDATE` - Only for specific use cases
- ❌ `DELETE` - Avoid unless absolutely required
- ❌ `DROP` - Never allow
- ❌ `TRUNCATE` - Never allow

**How to Restrict**: Review queries before execution

---

## Data Privacy

### 1. PII (Personally Identifiable Information)

**Sensitive Data**:
- Email addresses
- User IDs (when linked to real identities)
- IP addresses
- Authentication tokens

**Best Practices**:

**✅ DO**:
```sql
-- Aggregate data (no PII)
SELECT 
  COUNT(*) as user_count,
  AVG(score) as avg_score
FROM user_progress
GROUP BY topic_id;

-- Anonymized data
SELECT 
  LEFT(email, 3) || '***' as masked_email,
  score
FROM users
JOIN user_progress ON users.id = user_progress.user_id;
```

**❌ DON'T**:
```sql
-- Exposing PII unnecessarily
SELECT username, email, created_at 
FROM users;

-- Linking PII to behavior
SELECT email, task_id, code 
FROM users 
JOIN task_attempts ON users.id = task_attempts.user_id;
```

---

### 2. Data Minimization

**Principle**: Only query data you actually need

**Example**:

**Good**:
```sql
-- Only need username and score
SELECT username, score 
FROM users 
JOIN user_progress ON users.id = user_progress.user_id;
```

**Bad**:
```sql
-- Querying unnecessary columns
SELECT * 
FROM users 
JOIN user_progress ON users.id = user_progress.user_id;
```

---

### 3. Response Filtering

**Best Practice**: Filter sensitive data from AI responses

**Example Workflow**:
1. Query returns user data including emails
2. AI should summarize without exposing emails
3. Present aggregated insights instead of raw data

**Good Response**:
```
"There are 150 users who completed Python basics, with an average score of 85%."
```

**Bad Response**:
```
"Users: john@example.com (90%), jane@example.com (80%), ..."
```

---

## RLS (Row Level Security) Context

### Understanding RLS Bypass

**Frontend (Next.js)**:
```typescript
// Uses anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// RLS policies enforced
// Users can only see their own data
const { data } = await supabase
  .from('user_progress')
  .select('*');
// Returns only current user's progress
```

**MCP (AI Assistant)**:
```typescript
// Uses service role key
// RLS policies BYPASSED
// Can see ALL users' data
```

### Security Implications

**✅ Advantages**:
- AI can perform cross-user analytics
- Generate platform-wide insights
- Monitor system health

**⚠️ Risks**:
- AI has access to all user data
- No automatic privacy protection
- Requires careful query design

**Mitigation**:
- Design queries with privacy in mind
- Aggregate data when possible
- Don't expose individual user data unnecessarily

---

## Audit and Monitoring

### 1. Query Logging

**Best Practice**: Log all MCP queries for audit

**What to Log**:
- Query text
- Parameters used
- Execution time
- Result row count
- Timestamp
- User who initiated (if applicable)

**Example Log Entry**:
```json
{
  "timestamp": "2025-11-16T10:30:00Z",
  "query": "SELECT COUNT(*) FROM users WHERE created_at > $1",
  "params": ["2025-11-01"],
  "execution_time_ms": 45,
  "row_count": 1,
  "initiated_by": "kiro_ai"
}
```

---

### 2. Anomaly Detection

**Monitor For**:
- Unusual query patterns
- Large result sets
- Frequent errors
- Slow queries
- Queries accessing sensitive tables

**Alert Triggers**:
- Query returns > 10,000 rows
- Query takes > 30 seconds
- Multiple failed queries in short time
- Queries to sensitive tables (if any)

---

### 3. Regular Security Reviews

**Schedule**: Monthly security review

**Review Checklist**:
- [ ] Service role key not exposed in git
- [ ] `.env.local` properly gitignored
- [ ] No hardcoded credentials in code
- [ ] Query logs reviewed for anomalies
- [ ] No PII exposed in AI responses
- [ ] RLS policies still appropriate
- [ ] Key rotation schedule followed

---

## Incident Response

### If Service Role Key is Compromised

**Immediate Actions** (within 1 hour):

1. **Rotate Key**:
   - Go to Supabase Dashboard
   - Settings → API → Reset Service Role Key
   - Update `.env.local` immediately

2. **Review Logs**:
   - Check Supabase logs for unauthorized access
   - Identify what data was accessed
   - Document timeline of exposure

3. **Assess Impact**:
   - What data was potentially accessed?
   - Were any modifications made?
   - Are users affected?

4. **Notify Stakeholders**:
   - Inform team members
   - If user data compromised, follow data breach protocol
   - Document incident

**Follow-up Actions** (within 24 hours):

5. **Investigate Root Cause**:
   - How was key exposed?
   - What process failed?
   - How to prevent recurrence?

6. **Implement Fixes**:
   - Update security procedures
   - Add additional safeguards
   - Train team on best practices

7. **Monitor**:
   - Watch for suspicious activity
   - Verify new key is secure
   - Confirm no ongoing unauthorized access

---

## Development vs Production

### Development Environment

**Configuration**:
```bash
# .env.local (development)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=local_dev_key
```

**Best Practices**:
- Use local Supabase instance when possible
- Separate dev database from production
- Test queries in dev before production
- Use dummy data for testing

---

### Production Environment

**Configuration**:
```bash
# Vercel Environment Variables (production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
```

**Best Practices**:
- Never use production keys in development
- Restrict production access to essential personnel
- Enable additional monitoring in production
- Have incident response plan ready

---

## Compliance Considerations

### GDPR (General Data Protection Regulation)

**Requirements**:
- Users have right to access their data
- Users have right to delete their data
- Data must be processed lawfully
- Data minimization principle

**MCP Implications**:
- AI queries must respect user privacy
- Don't expose PII unnecessarily
- Support data deletion requests
- Log data access for audit

---

### Data Retention

**Best Practice**: Define data retention policies

**Example Policy**:
```
- User progress: Retain indefinitely (core feature)
- Task attempts: Retain 1 year
- Generated content cache: Expire after 30 days
- Audit logs: Retain 90 days
```

**Implementation**:
```sql
-- Clean up old cache entries
DELETE FROM generated_content_cache 
WHERE expires_at < NOW();

-- Archive old task attempts
-- (Move to archive table or export)
```

---

## Security Checklist

### Initial Setup
- [ ] Service role key stored in `.env.local`
- [ ] `.env.local` in `.gitignore`
- [ ] MCP config uses environment variable references
- [ ] No credentials hardcoded anywhere
- [ ] Team trained on security practices

### Ongoing Operations
- [ ] Query logs reviewed monthly
- [ ] No PII exposed in AI responses
- [ ] Parameterized queries used consistently
- [ ] Result sets limited appropriately
- [ ] Anomalies investigated promptly

### Periodic Reviews
- [ ] Service role key rotated (every 90 days)
- [ ] Security audit completed (monthly)
- [ ] Incident response plan tested (quarterly)
- [ ] Team security training (annually)
- [ ] Compliance requirements verified (annually)

---

## Additional Resources

### Supabase Security Documentation
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Service Role Key](https://supabase.com/docs/guides/api/api-keys)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)

### SQL Injection Prevention
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-prepare.html)

### Data Privacy
- [GDPR Overview](https://gdpr.eu/)
- [Data Minimization](https://gdpr.eu/data-minimization/)

---

## Contact

For security concerns or questions:
1. Review this document first
2. Check Supabase documentation
3. Consult with team security lead
4. If urgent, follow incident response protocol

**Remember**: Security is everyone's responsibility. When in doubt, ask!
