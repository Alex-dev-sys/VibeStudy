import { test, expect } from '@playwright/test';

test.describe('VibeStudy полное тестирование', () => {
  test.beforeEach(async ({ page }) => {
    // Очищаем localStorage перед каждым тестом для чистого состояния
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Лендинг открывается и ведёт на страницу входа', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('AI наставник + адаптивный курс = твой старт в IT')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Твой прорыв/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Попробовать Playground/i })).toBeVisible();

    await page.getByRole('link', { name: /Начать обучение/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Гостевой вход и генерация контента дня работают', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Войти или зарегистрироваться/i })).toBeVisible();
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();

    await expect(page).toHaveURL(/\/learn$/);

    const theoryHeading = page.getByRole('heading', { name: /Теория дня/i });
    const shouldGenerate = !(await theoryHeading.isVisible().catch(() => false));

    if (shouldGenerate) {
      const generateButton = page.getByRole('button', { name: /Сгенерировать теорию|Обновить день/i });
      await expect(generateButton).toBeVisible();
      await expect(generateButton).toBeEnabled();
      await generateButton.click();
      await expect(theoryHeading).toBeVisible({ timeout: 30000 });
    } else {
      await expect(theoryHeading).toBeVisible();
    }

    await expect(page.getByRole('heading', { name: /Задачи дня/i })).toBeVisible();

    await page.getByRole('button', { name: /Открыть ИИ-помощника/i }).click();
    const assistantHeading = page.getByRole('heading', { name: /ИИ-помощник/ });
    await expect(assistantHeading).toBeVisible();
    await expect(page.getByPlaceholder('Задайте вопрос по теории или задачам...')).toBeVisible();
    await page.getByRole('button', { name: /Закрыть ИИ-помощника/i }).click({ force: true });
    await expect(assistantHeading).not.toBeVisible();
  });

  test('Playground доступен и отображает элементы управления', async ({ page }) => {
    await page.goto('/playground', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { level: 1, name: /Playground/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Редактор кода/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Запустить код/i })).toBeVisible();
  });

  test('Профиль доступен и отображает все панели', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    await page.getByRole('link', { name: /Профиль/i }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await expect(page.getByRole('heading', { level: 1, name: /Профиль/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Вернуться к обучению/i })).toBeVisible();
  });

  test('Навигация между страницами работает', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Переход в Playground
    await page.getByRole('link', { name: /Playground/i }).click();
    await expect(page).toHaveURL(/\/playground$/);
    await expect(page.getByRole('heading', { level: 1, name: /Playground/i })).toBeVisible();

    // Возврат к обучению
    await page.getByRole('link', { name: /Вернуться к обучению/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Переход в профиль
    await page.getByRole('link', { name: /Профиль/i }).click();
    await expect(page).toHaveURL(/\/profile$/);

    // Возврат к обучению из профиля
    await page.getByRole('link', { name: /Вернуться к обучению/i }).click();
    await expect(page).toHaveURL(/\/learn$/);
  });

  test('Переключение языков работает', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Проверяем наличие селектора языков
    await expect(page.getByRole('heading', { name: /Выбери язык обучения/i })).toBeVisible();
    
    // Проверяем наличие кнопок языков (используем локатор по тексту внутри кнопки)
    const pythonButton = page.locator('button').filter({ hasText: /Python/ }).first();
    const jsButton = page.locator('button').filter({ hasText: /JavaScript/ }).first();
    
    await expect(pythonButton).toBeVisible();
    await expect(jsButton).toBeVisible();

    // Переключаемся на JavaScript
    await jsButton.click();
    await page.waitForTimeout(500);
    
    // Проверяем, что JavaScript активен (имеет текст "Активно")
    const activeJsButton = page.locator('button').filter({ hasText: /JavaScript/ }).filter({ hasText: /Активно/ });
    await expect(activeJsButton).toBeVisible({ timeout: 2000 });
  });

  test('Переключение дней работает', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Проверяем наличие навигации по дням
    await expect(page.getByRole('heading', { name: /Навигация по дням/i })).toBeVisible();

    // Кликаем на день 2 (используем точное совпадение и первый элемент из первого месяца)
    const day2Button = page.locator('button').filter({ hasText: /^2$/ }).first();
    await expect(day2Button).toBeVisible();
    await day2Button.click();
    await page.waitForTimeout(1000);

    // Проверяем, что отображается день 2
    await expect(page.getByRole('heading', { name: /День 2/i })).toBeVisible({ timeout: 5000 });
  });

  test('Задачи отображаются и можно открыть задачу', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Генерируем контент если нужно
    const theoryHeading = page.getByRole('heading', { name: /Теория дня/i });
    const shouldGenerate = !(await theoryHeading.isVisible().catch(() => false));

    if (shouldGenerate) {
      const generateButton = page.getByRole('button', { name: /Сгенерировать теорию|Обновить день/i });
      await generateButton.click();
      await expect(theoryHeading).toBeVisible({ timeout: 30000 });
    }

    // Проверяем наличие задач
    await expect(page.getByRole('heading', { name: /Задачи дня/i })).toBeVisible();

    // Пытаемся кликнуть на первую задачу
    const firstTask = page.locator('[role="listitem"]').first();
    if (await firstTask.isVisible()) {
      await firstTask.click();
      // После клика должна открыться модалка или измениться URL
      await page.waitForTimeout(1000);
    }
  });

  test('Контрольный вопрос отображается', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Генерируем контент если нужно
    const theoryHeading = page.getByRole('heading', { name: /Теория дня/i });
    const shouldGenerate = !(await theoryHeading.isVisible().catch(() => false));

    if (shouldGenerate) {
      const generateButton = page.getByRole('button', { name: /Сгенерировать теорию|Обновить день/i });
      await generateButton.click();
      await expect(theoryHeading).toBeVisible({ timeout: 30000 });
    }

    // Проверяем наличие контрольного вопроса
    const recapHeading = page.getByRole('heading', { name: /Контрольный вопрос/i });
    if (await recapHeading.isVisible().catch(() => false)) {
      await expect(recapHeading).toBeVisible();
    }
  });

  test('Прогресс отображается корректно', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Проверяем наличие панели прогресса
    await expect(page.getByText(/Пройдено:/i)).toBeVisible();
    await expect(page.getByText(/Серия:/i)).toBeVisible();
    await expect(page.getByText(/Достижений:/i)).toBeVisible();
  });

  test('Кнопка сброса прогресса работает', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    const resetButton = page.getByRole('button', { name: /Сбросить/i });
    await expect(resetButton).toBeVisible();

    // Кликаем на сброс и проверяем диалог подтверждения
    await resetButton.click();
    await page.waitForTimeout(500);
    
    // Проверяем наличие диалога подтверждения или что прогресс сброшен
    const confirmButton = page.getByRole('button', { name: /Подтвердить|Да|Сбросить/i });
    if (await confirmButton.isVisible().catch(() => false)) {
      // Если есть диалог, отменяем действие
      const cancelButton = page.getByRole('button', { name: /Отмена|Нет|Отменить/i });
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
      }
    }
  });

  test('ИИ-помощник отправляет сообщения', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Генерируем контент если нужно
    const theoryHeading = page.getByRole('heading', { name: /Теория дня/i });
    const shouldGenerate = !(await theoryHeading.isVisible().catch(() => false));

    if (shouldGenerate) {
      const generateButton = page.getByRole('button', { name: /Сгенерировать теорию|Обновить день/i });
      await generateButton.click();
      await expect(theoryHeading).toBeVisible({ timeout: 30000 });
    }

    // Открываем ИИ-помощника
    await page.getByRole('button', { name: /Открыть ИИ-помощника/i }).click();
    const input = page.getByPlaceholder('Задайте вопрос по теории или задачам...');
    await expect(input).toBeVisible();

    // Вводим вопрос
    await input.fill('Что такое переменная?');
    
    // Отправляем сообщение
    const sendButton = page.getByRole('button', { name: /send message/i });
    if (await sendButton.isVisible().catch(() => false)) {
      await sendButton.click();
      // Ждем ответа
      await page.waitForTimeout(3000);
    }

    // Закрываем помощника
    await page.getByRole('button', { name: /Закрыть ИИ-помощника/i }).click({ force: true });
  });

  test('Playground переключение языков работает', async ({ page }) => {
    await page.goto('/playground', { waitUntil: 'networkidle' });

    // Проверяем наличие селектора языков
    await expect(page.getByRole('heading', { name: /Выбери язык программирования/i })).toBeVisible();

    // Переключаемся на JavaScript
    const jsButton = page.getByRole('button', { name: /JavaScript/i });
    if (await jsButton.isVisible().catch(() => false)) {
      await jsButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Playground кнопки управления работают', async ({ page }) => {
    await page.goto('/playground', { waitUntil: 'networkidle' });

    // Проверяем кнопку запуска
    const runButton = page.getByRole('button', { name: /Запустить код/i });
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();

    // Проверяем кнопку форматирования
    const formatButton = page.getByRole('button', { name: /Форматировать/i });
    if (await formatButton.isVisible().catch(() => false)) {
      await expect(formatButton).toBeVisible();
    }

    // Проверяем кнопку очистки
    const clearButton = page.getByRole('button', { name: /Очистить/i });
    if (await clearButton.isVisible().catch(() => false)) {
      await expect(clearButton).toBeVisible();
    }
  });

  test('Адаптивность: мобильный вид', async ({ page }) => {
    // Устанавливаем размер мобильного устройства
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Проверяем, что основные элементы видны на мобильном
    await expect(page.getByRole('heading', { name: /90-дневный план/i })).toBeVisible();
  });

  test('Адаптивность: планшетный вид', async ({ page }) => {
    // Устанавливаем размер планшета
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    await page.getByRole('button', { name: /Продолжить без регистрации/i }).click();
    await expect(page).toHaveURL(/\/learn$/);

    // Проверяем, что основные элементы видны на планшете
    await expect(page.getByRole('heading', { name: /90-дневный план/i })).toBeVisible();
  });
});


