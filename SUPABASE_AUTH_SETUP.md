# 🔐 Настройка аутентификации через Google

## 📋 Что нужно сделать

Для работы входа через Google нужно настроить OAuth провайдер в Supabase Dashboard.

**Email вход работает сразу без настройки!**

---

## 🔧 Настройка Google OAuth

### Шаг 1: Создать проект в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите тип приложения: **Web application**

### Шаг 2: Настроить OAuth consent screen

1. Перейдите в **OAuth consent screen**
2. Выберите **External** (для тестирования)
3. Заполните обязательные поля:
   - App name: `VibeStudy`
   - User support email: ваш email
   - Developer contact: ваш email
4. Нажмите **Save and Continue**
5. Добавьте scopes (если нужно) и нажмите **Save and Continue**
6. Добавьте тестовых пользователей (ваш email)

### Шаг 3: Получить Client ID и Client Secret

1. Вернитесь в **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Выберите **Web application**
4. Настройте:
   - **Name**: `VibeStudy Web`
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3000
     https://qtswuibugwuvgzppkbtq.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
5. Нажмите **Create**
6. Скопируйте **Client ID** и **Client Secret**

### Шаг 4: Добавить в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект **qtswuibugwuvgzppkbtq**
3. Перейдите в **Authentication** → **Providers**
4. Найдите **Google** и нажмите **Enable**
5. Вставьте:
   - **Client ID** (из Google Cloud Console)
   - **Client Secret** (из Google Cloud Console)
6. Нажмите **Save**

---

## ✅ Проверка

После настройки:

1. Перезапустите dev сервер:
   ```bash
   npm run dev
   ```

2. Откройте [http://localhost:3000](http://localhost:3000)

3. Нажмите **"Начать обучение"**

4. Попробуйте войти через Google или Email

5. После успешного входа вы будете перенаправлены на `/dashboard`

---

## 🐛 Частые проблемы

### Ошибка: "redirect_uri_mismatch"

**Решение:**
- Проверьте, что redirect URI в Google совпадает с:
  ```
  https://qtswuibugwuvgzppkbtq.supabase.co/auth/v1/callback
  ```

### Ошибка: "Invalid client"

**Решение:**
- Проверьте, что Client ID и Client Secret скопированы правильно
- Убедитесь, что провайдер включён в Supabase Dashboard

### Вход не работает локально

**Решение:**
- Добавьте `http://localhost:3000` в Authorized origins (Google)
- Добавьте `http://localhost:3000/auth/callback` в Authorized redirect URIs

---

## 🚀 Готово!

Теперь пользователи могут:
- ✅ Войти через Google в 1 клик
- ✅ Войти через Email (Magic Link)
- ✅ Автоматически создаётся профиль в Supabase
- ✅ Прогресс сохраняется в облаке

---

## 📚 Полезные ссылки

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Email Auth](https://supabase.com/docs/guides/auth/auth-email)

