# Настройка Redirect URLs в Supabase

## Ваш проект
- **Название:** VibeStudy
- **Project ID:** qtswuibugwuvgzppkbtq
- **Region:** eu-north-1
- **API URL:** https://qtswuibugwuvgzppkbtq.supabase.co
- **Status:** ✅ ACTIVE_HEALTHY

## Шаги для настройки Redirect URLs

### 1. Откройте Supabase Dashboard
Перейдите по ссылке:
```
https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/auth/url-configuration
```

### 2. Настройте Site URL
В поле **"Site URL"** должно быть:
```
https://vibe-study-c3yn.vercel.app
```

### 3. Добавьте Redirect URLs
В поле **"Redirect URLs"** добавьте (каждый URL на новой строке):
```
https://vibe-study-c3yn.vercel.app/auth/callback
http://localhost:3000/auth/callback
https://vibe-study-c3yn.vercel.app/*
http://localhost:3000/*
```

### 4. Настройте Google OAuth (если еще не настроено)
1. Перейдите в **Authentication → Providers → Google**
2. Включите Google Provider
3. Добавьте Client ID и Client Secret из Google Cloud Console
4. В Google Cloud Console добавьте Authorized redirect URIs:
   ```
   https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback
   ```

### 5. Сохраните изменения
Нажмите **"Save"** внизу страницы

## Проверка настроек в Vercel

Убедитесь, что в Vercel Environment Variables настроены:

1. Откройте: https://vercel.com/your-team/vibe-study-c3yn/settings/environment-variables

2. Проверьте переменные:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qtswuibugwuvgzppkbtq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. После изменения переменных - **Redeploy** проект

## Тестирование

### Локально
```bash
npm run dev
```
1. Откройте http://localhost:3000
2. Нажмите "Начать обучение"
3. Войдите через Google
4. Должен перенаправить на http://localhost:3000/learn

### Production
1. Откройте https://vibe-study-c3yn.vercel.app
2. Если авторизованы - сразу перенаправит на /learn
3. Если нет - нажмите "Начать обучение"
4. Войдите через Google
5. Должен перенаправить на https://vibe-study-c3yn.vercel.app/learn

## Текущий статус

✅ Код исправлен - корневая страница теперь перенаправляет авторизованных пользователей
✅ Callback правильно настроен - перенаправляет на /learn
✅ Environment variables настроены локально
⚠️ Нужно проверить Redirect URLs в Supabase Dashboard
⚠️ Нужно проверить Environment Variables в Vercel

## Что делать, если не работает

1. **Проверьте консоль браузера** (F12) на ошибки
2. **Проверьте Network tab** - куда идет redirect
3. **Проверьте Supabase Logs:**
   ```
   https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/logs/auth-logs
   ```
4. **Очистите cookies и попробуйте снова**
5. **Проверьте, что Google OAuth настроен правильно**

## Полезные ссылки

- Supabase Dashboard: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq
- Auth Logs: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/logs/auth-logs
- URL Configuration: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/auth/url-configuration
- Vercel Dashboard: https://vercel.com
