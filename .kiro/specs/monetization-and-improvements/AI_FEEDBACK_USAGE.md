# AI Feedback System - Usage Guide

## Overview

The AI Feedback System allows users to provide quick feedback on AI-generated content throughout the platform. This helps improve AI quality and provides valuable analytics.

## Where Feedback Appears

### 1. Theory Blocks (Day Learning)
- Location: Top-right corner (desktop) or bottom (mobile)
- Content: AI-generated theory explanations
- When: After theory is generated for a day

### 2. Task Explanations
- Location: Below the code check result
- Content: AI feedback on code solutions
- When: After checking a solution (success or failure)

### 3. Hints
- Location: Below each hint in the hints history
- Content: AI-generated hints for tasks
- When: After requesting a hint

## How It Works

### User Flow
1. User views AI-generated content
2. "Полезно?" prompt appears with 👍/👎 buttons
3. User clicks one button
4. Button highlights (green for 👍, red for 👎)
5. "Спасибо за отзыв!" message appears
6. Buttons become disabled (one feedback per content)

### Technical Flow
1. User clicks feedback button
2. Component calls `/api/ai-feedback` POST endpoint
3. API validates authentication and input
4. Feedback saved to `ai_feedback` table in Supabase
5. Component updates UI to show confirmation

## API Endpoint

### POST /api/ai-feedback

**Request Body:**
```json
{
  "contentType": "theory" | "hint" | "explanation" | "task",
  "contentKey": "python-day-5-theory",
  "feedbackType": "positive" | "negative",
  "metadata": {
    "language": "python",
    "day": 5,
    "topic": "Variables and Data Types"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "content_type": "theory",
    "content_key": "python-day-5-theory",
    "feedback_type": "positive",
    "metadata": { ... },
    "created_at": "2025-11-20T..."
  }
}
```

**Response (Error):**
```json
{
  "error": "Unauthorized" | "Missing required fields" | "Invalid feedback type"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (not logged in)
- `500` - Server error

## Database Schema

### Table: ai_feedback

```sql
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_key TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_ai_feedback_user_id` - User queries
- `idx_ai_feedback_content` - Content lookup
- `idx_ai_feedback_created_at` - Time-based analytics

### RLS Policies
- Users can insert their own feedback
- Users can view their own feedback
- Service role can view all (for analytics)

## Content Key Format

Content keys follow a structured format for easy identification:

### Theory
```
{languageId}-day-{dayNumber}-theory
Example: python-day-5-theory
```

### Explanation
```
{languageId}-day-{day}-task-{taskId}-explanation
Example: javascript-day-10-task-abc123-explanation
```

### Hint
```
{languageId}-day-{day}-task-{taskId}-hint-{hintNumber}
Example: typescript-day-15-task-def456-hint-1
```

### Task
```
{languageId}-day-{day}-task-{taskId}
Example: python-day-20-task-ghi789
```

## Metadata Structure

Metadata provides context for analytics:

### Theory Metadata
```typescript
{
  language: string,    // e.g., "python"
  day: number,         // e.g., 5
  topic: string        // e.g., "Variables and Data Types"
}
```

### Explanation Metadata
```typescript
{
  language: string,    // e.g., "javascript"
  day: number,         // e.g., 10
  taskId: string,      // e.g., "abc123"
  success: boolean,    // true if solution was correct
  difficulty: string   // e.g., "medium"
}
```

### Hint Metadata
```typescript
{
  language: string,    // e.g., "typescript"
  day: number,         // e.g., 15
  taskId: string,      // e.g., "def456"
  hintNumber: number,  // e.g., 1 (first hint)
  difficulty: string   // e.g., "hard"
}
```

## Analytics Queries

### Get feedback summary by content type
```sql
SELECT 
  content_type,
  feedback_type,
  COUNT(*) as count
FROM ai_feedback
GROUP BY content_type, feedback_type
ORDER BY content_type, feedback_type;
```

### Get feedback for specific day
```sql
SELECT 
  content_key,
  feedback_type,
  COUNT(*) as count
FROM ai_feedback
WHERE content_key LIKE 'python-day-5-%'
GROUP BY content_key, feedback_type;
```

### Get user's feedback history
```sql
SELECT 
  content_type,
  content_key,
  feedback_type,
  metadata,
  created_at
FROM ai_feedback
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Get low-rated content
```sql
SELECT 
  content_key,
  SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END) as positive,
  SUM(CASE WHEN feedback_type = 'negative' THEN 1 ELSE 0 END) as negative,
  COUNT(*) as total
FROM ai_feedback
GROUP BY content_key
HAVING SUM(CASE WHEN feedback_type = 'negative' THEN 1 ELSE 0 END) > 
       SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END)
ORDER BY negative DESC;
```

## Component Usage

### Basic Usage
```tsx
import { FeedbackButtons } from '@/components/ai/FeedbackButtons';

<FeedbackButtons
  contentType="theory"
  contentKey="python-day-5-theory"
  metadata={{ language: 'python', day: 5, topic: 'Variables' }}
/>
```

### With Custom Styling
```tsx
<FeedbackButtons
  contentType="hint"
  contentKey="javascript-day-10-task-abc-hint-1"
  metadata={{ language: 'javascript', day: 10, taskId: 'abc', hintNumber: 1 }}
  className="mt-4 justify-end"
/>
```

### Responsive Design
```tsx
{/* Desktop: Show in header */}
<FeedbackButtons
  contentType="theory"
  contentKey={contentKey}
  metadata={metadata}
  className="hidden sm:flex"
/>

{/* Mobile: Show at bottom */}
<div className="flex sm:hidden justify-center">
  <FeedbackButtons
    contentType="theory"
    contentKey={contentKey}
    metadata={metadata}
  />
</div>
```

## Best Practices

### 1. Unique Content Keys
- Always use unique content keys
- Include all relevant identifiers (language, day, task, hint number)
- Use consistent format across the app

### 2. Rich Metadata
- Include as much context as possible
- Add language, day, difficulty, topic, etc.
- Helps with detailed analytics later

### 3. User Experience
- Place buttons near the content they're rating
- Don't interrupt the user flow
- Show confirmation message
- Disable after submission

### 4. Error Handling
- Handle API errors gracefully
- Don't block user if feedback fails
- Log errors for debugging

### 5. Analytics
- Regularly review feedback data
- Identify patterns in negative feedback
- Use insights to improve AI prompts
- Track improvements over time

## Future Enhancements

### Potential Features
1. **Text Feedback**: Optional comment field for detailed feedback
2. **Feedback Reasons**: Predefined reasons (too complex, incorrect, helpful, etc.)
3. **Admin Dashboard**: View and analyze all feedback
4. **AI Improvement Loop**: Automatically adjust prompts based on feedback
5. **User Feedback History**: Show users their past feedback
6. **Feedback Trends**: Track quality improvements over time
7. **A/B Testing**: Compare different AI models using feedback

### Implementation Ideas
```tsx
// Extended feedback with comment
<FeedbackButtons
  contentType="theory"
  contentKey={contentKey}
  metadata={metadata}
  allowComment={true}
  onFeedbackSubmit={(type, comment) => {
    // Handle feedback with optional comment
  }}
/>
```

## Troubleshooting

### Feedback not saving
1. Check user is authenticated
2. Verify Supabase connection
3. Check RLS policies are applied
4. Review browser console for errors

### Buttons not appearing
1. Verify component is imported correctly
2. Check contentKey is unique and valid
3. Ensure metadata is properly formatted
4. Check responsive classes (hidden/flex)

### Duplicate feedback
1. Ensure buttons are disabled after submission
2. Check for multiple component instances
3. Verify contentKey uniqueness

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify migration was applied
4. Check RLS policies
5. Review API endpoint logs
