---
inclusion: always
---

# Context7 Usage Guidelines

## When to Use Context7

You MUST use Context7 in the following scenarios:

1. **Before writing new code:**
   - Search for similar implementations: `mcp_context7_get_library_docs`
   - Find related patterns in the codebase
   - Check existing utilities and helpers

2. **When modifying existing code:**
   - Search for all usages of the function/component
   - Find related files that might be affected
   - Check for similar patterns to maintain consistency

3. **When debugging:**
   - Search for error messages in the codebase
   - Find similar bug fixes
   - Locate related test files

4. **When refactoring:**
   - Find all instances of the pattern being refactored
   - Identify dependencies and related code
   - Ensure consistency across the codebase

## How to Use Context7

### For Library Documentation
```
1. First resolve library ID: mcp_context7_resolve_library_id
2. Then get docs: mcp_context7_get_library_docs
```

### Search Strategy
- Use specific topics: "authentication", "state management", "API routes"
- Increase tokens for complex topics (default: 5000, max: 10000)
- Focus on relevant parts of the codebase

## Project-Specific Context

For VibeStudy project, use Context7 when working with:
- **State Management**: Zustand stores in `src/store/`
- **API Routes**: Next.js routes in `src/app/api/`
- **Components**: React components in `src/components/`
- **Supabase Integration**: Database queries in `src/lib/supabase/`
- **i18n**: Translations in `src/lib/i18n/`

## Example Workflow

Before creating a new API route:
1. Search Context7 for existing API patterns
2. Check authentication patterns
3. Review error handling approaches
4. Maintain consistency with existing routes

## Remember

Context7 helps maintain code consistency and avoid reinventing the wheel. Use it proactively, not reactively.
