# 🔐 Настройка Google OAuth для VibeStudy

## Проблема
**Ошибка 400: redirect_uri_mismatch** при входе через Google

## ✅ Решение

### 1. Google Cloud Console - OAuth Consent Screen

1. **Открой:** https://console.cloud.google.com/apis/credentials/consent
2. **Выбери тип:** External (для публичного доступа)
3. **Заполни:**
   - App name: `VibeStudy`
   - User support email: твой email
   - Developer contact: твой email
4. **Authorized domains:** добавь:
   ```
   supabase.co
   vercel.app
   ```
5. **Save and Continue**

### 2. Google Cloud Console - Credentials

1. **Открой:** https://console.cloud.google.com/apis/credentials
2. **Create Credentials → OAuth 2.0 Client ID**
3. **Application type:** Web application
4. **Name:** `VibeStudy Web Client`

5. **Authorized JavaScript origins:**
   ```
   https://qtswuibugwuvgzppkbtq.supabase.co
   https://vibe-study-c3yn.vercel.app
   http://localhost:3000
   ```

6. **Authorized redirect URIs:**
   ```
   https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback
   https://vibe-study-c3yn.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

7. **Create** и сохрани:
   - Client ID
   - Client Secret

### 3. Supabase Dashboard - Google Provider

1. **Открой:** https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/auth/providers
2. **Найди Google** в списке провайдеров
3. **Enable** (включи)
4. **Вставь:**
   - Client ID (из Google Cloud Console)
   - Client Secret (из Google Cloud Console)
5. **Authorized Client IDs:** оставь пустым (если не используешь native apps)
6. **Save**

### 4. Supabase Dashboard - URL Configuration

1. **Открой:** https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/auth/url-configuration
2. **Site URL:**
   ```
   https://vibe-study-c3yn.vercel.app
   ```
3. **Redirect URLs:**
   ```
   http://localhost:3000/auth/callback
   https://vibe-study-c3yn.vercel.app/auth/callback
   ```
4. **Save**

### 5. Vercel Environment Variables

1. **Открой:** https://vercel.com/your-project/settings/environment-variables
2. **Добавь (если ещё нет):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qtswuibugwuvgzppkbtq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_key
   NEXT_PUBLIC_SITE_URL=https://vibe-study-c3yn.vercel.app
   ```
3. **Redeploy** проект

## 🧪 Проверка

1. Открой https://vibe-study-c3yn.vercel.app/login
2. Нажми "Войти через Google"
3. Должно открыться окно выбора аккаунта Google
4. После выбора аккаунта должен редирект на `/auth/callback`
5. Затем редирект на главную страницу (авторизован)

## ❓ Частые ошибки

### redirect_uri_mismatch
- ✅ Проверь, что все URI в Google Cloud Console точно совпадают
- ✅ Убедись, что нет лишних пробелов или слешей в конце
- ✅ Подожди 5-10 минут после сохранения (Google кеширует настройки)

### invalid_client
- ✅ Проверь, что Client ID и Secret правильно скопированы в Supabase
- ✅ Убедись, что OAuth Client не удалён в Google Cloud Console

### access_denied
- ✅ Проверь OAuth Consent Screen - должен быть опубликован
- ✅ Добавь свой email в Test Users (если app в Testing mode)

## 📝 Важные URL для справки

**Supabase Callback URL (для Google Cloud Console):**
```
https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback
```

**Production Site URL:**
```
https://vibe-study-c3yn.vercel.app
```

**Local Development URL:**
```
http://localhost:3000
```

## 🎯 Итоговый чеклист

- [ ] Google Cloud Console: OAuth Consent Screen настроен
- [ ] Google Cloud Console: Authorized domains добавлены
- [ ] Google Cloud Console: OAuth Client ID создан
- [ ] Google Cloud Console: JavaScript origins добавлены
- [ ] Google Cloud Console: Redirect URIs добавлены
- [ ] Supabase: Google Provider включен
- [ ] Supabase: Client ID и Secret добавлены
- [ ] Supabase: Site URL установлен
- [ ] Supabase: Redirect URLs добавлены
- [ ] Vercel: Environment Variables добавлены
- [ ] Vercel: Redeploy выполнен
- [ ] Тест: Вход через Google работает

**После выполнения всех шагов Google OAuth должен работать!** 🚀
