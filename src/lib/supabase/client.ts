import { createClient } from '@supabase/supabase-js';

// Получаем переменные окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверяем наличие переменных
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase не настроен. Работа в гостевом режиме (только localStorage).');
  console.warn('Для сохранения прогресса в облаке добавьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local');
}

// Создаём клиент Supabase (или null, если переменные не заданы)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

