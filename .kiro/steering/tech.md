# Tech Stack

## Framework & Runtime

- **Next.js 14.2.8**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5.4.5**: Strict mode enabled, ES2020 target
- **Node.js 18+**: Required runtime

## Styling & UI

- **TailwindCSS 3.4.4**: Utility-first CSS framework
- **Framer Motion 11.2.6**: Animation library
- **Radix UI**: Headless UI components (@radix-ui/react-slot)
- **shadcn/ui**: Component system (New York style)
- **Lucide React**: Icon library
- **Custom Design System**: Dark theme with accent colors (#ff4bc1, #ffd34f)

## State Management

- **Zustand 4.5.2**: Primary state management with persist middleware
- **Stores**: progress-store, achievements-store, profile-store, locale-store, analytics-store, playground-store, knowledge-profile-store, groups-store, onboarding-store

## Code Editor

- **Monaco Editor 4.6.0**: VS Code-powered code editor with syntax highlighting for 7 languages

## Backend & Database

- **Supabase**: PostgreSQL database, authentication (Google OAuth, Magic Link), real-time subscriptions
- **File System Storage**: Local JSON storage in `data/` directory with fallback to memory store
- **API Routes**: Next.js API routes in `src/app/api/`

## AI Integration

- **Hugging Face Router**: AI content generation via `HF_TOKEN`
- **Model**: MiniMaxAI/MiniMax-M2:novita (configurable via `HF_MODEL`)
- **Fallback System**: Graceful degradation when AI unavailable

## External Services

- **Telegram Bot API**: User reminders and progress notifications
- **Vercel**: Deployment platform (optional)

## Testing

- **Playwright 1.56.1**: End-to-end testing
- **ESLint 8.57.0**: Code linting with Next.js config
- **Prettier 3.3.2**: Code formatting

## Build System

- **Next.js Build**: Production optimization
- **PostCSS 8.4.38**: CSS processing
- **Autoprefixer 10.4.17**: CSS vendor prefixes

## Common Commands

```bash
# Development
npm run dev          # Start Next.js + Telegram bot
npm run dev:next     # Start Next.js only (без бота)

# Build & Production
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint check
npm run format       # Prettier formatting

# Telegram Bot
npm run bot          # Run bot locally
npm run bot:test     # Test bot
npm run bot:webhook  # Setup webhook

# Testing
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:headed  # Headed browser mode
npm run test:e2e:debug   # Debug mode
```

## Environment Variables

```bash
# AI (Required for content generation)
HF_TOKEN=hf_your_token
HF_API_BASE_URL=https://router.huggingface.co/v1
HF_MODEL=MiniMaxAI/MiniMax-M2:novita

# Supabase (Optional - for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=your_token
CRON_SECRET=your_secret
```

## Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/store` → `src/store`
- `@/types` → `src/types`

## TypeScript Configuration

- Strict mode enabled
- No JavaScript files allowed (`allowJs: false`)
- Module resolution: bundler
- JSX: preserve (Next.js handles transformation)
