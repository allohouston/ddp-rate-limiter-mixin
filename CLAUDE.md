# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`ddp-rate-limiter-mixin` is an npm package that provides a mixin for Meteor's `mdg:validated-method`. It wraps `DDPRateLimiter.addRule()` so rate limits are declared inline when defining a `ValidatedMethod`, rather than as separate side-effect calls.

The mixin is **server-only** — on the client it returns `methodOptions` unchanged. Compatible with **Meteor 3.4+**.

## Commands

```bash
npm test              # Vitest (run once)
npm run test:coverage # Vitest with v8 coverage (100% threshold)
npm run test:watch    # Vitest in watch mode
npm run lint          # Biome check (lint + format)
npm run lint:fix      # Biome auto-fix
npm run format        # Biome format --write
npm run build         # tsdown → dist/ (ESM + CJS + .d.ts)
```

## Architecture

TypeScript source in `src/`, built to dual ESM/CJS via tsdown:

- **`src/rate-limiter.ts`** — The entire library. Exports `RateLimiterMixin`. Validates `rateLimit` config, calls `DDPRateLimiter.addRule()`, optionally sets `errorMessage`, returns new `methodOptions` with `rateLimitRuleId`.
- **`src/types.ts`** — All TypeScript interfaces (`MethodOptions`, `RateLimitConfig`, `RateLimitMatcher`, etc.).
- **`src/meteor.d.ts`** — Global type declarations for `Meteor` and `DDPRateLimiter` (runtime globals, not importable).
- **`src/index.ts`** — Re-exports from `rate-limiter.ts` and types.
- **`src/__tests__/`** — Vitest tests with global Meteor/DDPRateLimiter mocks (`setup.ts`).

## Build & Publish

tsdown compiles `src/` → `dist/` with ESM (`.mjs`), CJS (`.cjs`), and type declarations (`.d.mts`, `.d.cts`). Published to npm via semantic-release on push to `main`.

## Key Constraints

- `DDPRateLimiter` and `Meteor` are Meteor globals — declared in `src/meteor.d.ts`, mocked in tests via `globalThis`.
- The mixin must always return `methodOptions` (ValidatedMethod pattern). It returns a **new object** (immutable — no mutation).
- `setErrorMessageOnRule` is guarded with `typeof` check for backward compatibility with Meteor 2.
- `rateLimit.numRequests` and `rateLimit.timeInterval` are required numbers; `matcher`, `callback`, and `errorMessage` are optional.

## Tooling

- **Biome** for lint + format (replaces ESLint + Prettier)
- **Vitest** for testing with v8 coverage
- **tsdown** for building (powered by Rolldown)
- **Husky + commitlint** for conventional commits
- **semantic-release** for automated npm publishing
- **GitHub Actions** for CI (lint, test, build) and release
