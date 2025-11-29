@echo off
echo Adding files...
git add src/lib/telegram/database.ts
git add src/lib/telegram/services/leaderboard.ts
git add src/components/dashboard/TheoryBlock.tsx
git add src/app/api/analytics/insights/route.ts
git add src/store/analytics-store.ts
git add src/app/api/ai-feedback/route.ts
git add src/components/ai/FeedbackButtons.tsx

echo Checking status...
git status --short

echo Creating commit...
git commit -m "fix: исправлены ошибки и улучшен дизайн" -m "- Исправлены ошибки типизации в telegram/database.ts" -m "- Исправлена ошибка с group() в leaderboard" -m "- Улучшен дизайн компонента TheoryBlock (более мягкие цвета)" -m "- Исправлена обработка ошибок аналитики" -m "- Создана таблица ai_feedback и исправлена отправка фидбека"

echo Pushing to git...
git push

echo Done!

