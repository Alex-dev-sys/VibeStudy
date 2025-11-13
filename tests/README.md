# VibeStudy Tests

## E2E Tests (Playwright)

### Запуск тестов

```bash
# Запустить все тесты
npm run test:e2e

# Запустить с UI
npm run test:e2e:ui

# Запустить в headed режиме (видно браузер)
npm run test:e2e:headed

# Запустить в debug режиме
npm run test:e2e:debug
```

### Структура тестов

- `basic-flow.spec.ts` - Базовые тесты UI и функциональности
- `sync.spec.ts` - Тесты синхронизации (требуют Supabase)
- `migration.spec.ts` - Тесты миграции данных (требуют Supabase)

### Примечания

- Тесты синхронизации и миграции помечены как `skip`, так как требуют настроенный Supabase
- Для запуска всех тестов нужно:
  1. Настроить Supabase (добавить переменные окружения)
  2. Убрать `.skip` с тестов
  3. Добавить тестовые учетные данные

### Добавление новых тестов

Создайте новый файл в `tests/e2e/` с суффиксом `.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code
  });
});
```

### CI/CD

Тесты автоматически запускаются в CI с помощью GitHub Actions (когда настроено).
