# Daily Challenge Generation API

This API endpoint generates daily coding challenges for all supported programming languages.

## Endpoint

`POST /api/cron/generate-challenge`

## Authentication

The endpoint requires a `CRON_SECRET` for security. Include it in the Authorization header:

```
Authorization: Bearer YOUR_CRON_SECRET
```

## How It Works

1. Checks if a challenge already exists for today's date for each language
2. If not, generates a new challenge using AI
3. Saves the challenge to the `daily_challenges` table in Supabase
4. Returns a summary of successful, failed, and skipped generations

## Response Format

```json
{
  "success": true,
  "date": "2025-11-21",
  "results": {
    "success": ["python", "javascript", "typescript"],
    "failed": ["java"],
    "skipped": ["cpp", "go", "csharp"]
  }
}
```

## Challenge Structure

Each generated challenge includes:

- **problem**: Problem description with input/output format, examples, and constraints
- **test_cases**: Array of test cases (mix of visible and hidden)
- **difficulty**: Challenge difficulty level (easy, medium, hard)
- **metadata**: Topics covered and estimated completion time

## Manual Testing

In development mode, you can trigger generation manually:

```bash
curl -X POST http://localhost:3000/api/cron/generate-challenge
```

In production, use the cron secret:

```bash
curl -X POST https://your-domain.com/api/cron/generate-challenge \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Duplicate Prevention

The endpoint automatically checks for existing challenges for the current date and language combination. If a challenge already exists, it will be skipped to avoid duplicates.

## Error Handling

- Returns 401 if authentication fails
- Returns 503 if AI service is not configured
- Returns 500 for other errors
- Individual language failures don't stop the entire process

## Scheduling

This endpoint is designed to be called by a cron job (see task 20 for Vercel Cron setup).
Recommended schedule: Daily at 00:00 UTC

## Environment Variables Required

- `CRON_SECRET`: Secret for authenticating cron requests
- `AI_API_TOKEN`: Token for AI service (GPT Llama API)
- `AI_API_BASE_URL`: Base URL for AI service
- Supabase credentials (for database access)
