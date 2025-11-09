import { createClient } from '@supabase/supabase-js';

// Получаем переменные окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверяем наличие переменных
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
  throw new Error('Missing Supabase environment variables. Check console for details.');
}

// Создаём клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

