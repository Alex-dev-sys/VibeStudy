# 🔧 Исправление входа на Vercel

## ❌ Проблемы которые были:

1. **404 ошибка** - редирект на несуществующий `/dashboard`
2. **Вход не работает на Vercel** - отсутствуют Environment Variables

---

## ✅ Что исправлено:

### 1. **Изменён редирект после авторизации**
- ❌ Было: `/dashboard` (не существует)
- ✅ Стало: `/learn` (страница обучения)

### 2. **Файлы изменены:**
- `src/app/auth/callback/route.ts` - редирект на `/learn`
- `src/app/login/page.tsx` - проверка пользователя → `/learn`
- `src/lib/supabase/auth.ts` - email redirect → `/learn`

---

## 🚀 Что нужно сделать на Vercel:

### **Добавить Environment Variables:**

1. Откройте [Vercel Dashboard](https://vercel.com)
2. Выберите проект **VibeStudy**
3. **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

#### **Обязательные для входа:**

```
NEXT_PUBLIC_SUPABASE_URL
Значение: https://qtswuibugwuvgzppkbtq.supabase.co
Окружения: Production, Preview, Development
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Значение: ваш_anon_key_из_supabase
Окружения: Production, Preview, Development
```

```
SUPABASE_SERVICE_ROLE_KEY
Значение: ваш_service_role_key_из_supabase
Окружения: Production, Preview, Development
```

```
HF_TOKEN
Значение: hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Окружения: Production, Preview, Development
```

```
HF_API_BASE_URL
Значение: https://router.huggingface.co/v1 (по умолчанию, можно не указывать)
Окружения: Production, Preview, Development
```

```
HF_MODEL
Значение: MiniMaxAI/MiniMax-M2:novita (по умолчанию, можно не указывать)
Окружения: Production, Preview, Development
```

#### **Опциональные (для Telegram бота):**

```
TELEGRAM_BOT_TOKEN
Значение: ваш_telegram_bot_token
Окружения: Production, Preview, Development
```

```
CRON_SECRET
Значение: любая_случайная_строка
Окружения: Production, Preview, Development
```

---

## 📋 Где взять ключи:

### **Supabase:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите проект **qtswuibugwuvgzppkbtq**
3. **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### **Hugging Face:**
1. Откройте [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Создайте новый Access Token с правами `read`
3. Скопируйте → `HF_TOKEN`

---

## 🔄 После добавления переменных:

1. Перейдите в **Deployments**
2. Нажмите **"..."** на последнем деплое
3. Выберите **"Redeploy"**
4. Дождитесь завершения деплоя

---

## ✅ Проверка:

После redeploy:

1. Откройте ваш сайт на Vercel (например, `your-project.vercel.app`)
2. Нажмите **"Начать обучение"**
3. Попробуйте войти через **Google** или **Email**
4. После входа вы должны попасть на страницу `/learn` ✅

---

## 🐛 Если всё ещё не работает:

### **Проверьте переменные:**
1. Vercel Dashboard → Settings → Environment Variables
2. Убедитесь, что **ВСЕ 4 обязательные** переменные добавлены
3. Проверьте, что нет опечаток в названиях
4. Проверьте, что значения скопированы полностью

### **Проверьте консоль браузера:**
1. Откройте сайт на Vercel
2. Нажмите F12 (Developer Tools)
3. Перейдите в **Console**
4. Попробуйте войти
5. Посмотрите на ошибки

### **Проверьте логи Vercel:**
1. Vercel Dashboard → Deployments
2. Выберите последний деплой
3. Нажмите **"View Function Logs"**
4. Посмотрите на ошибки

---

## 🎉 Готово!

После добавления переменных и redeploy вход должен работать! 🚀

**Ссылки:**
- GitHub: https://github.com/Alex-dev-sys/VibeStudy
- Supabase: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq

