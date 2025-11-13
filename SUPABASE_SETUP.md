# Настройка Supabase для Production

## Проблема
При регистрации на production сайте (https://vibe-study-c3yn.vercel.app) могут быть проблемы с redirect URL.

## Решение

### 1. Настройка Supabase Dashboard

Зайдите в Supabase Dashboard: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq

#### Authentication → URL Configuration

Добавьте следующие URL в **Site URL** и **Redirect URLs**:

**Site URL:**
```
https://vibe-study-c3yn.vercel.app
```

**Redirect URLs (добавьте все):**
```
http://localhost:3000/auth/callback
https://vibe-study-c3yn.vercel.app/auth/callback
```

### 2. Настройка Vercel Environment Variables

Зайдите в Vercel Dashboard: https://vercel.com/your-project/settings/environment-variables

Добавьте следующие переменные окружения:

```
NEXT_PUBLIC_SUPABASE_URL=https://qtswuibugwuvgzppkbtq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c3d1aWJ1Z3d1dmd6cHBrYnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTc0NjcsImV4cCI6MjA3ODE5MzQ2N30.elUp5IX7YHKJQPQa5SFzhqQVgwZHBfvPw4BuYoIHS6A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c3d1aWJ1Z3d1dmd6cHBrYnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYxNzQ2NywiZXhwIjoyMDc4MTkzNDY3fQ.q3JGkniUcjC4MK6Hm7-qdkSWhcJvj9c1zGSbzvSI81Y
NEXT_PUBLIC_SITE_URL=https://vibe-study-c3yn.vercel.app
HF_TOKEN=uFh6FnpT2PCEuvEgppEIPKDRmHQQnrS-XRLsuXp_IlY
HF_API_BASE_URL=https://api.gptlama.ru/v1
HF_MODEL=gpt-4o-mini
```

### 3. После настройки

1. Сохраните изменения в Supabase
2. Сохраните переменные в Vercel
3. Сделайте redeploy на Vercel (или просто push в git)
4. Проверьте регистрацию на https://vibe-study-c3yn.vercel.app

## Проверка

После настройки попробуйте:
1. Зарегистрироваться через email
2. Войти через Google
3. Проверить, что redirect работает корректно

## Дополнительно

Если используете Google OAuth, также добавьте в Google Cloud Console:
- Authorized JavaScript origins: `https://vibe-study-c3yn.vercel.app`
- Authorized redirect URIs: `https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback`
