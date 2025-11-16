# Инструкция по деплою исправления

## Что было исправлено
✅ Корневая страница (`src/app/page.tsx`) теперь перенаправляет авторизованных пользователей на `/learn`

## Шаги для деплоя

### 1. Коммит и пуш изменений
```bash
git add src/app/page.tsx
git commit -m "fix: redirect authenticated users from home to /learn"
git push
```

### 2. Настройте Redirect URLs в Supabase
Откройте: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/auth/url-configuration

Добавьте в **Redirect URLs**:
```
https://vibe-study-c3yn.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

**Site URL:**
```
https://vibe-study-c3yn.vercel.app
```

Нажмите **Save**

### 3. Проверьте Vercel Environment Variables
Убедитесь, что переменные настроены:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Дождитесь автоматического деплоя
Vercel автоматически задеплоит изменения после push

### 5. Тестирование
1. Откройте https://vibe-study-c3yn.vercel.app
2. Войдите через Google
3. Должен перенаправить на https://vibe-study-c3yn.vercel.app/learn ✅

## Если не работает
Смотрите подробные инструкции в `SUPABASE_REDIRECT_SETUP.md`
