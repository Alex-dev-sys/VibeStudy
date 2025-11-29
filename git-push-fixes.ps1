# Git push script
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Add all modified files
& git add src/components/dashboard/TaskModal.tsx
& git add src/components/dashboard/DayTimeline.tsx
& git add src/components/dashboard/LanguageSelector.tsx
& git add src/hooks/useScrollLock.ts
& git add src/lib/ai/prompts.ts
& git add src/lib/ai/schemas.ts
& git add src/app/api/generate-tasks/route.ts

# Commit
& git commit -m "Fix: improve task modal scroll, remove hover scale effects, optimize editor loading"

# Push
& git push

