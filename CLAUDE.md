# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm test           # Run unit tests with Vitest + Angular TestBed
npm run build      # Production build
npm run watch      # Incremental dev build (watch mode)
```

No linting command is configured. Formatting is handled by Prettier (100-char line width, single quotes, Angular HTML parser).

## Architecture

**PhotoMat** is an Angular 21 SPA using standalone components (no NgModules) and Angular signals for reactive state.

Bootstrap chain: `src/main.ts` → `bootstrapApplication(App, appConfig)` → `src/app/app.config.ts` (provides router and global error listeners) → `src/app/app.ts` (root component with `RouterOutlet`).

Routes are defined in `src/app/app.routes.ts` (currently empty). New feature routes should be added there and lazy-loaded.

**Conventions:**
- All components are standalone — import dependencies directly in the component's `imports` array, not through shared modules.
- Prefer Angular signals (`signal()`, `computed()`) over RxJS for local component state.
- TypeScript strict mode is enabled; all configs extend `tsconfig.json`.
- Tests live alongside source files (`*.spec.ts`) and use `TestBed` from `@angular/core/testing`.
