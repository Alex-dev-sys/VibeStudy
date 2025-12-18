# Configuration Directory

This directory contains project configuration files organized by category.

## Structure

### `/env/` - Environment Configuration
- `.env.example` - Template for environment variables
- `.env.local.example` - Local development environment template
- `.env.vps.example` - VPS deployment environment template

**Note:** Active `.env.local` file remains in project root (gitignored)

### `/tools/` - Tool Configuration
- `.eslintrc.json` - ESLint configuration
- `.mcp.json` - MCP server configuration
- `components.json` - shadcn/ui components configuration
- `playwright.config.ts` - Playwright E2E testing configuration
- `vitest.config.ts` - Vitest unit testing configuration
- `ecosystem.bot-only.config.js` - PM2 bot-only ecosystem

## Files Kept in Root

The following config files must remain in project root as they're expected there by their respective tools:

- `package.json` - npm package configuration
- `tsconfig.json` - TypeScript compiler configuration
- `next.config.mjs` - Next.js framework configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `vercel.json` - Vercel deployment configuration
- `.env.local` - Active environment variables (gitignored)
