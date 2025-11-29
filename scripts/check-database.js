const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Диагностика базы данных...\n');

const supabase = createClient(supabaseUrl, serviceKey);

async function checkDatabase() {
    try {
        // 1. Проверка структуры таблицы
        console.log('1️⃣ Проверка структуры таблицы task_attempts...');
        const { data: columns, error: columnsError } = await supabase
            .from('task_attempts')
            .select('*')
            .limit(0);

        if (columnsError) {
            console.error('❌ Ошибка:', columnsError.message);
            return;
        }
        console.log('✅ Таблица существует');

        // 2. Проверка наличия данных
        console.log('\n2️⃣ Проверка данных в таблице...');
        const { data: attempts, error: attemptsError, count } = await supabase
            .from('task_attempts')
            .select('*', { count: 'exact' })
            .limit(5);

        if (attemptsError) {
            console.error('❌ Ошибка при чтении:', attemptsError.message);
            console.error('   Детали:', attemptsError);
            return;
        }

        console.log(`✅ Записей в таблице: ${count || 0}`);

        if (attempts && attempts.length > 0) {
            console.log('\n📋 Пример записи:');
            console.log(JSON.stringify(attempts[0], null, 2));

            // Проверка полей
            const firstAttempt = attempts[0];
            console.log('\n🔎 Проверка полей аналитики:');
            console.log('   day:', firstAttempt.day !== undefined ? '✅' : '❌');
            console.log('   start_time:', firstAttempt.start_time !== undefined ? '✅' : '❌');
            console.log('   end_time:', firstAttempt.end_time !== undefined ? '✅' : '❌');
            console.log('   success:', firstAttempt.success !== undefined ? '✅' : '❌');
            console.log('   attempts:', firstAttempt.attempts !== undefined ? '✅' : '❌');
        } else {
            console.log('ℹ️  Таблица пустая (это нормально для новых пользователей)');
        }

        // 3. Проверка доступа API
        console.log('\n3️⃣ Тестирование чтения с фильтром...');
        const { data: testData, error: testError } = await supabase
            .from('task_attempts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (testError) {
            console.error('❌ Ошибка при сортировке:', testError.message);
            return;
        }
        console.log('✅ Чтение с сортировкой работает');

        console.log('\n✅ База данных в порядке!');
        console.log('   Если аналитика не работает, проблема в коде API или авторизации');

    } catch (error) {
        console.error('\n❌ Критическая ошибка:', error.message);
    }
}

checkDatabase();
