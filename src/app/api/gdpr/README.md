# GDPR Compliance API

This directory contains API endpoints for GDPR compliance, allowing users to exercise their data rights.

## Endpoints

### GET /api/gdpr/export

Exports all user data in JSON format for GDPR compliance (Right to Data Portability).

**Authentication:** Required (user must be signed in)

**Rate Limit:** 100 requests per minute

**Response Format:**
```json
{
  "success": true,
  "data": {
    "exportDate": "2025-11-21T10:30:00.000Z",
    "userId": "uuid",
    "profile": { /* user profile data */ },
    "progress": [ /* learning progress records */ ],
    "taskAttempts": [ /* task attempt history */ ],
    "achievements": [ /* unlocked achievements */ ],
    "topicMastery": [ /* topic mastery data */ ],
    "telegramProfile": { /* telegram profile if linked */ },
    "reminderSchedules": [ /* reminder settings */ ],
    "telegramMessages": [ /* telegram message history */ ],
    "learningAnalytics": [ /* daily analytics */ ],
    "botConversations": [ /* bot conversation state */ ],
    "aiQuestionTracking": [ /* AI question usage */ ],
    "payments": [ /* payment history */ ],
    "referrals": [ /* referral data */ ],
    "aiFeedback": [ /* AI feedback submissions */ ]
  },
  "message": "Your data has been successfully exported..."
}
```

**Headers:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="vibestudy-data-export-{userId}-{timestamp}.json"`

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error during export

**Usage Example:**
```typescript
const response = await fetch('/api/gdpr/export', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vibestudy-export-${Date.now()}.json`;
  a.click();
}
```

## Data Included

The export includes all personal data stored in the following tables:
- `users` - User profile and account settings
- `user_progress` - Learning progress by topic
- `task_attempts` - All task submission attempts
- `user_achievements` - Unlocked achievements
- `topic_mastery` - Topic mastery levels
- `user_telegram_profiles` - Telegram profile data
- `reminder_schedules` - Reminder preferences
- `telegram_messages` - Telegram message history
- `learning_analytics` - Daily learning analytics
- `bot_conversations` - Bot conversation state
- `ai_question_tracking` - AI question usage tracking
- `payments` - Payment transaction history
- `referrals` - Referral program data
- `ai_feedback` - AI content feedback

## Implementation Notes

- All queries use Row Level Security (RLS) policies to ensure users can only access their own data
- Failed queries for individual tables are logged but don't block the entire export
- The endpoint gracefully handles missing data (returns empty arrays)
- Export includes both referrals where user is referrer and where user is referred
- All timestamps are in ISO 8601 format (UTC)

## Future Enhancements

- [ ] Add support for CSV export format
- [ ] Add support for PDF export format
- [ ] Implement email delivery for large exports
- [ ] Add compression for large data sets
- [ ] Add progress indicator for long-running exports
