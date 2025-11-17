// Скрипт для проверки целостности файлов локализации
const { ru } = require('../src/lib/i18n/locales/ru.ts');
const { en } = require('../src/lib/i18n/locales/en.ts');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const ruKeys = getAllKeys(ru);
const enKeys = getAllKeys(en);

console.log('🔍 Проверка файлов локализации...\n');

// Проверяем, есть ли в EN ключи, которых нет в RU
const missingInRu = enKeys.filter(key => !ruKeys.includes(key));
if (missingInRu.length > 0) {
  console.log('❌ Отсутствуют в RU:');
  missingInRu.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

// Проверяем, есть ли в RU ключи, которых нет в EN
const missingInEn = ruKeys.filter(key => !enKeys.includes(key));
if (missingInEn.length > 0) {
  console.log('❌ Отсутствуют в EN:');
  missingInEn.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInRu.length === 0 && missingInEn.length === 0) {
  console.log('✅ Все ключи локализации совпадают!');
  console.log(`📊 Всего ключей: ${ruKeys.length}`);
} else {
  console.log(`\n📊 Статистика:`);
  console.log(`  RU: ${ruKeys.length} ключей`);
  console.log(`  EN: ${enKeys.length} ключей`);
  process.exit(1);
}
