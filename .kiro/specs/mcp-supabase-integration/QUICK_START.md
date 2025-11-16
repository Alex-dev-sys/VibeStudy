# Quick Start - MCP Supabase Integration

## ✅ Configuration Complete

MCP Supabase server is now configured in `.kiro/settings/mcp.json`

## 🔄 Next Step: Reconnect MCP Servers

### Option 1: Command Palette (Recommended)
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "MCP"
3. Select **"Reconnect MCP Servers"**

### Option 2: Restart IDE
Simply restart Kiro IDE completely

## 🧪 Test the Integration

After reconnecting, test with these commands:

### Test 1: List Available Tools
Ask Kiro:
```
List all available MCP tools
```

**Expected**: You should see tools including:
- `supabase_query`
- `supabase_get_schema`
- `supabase_list_tables`
- `supabase_get_table_info`

### Test 2: List Database Tables
Ask Kiro:
```
What tables are in the Supabase database?
```

**Expected**: Response should include:
- users
- user_progress
- task_attempts
- user_achievements
- topic_mastery
- generated_content_cache

### Test 3: Query User Progress
Ask Kiro:
```
Show me the latest 5 user achievements
```

**Expected**: Query executes and returns achievement data

## 🔍 Troubleshooting

### MCP Server Not Appearing

**Check Configuration**:
```json
// .kiro/settings/mcp.json should have:
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      },
      "disabled": false
    }
  }
}
```

**Check Environment Variables**:
```bash
# .env.local should have:
SUPABASE_URL=https://qtswuibugwuvgzppkbtq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Connection Errors

If you see connection errors:
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Check network connectivity
4. Try reconnecting MCP servers again

### Tools Not Working

If tools appear but don't work:
1. Check Supabase service status
2. Verify credentials have correct permissions
3. Check MCP server logs for errors
4. Try restarting IDE completely

## 📚 Full Documentation

For detailed information, see:
- [README.md](./README.md) - Complete overview
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - All test scenarios
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Query patterns and examples
- [SECURITY_BEST_PRACTICES.md](./SECURITY_BEST_PRACTICES.md) - Security guidelines

## 🎯 Success Criteria

Integration is working when:
- ✅ Supabase MCP tools appear in available tools
- ✅ Can list database tables
- ✅ Can execute queries
- ✅ Queries return data in < 500ms
- ✅ No error messages

## 💡 Example Queries to Try

Once working, try these:

```
1. "What's the average mastery level by topic?"
2. "Show me users who completed more than 10 topics"
3. "What are the most popular achievements?"
4. "Show me recent task attempts"
5. "Give me a performance report for users"
```

---

**Current Status**: Configuration complete, waiting for MCP server reconnection

**Next Action**: Reconnect MCP servers using Command Palette
