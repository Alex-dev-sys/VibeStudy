# Скрипт для пуша изменений на git
Write-Host "Добавляю файлы..." -ForegroundColor Cyan
git add src/lib/telegram/database.ts
git add src/lib/telegram/services/leaderboard.ts
git add src/components/dashboard/TheoryBlock.tsx
git add src/app/api/analytics/insights/route.ts
git add src/store/analytics-store.ts

Write-Host "Проверяю статус..." -ForegroundColor Cyan
git status --short

Write-Host "Создаю коммит..." -ForegroundColor Cyan
git commit -m "fix: исправлены ошибки типизации и улучшен дизайн теории

- Исправлены ошибки типизации в telegram/database.ts
- Исправлена ошибка с group() в leaderboard
- Улучшен дизайн компонента TheoryBlock с красивой типографикой
- Исправлена обработка ошибок аналитики"

Write-Host "Пушим на git..." -ForegroundColor Cyan
git push

Write-Host "Готово!" -ForegroundColor Green

